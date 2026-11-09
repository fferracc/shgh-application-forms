import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { trackMetaEvent } from './utils/metaPixel';

// Price configuration: Set to '0.01' for testing. Change to '100.00' for production go-live.
const ENROLLMENT_FEE_GBP = '100.00'; 

function RoboticsEnrollmentForm() {
  const { t, i18n } = useTranslation();
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      parentRelationship: '',
      emergencyRelationship: '',
      medicalConditions: 'None',
      consentPhoto: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [studentAge, setStudentAge] = useState(null);

  // States for payment tracking
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);

  const watchDob = watch("studentDob");
  const watchParentEmail = watch("parentEmail");

  // Calculate age when Date of Birth changes
  useEffect(() => {
    if (watchDob) {
      const birthDate = new Date(watchDob);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setStudentAge(age >= 0 ? age : null);
      } else {
        setStudentAge(null);
      }
    } else {
      setStudentAge(null);
    }
  }, [watchDob]);

  // Load PayPal SDK and render Buttons dynamically
  useEffect(() => {
    if (!isAwaitingPayment || !enrollmentId) return;

    let scriptLoaded = false;
    const scriptId = 'paypal-sdk-script';

    const initializePaypal = () => {
      if (!window.paypal) return;

      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'GBP',
                value: ENROLLMENT_FEE_GBP
              },
              description: `Robotics Course Enrollment - ID: ${enrollmentId}`
            }]
          });
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();
            console.log('PayPal payment captured successfully:', details);

            // Update status in Firestore directly and immediately
            const collectionName = 'roboticsEnrollments_cohort_2';
            const docRef = doc(db, collectionName, enrollmentId);
            await updateDoc(docRef, {
              paymentStatus: 'paid',
              paypalTransactionId: details.id,
              paidAt: new Date().toISOString()
            });

            // Redirect immediately
            window.location.href = `/robotics-success?app_id=${enrollmentId}&cohort=cohort_2`;
          } catch (err) {
            console.error('Error capturing payment or updating database:', err);
            alert('Your payment was captured by PayPal, but we had trouble updating the database. Please contact support.');
          }
        },
        onError: (err) => {
          console.error('PayPal render/payment error:', err);
        }
      }).render('#paypal-button-container');
    };

    // Check if script is already present on page
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      initializePaypal();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=AcY_x9wYcNYfQ2896KQIyLnkDrfNOIys3iL42s-UW1Oa-Z6WrPYyLl5jbxqRFmcmqVboHsZDxLXJykJp&currency=GBP`;
      script.async = true;
      script.onload = () => {
        initializePaypal();
      };
      document.body.appendChild(script);
    }

    return () => {
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';
    };
  }, [isAwaitingPayment, enrollmentId]);

  // Real-time listener for document payment status updates (fallback)
  useEffect(() => {
    let unsubscribe = () => {};

    if (isAwaitingPayment && enrollmentId) {
      const collectionName = 'roboticsEnrollments_cohort_2';
      unsubscribe = onSnapshot(doc(db, collectionName, enrollmentId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.paymentStatus === 'paid') {
            unsubscribe();
            window.location.href = `/robotics-success?app_id=${enrollmentId}&cohort=cohort_2`;
          }
        }
      });
    }

    return () => unsubscribe();
  }, [isAwaitingPayment, enrollmentId]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Track Meta Pixel Lead event immediately when form is submitted
    trackMetaEvent('Lead', {
      content_name: 'Robotics Course Enrollment',
      content_category: 'Cohort 2',
      value: parseFloat(ENROLLMENT_FEE_GBP),
      currency: 'GBP'
    });

    try {
      // Save enrollment to Firestore under cohort 2 with 'pending' payment status
      const collectionName = 'roboticsEnrollments_cohort_2';
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        cohort: 'cohort_2',
        name: data.studentName,
        dob: data.studentDob,
        email: data.parentEmail,
        mobile: data.parentPhone,
        formType: 'robotics',
        paymentStatus: 'pending',
        submittedAt: new Date().toISOString(),
        languageUsed: i18n.language
      });

      const docId = docRef.id;
      setEnrollmentId(docId);
      setIsSubmitting(false);
      setIsAwaitingPayment(true);

      // Track InitiateCheckout event as user moves to payment screen
      trackMetaEvent('InitiateCheckout', {
        content_name: 'Robotics Course Fee',
        value: parseFloat(ENROLLMENT_FEE_GBP),
        currency: 'GBP',
        num_items: 1
      });
    } catch (err) {
      console.error("Error creating enrollment: ", err);
      setSubmitError("Failed to initialize enrollment. Please check your network connection and try again.");
      setIsSubmitting(false);
    }
  };

  const cancelAwaitingPayment = () => {
    setIsAwaitingPayment(false);
    setEnrollmentId(null);
  };

  const isRtl = i18n.language === 'ar' || i18n.language === 'fa';

  const relationships = [
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Guardian', label: 'Legal Guardian' },
    { value: 'Relative', label: 'Other Relative' },
    { value: 'Other', label: 'Other' }
  ];

  // Awaiting Payment View
  if (isAwaitingPayment) {
    return (
      <div className={`relative flex h-auto min-h-screen w-full flex-col max-w-[480px] mx-auto bg-slate-50 dark:bg-background-dark shadow-2xl overflow-x-hidden ${isRtl ? 'rtl' : 'ltr'}`}>
        
        {/* Header */}
        <header className="flex items-center bg-white dark:bg-background-dark p-4 justify-between border-b border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mx-auto">
            <img src="/Sovereign-House-Logo.png" alt="Sovereign House GH Logo" className="h-10 object-contain" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-5 py-12 flex flex-col justify-center text-center space-y-6">
          <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
            
            {/* Spinning pulsations */}
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border-4 border-indigo-100 dark:border-indigo-900/40">
              <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Awaiting Payment...</h1>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                Mandatory Enrollment Fee: £{ENROLLMENT_FEE_GBP === '0.01' ? '0.01 (Testing Mode)' : '100.00'}
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[320px] mx-auto">
              Please complete the enrollment fee payment below using PayPal or credit/debit card.
            </p>

            {/* Embedded PayPal buttons container */}
            <div className="py-2">
              <div id="paypal-button-container" className="w-full min-h-[150px] relative z-0"></div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              If you experience any issues with your payment, please contact us at <a href="mailto:admin@sovereignhousegh.com" className="text-indigo-500 hover:underline">admin@sovereignhousegh.com</a>.
            </p>

            {/* Actions inside the box */}
            <div className="pt-2">
              <button
                onClick={cancelAwaitingPayment}
                className="w-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold py-3 transition-all flex items-center justify-center gap-1.5 text-xs rounded-xl"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Cancel & Edit Form Details
              </button>
            </div>

          </div>

          <span className="inline-block text-[9px] text-slate-400 font-medium">
            Sovereign House GH • Secure Checkout Encrypted by PayPal
          </span>
        </main>

        {/* Footer */}
        <footer className="p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Sovereign House GH • Secure Data Entry</p>
        </footer>

      </div>
    );
  }

  // Form View
  return (
    <div className={`relative flex h-auto min-h-screen w-full flex-col max-w-[480px] mx-auto bg-slate-50 dark:bg-background-dark shadow-2xl overflow-x-hidden ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Header */}
      <header className="flex items-center bg-white dark:bg-background-dark p-4 justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mx-auto">
          <img src="/Sovereign-House-Logo.png" alt="Sovereign House GH Logo" className="h-10 object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6">
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase rounded-full bg-primary/10 mb-2">
            Robotics Level 1
          </span>
          <h1 className="text-slate-900 dark:text-white text-2xl font-extrabold tracking-tight">
            Robotics Course Enrollment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Register your child for the upcoming educational robotics summer course.
          </p>

          {/* Course Schedule Banner */}
          <div className="mt-4 p-4 bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl text-left flex items-start gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">calendar_month</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-block text-[10px] px-2 py-0.5 font-extrabold uppercase tracking-wide rounded-md bg-indigo-600 text-white">
                  Course Schedule
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Monday, 10 August – Saturday, 15 August
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                <span className="material-symbols-outlined text-sm text-indigo-500">schedule</span>
                <span className="font-semibold">10:00 AM – 1:00 PM daily</span> (6 sessions)
              </p>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-4 mb-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Section 1: Parent/Guardian Details */}
          <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-primary flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800/60 pb-2">
              <span className="material-symbols-outlined text-lg">supervisor_account</span>
              Parent / Guardian Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Parent's Full Name</label>
              <input
                {...register("parentName", { required: "Full name is required" })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                type="text"
                placeholder="Jane Doe"
              />
              {errors.parentName && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.parentName.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Relationship to Student</label>
                <select
                  {...register("parentRelationship", { required: "Required" })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Select...</option>
                  {relationships.map(rel => (
                    <option key={rel.value} value={rel.value}>{rel.label}</option>
                  ))}
                </select>
                {errors.parentRelationship && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.parentRelationship.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Postcode</label>
                <input
                  {...register("postcode", { 
                    required: "Required",
                    pattern: {
                      value: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
                      message: "Invalid UK postcode"
                    }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                  placeholder="M1 1AA"
                />
                {errors.postcode && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.postcode.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
              <input
                {...register("parentEmail", { 
                  required: "Email is required", 
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                type="email"
                placeholder="jane.doe@example.com"
              />
              {errors.parentEmail && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.parentEmail.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mobile Number</label>
              <input
                {...register("parentPhone", { 
                  required: "Mobile is required",
                  pattern: {
                    value: /^(?:\+44|0)7\d{9}$/,
                    message: "Enter a valid UK mobile number"
                  }
                })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                type="tel"
                placeholder="07123456789"
              />
              {errors.parentPhone && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.parentPhone.message}</span>}
            </div>
          </div>

          {/* Section 2: Student Details */}
          <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-green-600 flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800/60 pb-2">
              <span className="material-symbols-outlined text-lg text-green-600">face</span>
              Student Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Student's Full Name</label>
              <input
                {...register("studentName", { required: "Student name is required" })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                type="text"
                placeholder="Jimmy Doe"
              />
              {errors.studentName && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.studentName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Student's Date of Birth</label>
              <input
                {...register("studentDob", { required: "Date of birth is required" })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                type="date"
              />
              {errors.studentDob && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.studentDob.message}</span>}
              
              {/* Dynamic Age Feedback */}
              {studentAge !== null && (
                <div className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${studentAge >= 11 && studentAge <= 16 ? 'text-green-600' : 'text-amber-600'}`}>
                  <span className="material-symbols-outlined text-sm">
                    {studentAge >= 11 && studentAge <= 16 ? 'check_circle' : 'info'}
                  </span>
                  <span>Age: {studentAge} years old. {studentAge >= 11 && studentAge <= 16 ? '(Fits target 11-16 age group)' : '(Note: Target age group is 11–16)'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Emergency Contact & GP Details */}
          <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-amber-600 flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800/60 pb-2">
              <span className="material-symbols-outlined text-lg text-amber-600">emergency</span>
              Emergency & Medical Details
            </h2>

            {/* Emergency Contact */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-xl space-y-3 border border-slate-100 dark:border-slate-800/40">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Emergency Contact</h3>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Name</label>
                <input
                  {...register("emergencyContactName", { required: "Emergency contact name is required" })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  type="text"
                  placeholder="Mary Doe"
                />
                {errors.emergencyContactName && <span className="text-red-500 text-[9px] mt-1 block font-medium">{errors.emergencyContactName.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Relationship</label>
                  <select
                    {...register("emergencyRelationship", { required: "Required" })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">Select...</option>
                    {relationships.map(rel => (
                      <option key={rel.value} value={rel.value}>{rel.label}</option>
                    ))}
                  </select>
                  {errors.emergencyRelationship && <span className="text-red-500 text-[9px] mt-1 block font-medium">{errors.emergencyRelationship.message}</span>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Emergency Phone</label>
                  <input
                    {...register("emergencyContactPhone", { 
                      required: "Required",
                      pattern: {
                        value: /^(?:\+44|0)7\d{9}$/,
                        message: "Invalid UK mobile"
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    type="tel"
                    placeholder="07987654321"
                  />
                  {errors.emergencyContactPhone && <span className="text-red-500 text-[9px] mt-1 block font-medium">{errors.emergencyContactPhone.message}</span>}
                </div>
              </div>
            </div>

            {/* GP Details */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-xl space-y-3 border border-slate-100 dark:border-slate-800/40">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Doctor / GP Information</h3>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">GP Practice / Doctor's Name</label>
                <input
                  {...register("gpName", { required: "GP Name/Practice is required" })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  type="text"
                  placeholder="Dr. Smith / Salford Medical Centre"
                />
                {errors.gpName && <span className="text-red-500 text-[9px] mt-1 block font-medium">{errors.gpName.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">GP Phone Number (Optional)</label>
                <input
                  {...register("gpPhone")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  type="tel"
                  placeholder="0161 123 4567"
                />
              </div>
            </div>

            {/* Medical / Allergies Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Allergies, Medical Conditions or Special Needs</label>
              <textarea
                {...register("medicalConditions", { required: "Please enter any conditions, or write 'None'" })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all h-20 resize-none"
                placeholder="List any details (e.g. nut allergy, asthma). Write 'None' if not applicable."
              />
              {errors.medicalConditions && <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.medicalConditions.message}</span>}
            </div>

            {/* Photography consent */}
            <div className="flex items-start gap-2 pt-2">
              <input
                id="consentPhoto"
                type="checkbox"
                {...register("consentPhoto")}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <label htmlFor="consentPhoto" className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                I consent to photos/videos of my child being taken during the course sessions for Sovereign House GH educational and promotional updates. (Optional)
              </label>
            </div>
          </div>

          {/* Section 5: Payment Info & Proceed */}
          <div className="p-5 bg-gradient-to-br from-indigo-900/5 to-primary/5 dark:from-slate-800/30 dark:to-primary/5 rounded-2xl border border-indigo-100 dark:border-slate-800/80 space-y-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
              <span className="material-symbols-outlined text-lg">payments</span>
              Mandatory Enrollment Fee
            </div>
            
            <div className="py-2">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                £100<span className="text-xs text-slate-500 font-normal">.00</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">One-time registration fee</p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
              Upon clicking the button below, your enrollment details will be saved, and you will be redirected to PayPal to complete the mandatory fee payment.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Saving details...' : 'Proceed to PayPal Payment'}</span>
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3 leading-relaxed">
              If you experience any issues with your payment or application, please contact us at <a href="mailto:admin@sovereignhousegh.com" className="text-indigo-500 hover:underline">admin@sovereignhousegh.com</a>.
            </p>

            <span className="inline-block text-[9px] text-slate-400 font-medium">
              Sovereign House GH • Secure SSL Encrypted Enrollment
            </span>
          </div>

        </form>
      </main>
    </div>
  );
}

export default RoboticsEnrollmentForm;
