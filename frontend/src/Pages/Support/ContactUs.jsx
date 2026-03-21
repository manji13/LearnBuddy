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
    // FIXED: Changed to flex-col so NavBar stays at the top
    <div className="min-h-screen w-full bg-slate-200 font-sans text-slate-800 flex flex-col">
      
      {/* 1. NavBar stays perfectly at the top */}
      <NavBar /> 

      {/* 2. Main content area takes up remaining height and centers the card */}
      <div className="relative flex-grow flex items-center justify-center p-4 overflow-hidden">
        
        {/* Back Button (Moved slightly to accommodate NavBar) */}
        <Link to="/" className="absolute top-4 left-6 z-20 bg-white/70 backdrop-blur-md hover:bg-white text-slate-700 hover:text-indigo-600 p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        {/* Initial Page Loading Animation */}
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
          
          {/* Form Submission Loading Overlay */}
          {isSubmitting && !isSuccess && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-3xl">
               <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
            </div>
          )}

          {/* Success Animation Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-3xl transition-opacity duration-500">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4 shadow-xl animate-bounce">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Message Sent!</h3>
              <p className="text-teal-700 text-sm font-semibold animate-pulse">We will get back to you soon.</p>
            </div>
          )}

          <div className="text-center mb-7">
            <img src={logo} alt="LearnBuddy" className="w-14 h-14 mx-auto rounded-full border-2 border-indigo-100 mb-4 shadow-md" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent">
              Contact Us
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 font-medium">
              Have a question or facing an issue? Let us know!
            </p>
          </div>

          {apiError && (
            <div className="mb-5 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm text-center font-medium shadow-inner">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Student Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 border ${errors.name ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'} rounded-xl focus:ring-2 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white`} 
                placeholder="John Doe" 
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'} rounded-xl focus:ring-2 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white`} 
                placeholder="0771234567" 
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Description (Fact)</label>
              <textarea 
                name="description" 
                rows="4"
                value={formData.description} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 border ${errors.description ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'} rounded-xl focus:ring-2 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white resize-none`} 
                placeholder="Please describe your issue or question in detail..." 
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1 ml-1">{errors.description}</p>}
            </div>
            
            <button type="submit" className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm tracking-wide">
              Submit Message
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;