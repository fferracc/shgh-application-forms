import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { trackMetaEvent } from './utils/metaPixel';

function RoboticsSuccess() {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('app_id');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'pending_payment', 'error', 'no_id'
  const [enrollmentData, setEnrollmentData] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    if (!appId) {
      setStatus('no_id');
      return;
    }

    // Securely listen to the document. Do NOT update paymentStatus client-side.
    const searchParams = new URLSearchParams(window.location.search);
    const cohort = searchParams.get('cohort') || 'cohort_2';
    const collectionName = cohort === 'cohort_2' ? 'roboticsEnrollments_cohort_2' : 'roboticsEnrollments_cohort_1';

    unsubscribe = onSnapshot(doc(db, collectionName, appId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.paymentStatus === 'paid') {
          setEnrollmentData(data);
          setStatus('success');
          // Track Meta Pixel CompleteRegistration event on successful payment
          trackMetaEvent('CompleteRegistration', {
            content_name: 'Robotics Course Enrollment',
            value: 100.00,
            currency: 'GBP',
            status: 'paid'
          });
        } else {
          setStatus('pending_payment');
        }
      } else {
        setStatus('error');
      }
    }, (err) => {
      console.error("Error reading enrollment document: ", err);
      setStatus('error');
    });

    return () => unsubscribe();
  }, [appId]);

  // Map cohort ID to human readable text
  const getCohortText = (cohortId) => {
    if (cohortId === 'cohort_1') {
      return "Cohort 1: Mon, August 3 - Sat, August 8, 2026";
    } else if (cohortId === 'cohort_2') {
      return "Cohort 2: Mon, August 10 – Sat, August 15, 2026";
    }
    return "Selected Cohort";
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[480px] mx-auto bg-slate-50 dark:bg-background-dark shadow-2xl overflow-x-hidden">
      
      {/* Header */}
      <header className="flex items-center bg-white dark:bg-background-dark p-4 justify-between border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mx-auto">
          <img src="/Sovereign-House-Logo.png" alt="Sovereign House GH Logo" className="h-10 object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-8 flex flex-col justify-center">
        
        {/* State: Verifying */}
        {status === 'verifying' && (
          <div className="text-center py-10 space-y-4">
            <div className="inline-block relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Verifying Enrollment...</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto">
              Please wait while we confirm your payment and secure your seat.
            </p>
          </div>
        )}

        {/* State: Pending Payment (Security fallback) */}
        {status === 'pending_payment' && (
          <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm text-center space-y-4 py-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-4 border-amber-100 dark:border-amber-900/40">
              <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Awaiting Payment Confirmation...</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[300px] mx-auto leading-relaxed">
              We have received your form details, but PayPal hasn't reported the £100 payment yet. This page will update automatically the instant the payment finishes.
            </p>
            <div className="pt-3">
              <button
                onClick={() => window.open('https://www.paypal.com/ncp/payment/VHSXEPW8RQGT6', '_blank')}
                className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                Complete PayPal Payment
              </button>
            </div>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="space-y-6">
            
            {/* Celebration Card */}
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-950/40 text-green-500 border-4 border-green-100 dark:border-green-900/40 animate-bounce">
                <span className="material-symbols-outlined text-3xl font-extrabold">check</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Enrollment Secured!</h1>
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">
                  Payment Verified (£100.00)
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[320px] mx-auto">
                Thank you! Your child's registration is complete, and the seat is officially reserved. A confirmation copy has been sent to <strong>{enrollmentData?.parentEmail}</strong>.
              </p>

              {/* Course Detail Badge */}
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl text-left border border-indigo-100/50 dark:border-indigo-900/30">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Registered Student & Course</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {enrollmentData?.studentName}
                </p>
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">event</span>
                  {getCohortText(enrollmentData?.cohort)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  Hours: 10:00 – 13:00 (Monday to Saturday)
                </p>
              </div>
            </div>

            {/* Syllabus Highlights */}
            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 dark:border-slate-800/40 pb-1.5">
                <span className="material-symbols-outlined text-sm text-indigo-500">smart_toy</span>
                Course Highlights (What they will build)
              </h3>
              
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Using the advanced <strong>mBot Neo robot</strong> and <strong>mBlock 5</strong>, students will complete project-based programming challenges:
              </p>

              <ul className="space-y-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-xs text-indigo-500 mt-0.5">rocket_launch</span>
                  <span><strong>The Delivery Driver:</strong> Path navigation & 90° turning mechanics.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-xs text-indigo-500 mt-0.5">security</span>
                  <span><strong>The Security Patrol:</strong> Event-driven loops and start/stop controls.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-xs text-indigo-500 mt-0.5">settings</span>
                  <span><strong>The Gear Shifter:</strong> Programming variables and logic states.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-xs text-indigo-500 mt-0.5">sensors</span>
                  <span><strong>The Automated Vacuum:</strong> Ultrasonic proximity obstacle avoidance.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-xs text-indigo-500 mt-0.5">visibility</span>
                  <span><strong>The Night Watchman:</strong> Complex AND/OR logic & RGB light sensors.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-xs text-indigo-500 mt-0.5">route</span>
                  <span><strong>The Factory Transport:</strong> Line-following algorithms & feedback loops.</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="text-center pt-2">
              <Link 
                to="/robotics"
                className="inline-flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Enroll Another Student
              </Link>
            </div>

          </div>
        )}

        {/* State: Error */}
        {status === 'error' && (
          <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm text-center space-y-4 py-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500">
              <span className="material-symbols-outlined text-2xl font-bold">warning</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Verification Failed</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              We couldn't confirm your enrollment reference. If your payment was already deducted, please contact us at <a href="mailto:admin@sovereignhousegh.com" className="text-indigo-500 hover:underline">admin@sovereignhousegh.com</a> with your receipt.
            </p>
            <div className="pt-2">
              <Link 
                to="/robotics"
                className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all"
              >
                Back to Registration Form
              </Link>
            </div>
          </div>
        )}

        {/* State: No ID */}
        {status === 'no_id' && (
          <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm text-center space-y-4 py-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <span className="material-symbols-outlined text-2xl font-bold">info</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Invalid Request</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto">
              No registration code was provided. If you want to enroll in the robotics course, please use the form link below.
            </p>
            <div className="pt-2">
              <Link 
                to="/robotics"
                className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all"
              >
                Open Enrollment Form
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Sovereign House GH • Secure Data Entry</p>
      </footer>

    </div>
  );
}

export default RoboticsSuccess;
