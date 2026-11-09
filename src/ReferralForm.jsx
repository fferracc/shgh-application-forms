import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import countries from './countries';

const inputClass =
  "form-input w-full px-4 py-3.5 rounded-xl border border-primary/30 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all";
const labelClass =
  "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
const errorClass = "text-red-500 text-xs mt-1 block";

function ReferralForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await addDoc(collection(db, 'referrals'), {
        ...data,
        age: data.age ? Number(data.age) : null,
        beneficiaryGroups: Array.isArray(data.beneficiaryGroups)
          ? data.beneficiaryGroups
          : (data.beneficiaryGroups ? [data.beneficiaryGroups] : []),
        postcode: (data.postcode || '').toUpperCase().trim(),
        formType: 'referral',
        status: 'pending',
        submittedAt: new Date()
      });
      setSubmitStatus('success');
      reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Error adding referral: ", e);
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[430px] mx-auto bg-white dark:bg-background-dark shadow-2xl overflow-x-hidden ltr">

      {/* Header */}
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mx-auto">
          <img src="/Sovereign-House-Logo.png" alt="Sovereign House GH Logo" className="h-10 object-contain" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight mb-2">
          Digital Skills Referral Form
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          For referral agencies and partner organisations. Use this form to refer an adult
          to our digital skills programme. It takes about two minutes.
        </p>

        {submitStatus === 'success' && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-bold text-green-700">Referral received — thank you.</p>
            <p className="text-sm text-green-700/80 mt-1">
              Our team will contact the participant directly. You can submit another referral below.
            </p>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-bold text-red-700">Sorry, that didn&apos;t send.</p>
            <p className="text-sm text-red-700/80 mt-1">
              Please check your connection and try again, or email us at info@sovereignhousegh.com.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ---------- Participant ---------- */}
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary pt-2">
            About the participant
          </h2>

          <div>
            <label className={labelClass}>Full name</label>
            <input {...register("name", { required: true })} className={inputClass} type="text" />
            {errors.name && <span className={errorClass}>This field is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Age</label>
              <input
                {...register("age", {
                  required: true,
                  min: { value: 16, message: "Must be 16 or over" },
                  max: { value: 120, message: "Please check the age" }
                })}
                className={inputClass}
                type="number"
                inputMode="numeric"
                placeholder="e.g. 58"
              />
              {errors.age?.type === 'required' && <span className={errorClass}>This field is required</span>}
              {errors.age?.message && <span className={errorClass}>{errors.age.message}</span>}
            </div>

            <div>
              <label className={labelClass}>Postcode</label>
              <input
                {...register("postcode", {
                  required: true,
                  pattern: {
                    value: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
                    message: "Enter a valid UK postcode"
                  }
                })}
                className={`${inputClass} uppercase`}
                type="text"
                placeholder="M7 2HW"
              />
              {errors.postcode?.type === 'required' && <span className={errorClass}>This field is required</span>}
              {errors.postcode?.message && <span className={errorClass}>{errors.postcode.message}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Nationality</label>
            <select
              {...register("nationality", { required: true })}
              className={`${inputClass} appearance-none`}
              defaultValue=""
            >
              <option value="">-- Select country --</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            {errors.nationality && <span className={errorClass}>This field is required</span>}
          </div>

          <div>
            <label className={labelClass}>Phone number</label>
            <input
              {...register("mobile", {
                required: true,
                pattern: {
                  value: /^(?:\+44\s?|0)\d[\d\s]{8,12}$/,
                  message: "Enter a valid UK phone number"
                }
              })}
              className={inputClass}
              type="tel"
              placeholder="07... or 0161..."
            />
            {errors.mobile?.type === 'required' && <span className={errorClass}>This field is required</span>}
            {errors.mobile?.message && <span className={errorClass}>{errors.mobile.message}</span>}
          </div>

          <div>
            <label className={labelClass}>
              Email address <span className="font-normal text-slate-400">(if they have one)</span>
            </label>
            <input
              {...register("email", { pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email address" } })}
              className={inputClass}
              type="email"
            />
            {errors.email?.message && <span className={errorClass}>{errors.email.message}</span>}
          </div>

          {/* Beneficiary group */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className={`${labelClass} mb-1`}>Which of these describe the participant?</label>
            <p className="text-xs text-slate-400 mb-4">Tick all that apply.</p>
            <div className="space-y-3">
              {[
                { value: 'Asylum seeker or refugee', hint: 'Seeking asylum, refugee status or newly resettled' },
                { value: 'Adult 50+', hint: 'Aged 50 or over' },
                { value: 'Adult seeking skills for work', hint: 'Looking for work or training' }
              ].map(opt => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 cursor-pointer transition-all hover:border-primary/40"
                >
                  <input
                    {...register("beneficiaryGroups", {
                      validate: v => (Array.isArray(v) ? v.length > 0 : Boolean(v))
                    })}
                    type="checkbox"
                    value={opt.value}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{opt.value}</span>
                    <span className="text-xs leading-tight text-slate-400">{opt.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.beneficiaryGroups && <span className={errorClass}>Please tick at least one</span>}
          </div>

          {/* Digital skills level */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className={`${labelClass} mb-1`}>Level of digital skills</label>
            <p className="text-xs text-slate-400 mb-4">Your best estimate is fine.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'beginner', label: 'Beginner', hint: 'Little or no use' },
                { value: 'intermediate', label: 'Intermediate', hint: 'Basic tasks' },
                { value: 'advanced', label: 'Advanced', hint: 'Confident' }
              ].map(opt => (
                <label key={opt.value} className="relative cursor-pointer">
                  <input {...register("itLevel", { required: true })} className="peer sr-only" type="radio" value={opt.value} />
                  <div className="flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-center h-16">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 peer-checked:text-primary">{opt.label}</span>
                    <span className="text-[10px] leading-tight text-slate-400">{opt.hint}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.itLevel && <span className={errorClass}>Please choose one</span>}
          </div>

          {/* ---------- Referrer ---------- */}
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary pt-6 border-t border-slate-100 dark:border-slate-800">
            About the referral
          </h2>

          <div>
            <label className={labelClass}>Referring agency / organisation</label>
            <input {...register("referralOrg", { required: true })} className={inputClass} type="text" placeholder="e.g. Salford City Council" />
            {errors.referralOrg && <span className={errorClass}>This field is required</span>}
          </div>

          <div>
            <label className={labelClass}>Name of person referring</label>
            <input {...register("referrerName", { required: true })} className={inputClass} type="text" />
            {errors.referrerName && <span className={errorClass}>This field is required</span>}
          </div>

          <div>
            <label className={labelClass}>
              Your email <span className="font-normal text-slate-400">(so we can update you)</span>
            </label>
            <input
              {...register("referrerEmail", { pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email address" } })}
              className={inputClass}
              type="email"
            />
            {errors.referrerEmail?.message && <span className={errorClass}>{errors.referrerEmail.message}</span>}
          </div>

          <div>
            <label className={labelClass}>
              Comments about the participant <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              {...register("comments")}
              className={`${inputClass} h-28 resize-none`}
              placeholder="Anything that would help us support them — access needs, language, availability, goals."
            />
          </div>

          {/* Consent */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register("consentConfirmed", { required: true })}
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-primary focus:ring-primary/30"
              />
              <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                I confirm the participant knows about this referral and agrees to Sovereign House GH
                contacting them about the digital skills programme.
              </span>
            </label>
            {errors.consentConfirmed && <span className={errorClass}>Please confirm before submitting</span>}
          </div>

          <div className="mt-8"></div>

          {/* Footer Button */}
          <footer className="p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 sticky bottom-0 z-20">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending...' : 'Submit referral'}</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-widest">
              Sovereign House GH • Secure Data Entry
            </p>
          </footer>

        </form>
      </main>
    </div>
  );
}

export default ReferralForm;
