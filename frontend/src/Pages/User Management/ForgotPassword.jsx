import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../../api/config';
import logo from '../../assets/learnbuddy-logo.jpg';

const ForgotPassword = () => {
  // UI States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Logic States
  const [step, setStep] = useState(1); // 1: Email & New Password, 2: OTP, 3: Success
  const [formData, setFormData] = useState({ email: '', newPassword: '', otp: '' });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Initial Open Animation Effect
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsInitialLoading(false);
      setTimeout(() => setIsMounted(true), 50);
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // STEP 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP. Please check your email.');
      }
      
      setStep(2); // Move to OTP Verification step
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP and Update Password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Verify the OTP first
      const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message || 'Invalid OTP');

      // 2. If OTP is correct, reset the password
      const resetRes = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, newPassword: formData.newPassword })
      });
      
      const resetData = await resetRes.json();
      if (!resetRes.ok) throw new Error(resetData.message || 'Failed to reset password');

      // 3. Show Success Animation
      setStep(3);
      
      // Redirect to Signin after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-200 relative flex items-center justify-center p-4 font-sans text-slate-800 overflow-hidden">
      
      {/* Back Button */}
      <Link to="/login" className="absolute top-6 left-6 z-20 bg-white/70 backdrop-blur-md hover:bg-white text-slate-700 hover:text-indigo-600 p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>

      {/* Initial Page Loading Animation (Matches Signin) */}
      {isInitialLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 border-r-indigo-600"></div>
              <div className="absolute inset-2 border-4 border-transparent rounded-full animate-pulse border-t-teal-500"></div>
              <img src={logo} alt="Logo" className="absolute inset-0 w-12 h-12 m-auto rounded-full object-cover border-2 border-indigo-300" />
            </div>
            <p className="text-lg font-semibold text-indigo-600 animate-pulse">Loading LearnBuddy...</p>
          </div>
        </div>
      )}

      {/* Main Card with Mount Animation */}
      <div className={`z-10 w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_15px_30px_-10px_rgba(0,0,0,0.08)] transition-all duration-1000 ease-out transform ${isMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
        
        {/* Form Submission Loading Overlay (Prevents clicking while processing) */}
        {isSubmitting && step !== 3 && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-3xl">
             <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
          </div>
        )}

        {/* Step 3: Success Animation Overlay */}
        {step === 3 && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-3xl transition-opacity duration-500">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4 shadow-xl animate-bounce">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Password Updated!</h3>
            <p className="text-teal-700 text-sm font-semibold animate-pulse">Redirecting to Sign In...</p>
          </div>
        )}

        <div className="text-center mb-7">
          <img src={logo} alt="LearnBuddy" className="w-14 h-14 mx-auto rounded-full border-2 border-indigo-100 mb-4 shadow-md" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent">
            {step === 1 ? 'Reset Password' : 'Verify OTP'}
          </h2>
          <p className="text-slate-600 text-sm mt-1.5 font-medium">
            {step === 1 ? 'Enter your email and new password' : `We sent an OTP to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm text-center font-medium shadow-inner">
            {error}
          </div>
        )}

        {/* Step 1 Form: Email and New Password */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Email Address</label>
              <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">New Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} required minLength="6" onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm tracking-wide">
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2 Form: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1 text-center">Enter 6-Digit OTP</label>
              <input 
                type="text" 
                name="otp" 
                maxLength="6"
                value={formData.otp} 
                required 
                onChange={handleChange} 
                className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-center text-2xl tracking-[0.5em] font-bold bg-slate-50 hover:bg-white" 
                placeholder="000000" 
              />
            </div>
            <button type="submit" className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm tracking-wide">
              Verify & Reset Password
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-indigo-600 hover:text-teal-500 transition-colors">
                Change Email / Resend OTP
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;