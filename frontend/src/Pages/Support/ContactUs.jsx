import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../../api/config';
import logo from '../../assets/learnbuddy-logo.jpg';
import NavBar from '../../Components/NavBar/NavBar'; // FIXED: Capital 'N'

const ContactUs = () => {
  // UI States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({ name: '', phone: '', description: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
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
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Student name is required";
    
    // Basic phone number validation (digits only, at least 10 characters)
    const phoneRegex = /^[0-9]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/[-+()\s]/g, ''))) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message. Please try again.');
      }
      
      // Show Success Animation
      setIsSuccess(true);
      
      // Redirect to home or dashboard after 3 seconds
      setTimeout(() => {
        navigate('/'); 
      }, 3000);

    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 font-sans text-slate-800 flex flex-col">
      
      {/* 1. NavBar stays perfectly at the top */}
      <NavBar /> 

      {/* 2. Main content area takes up remaining height and centers the card */}
      <div className="relative flex-grow flex items-center justify-center p-4 overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        {/* Back Button */}
        <Link to="/" className="absolute top-4 left-6 z-20 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 hover:text-indigo-600 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        {/* Initial Page Loading Animation */}
        {isInitialLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white z-50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 border-r-indigo-600"></div>
                <div className="absolute inset-0 border-4 border-transparent rounded-full animate-pulse border-t-teal-500"></div>
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-25"></div>
                <img src={logo} alt="Logo" className="absolute inset-0 w-14 h-14 m-auto rounded-full object-cover border-2 border-indigo-300 shadow-lg" />
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent animate-pulse">Loading LearnBuddy...</p>
            </div>
          </div>
        )}

        {/* Main Card with Mount Animation */}
        <div className={`z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl p-7 sm:p-9 relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2),0_15px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out transform ${isMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'} border border-white/50`}>
          
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-teal-500 to-indigo-500 opacity-20 blur-xl"></div>
          
          {/* Form Submission Loading Overlay */}
          {isSubmitting && !isSuccess && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-3xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
                <p className="text-indigo-600 font-semibold text-sm">Sending message...</p>
              </div>
            </div>
          )}

          {/* Success Animation Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-3xl transition-all duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-2xl animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Message Sent! 🎉</h3>
              <p className="text-teal-600 text-sm font-semibold animate-pulse">We will get back to you soon.</p>
            </div>
          )}

          <div className="text-center mb-8 relative">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-full blur-xl opacity-60"></div>
              <img src={logo} alt="LearnBuddy" className="relative w-16 h-16 mx-auto rounded-full border-3 border-white shadow-xl mb-4" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Contact Us
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full mx-auto mt-3"></div>
            <p className="text-slate-600 text-sm mt-3 font-medium">
              Have a question or facing an issue? Let us know!
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm text-center font-medium shadow-inner flex items-center justify-between gap-3">
              <span>⚠️ {apiError}</span>
              <button onClick={() => setApiError('')} className="text-red-500 hover:text-red-700 font-bold text-lg">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="group">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Student Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className={`w-full px-5 py-3.5 border-2 ${errors.name ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-400'} rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-sm hover:bg-white group-hover:border-indigo-200`} 
                placeholder="Enter your full name" 
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1"><span>⚠️</span>{errors.name}</p>}
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone Number
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className={`w-full px-5 py-3.5 border-2 ${errors.phone ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-400'} rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-sm hover:bg-white group-hover:border-indigo-200`} 
                placeholder="0771234567" 
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1"><span>⚠️</span>{errors.phone}</p>}
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </label>
              <textarea 
                name="description" 
                rows="4"
                value={formData.description} 
                onChange={handleChange} 
                className={`w-full px-5 py-3.5 border-2 ${errors.description ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:border-indigo-400'} rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-sm hover:bg-white resize-none group-hover:border-indigo-200`} 
                placeholder="Please describe your issue or question in detail..." 
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1"><span>⚠️</span>{errors.description}</p>}
            </div>
            
            <button 
              type="submit" 
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-300 active:scale-[0.98] cursor-pointer text-sm tracking-wide hover:bg-gradient-to-r hover:from-indigo-700 hover:via-indigo-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Message
              </span>
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-xs text-slate-400 mt-6 pt-2 border-t border-slate-100">
            We'll respond within 24-48 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;