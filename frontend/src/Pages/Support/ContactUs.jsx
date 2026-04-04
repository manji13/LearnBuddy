import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../api/config';
import NavBar from '../../Components/NavBar/NavBar';

const ContactUs = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({ name: '', phone: '', description: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      setIsInitialLoading(false);
      setTimeout(() => setIsMounted(true), 60);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Student name is required';
    const phoneRegex = /^[0-9]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[-+()\s]/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
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
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send message. Please try again.');
      setIsSuccess(true);
      setTimeout(() => navigate('/contact'), 3000);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
          @keyframes shimmer { to { background-position: 200%; } }
          @keyframes bouncein {
            0% { transform: scale(0.2); opacity: 0; }
            55% { transform: scale(1.12); }
            75% { transform: scale(0.94); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <div className="min-h-screen flex flex-col bg-[#eef0f3] font-['Nunito',sans-serif] relative">
        {/* Background Blobs */}
        <div className="fixed rounded-full blur-[90px] opacity-15 pointer-events-none z-0 w-[450px] h-[450px] bg-[#f5a623] -top-[120px] -right-[100px]" />
        <div className="fixed rounded-full blur-[90px] opacity-15 pointer-events-none z-0 w-[350px] h-[350px] bg-[#60a5fa] -bottom-[100px] -left-[80px]" />

        {/* NavBar */}
        <NavBar />

        {/* Loading */}
        {isInitialLoading && (
          <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center gap-4">
            <div className="w-[52px] h-[52px] border-4 border-[#f0f0f0] border-t-[#f5a623] rounded-full animate-spin" />
            <p className="text-[14px] font-bold text-[#9ca3af] animate-pulse">Loading LearnBuddy...</p>
          </div>
        )}

        {/* Page */}
        <main 
          className={`flex-1 flex items-center justify-center pt-16 px-6 pb-20 relative z-10 transition-all duration-700 ease-in-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
          }`}
        >
          <div className="w-full max-w-[1020px]">
            <h1 className="text-center text-[clamp(2rem,5vw,2.8rem)] font-black text-[#1e2a3a] mb-[60px] tracking-[-0.5px]">
              Contact Us
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.9fr] gap-10 md:gap-[52px] items-start">
              
              {/* ── Left: Contact Info ── */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-[18px] p-5 bg-white rounded-[18px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)]">
                  <div className="w-12 h-12 bg-[#fff8ee] rounded-[13px] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] stroke-[#f5a623] fill-none stroke-[1.8px]" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#1e2a3a] mb-0.5">Call</p>
                    <p className="text-[13px] text-[#9ca3af] font-medium">+94-76-468-7979</p>
                  </div>
                </div>

                <div className="flex items-center gap-[18px] p-5 bg-white rounded-[18px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)]">
                  <div className="w-12 h-12 bg-[#fff8ee] rounded-[13px] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] stroke-[#f5a623] fill-none stroke-[1.8px]" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M22 6L12 13 2 6"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#1e2a3a] mb-0.5">Email</p>
                    <p className="text-[13px] text-[#9ca3af] font-medium">learnbuddysystem@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-[18px] p-5 bg-white rounded-[18px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(0,0,0,0.1)]">
                  <div className="w-12 h-12 bg-[#fff8ee] rounded-[13px] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] stroke-[#f5a623] fill-none stroke-[1.8px]" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#1e2a3a] mb-0.5">Location</p>
                    <p className="text-[13px] text-[#9ca3af] font-medium">Malabe, Sri Lanka</p>
                  </div>
                </div>

                <div className="mt-2 py-[18px] px-5 bg-white rounded-[18px] shadow-[0_4px_18px_rgba(0,0,0,0.06)] border-l-4 border-[#f5a623]">
                  <p className="text-[13px] font-extrabold text-[#1e2a3a] mb-[5px]">Response Time</p>
                  <p className="text-[13px] text-[#9ca3af] font-medium leading-[1.6]">
                    We typically respond within <strong className="text-[#f5a623]">24–48 hours</strong> on business days.
                  </p>
                </div>
              </div>

              {/* ── Right: Form ── */}
              <div className="bg-white rounded-[20px] sm:rounded-[26px] p-[30px] sm:px-[44px] sm:pt-[44px] sm:pb-[40px] shadow-[0_10px_50px_rgba(0,0,0,0.09)] relative overflow-hidden">
                
                {/* Shimmer line indicator at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f5a623] via-[#fcd27a] to-[#f5a623] bg-[length:200%] animate-[shimmer_2.5s_linear_infinite]" />

                {isSubmitting && !isSuccess && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-[4px] rounded-[26px] flex flex-col items-center justify-center gap-3.5 z-20">
                    <div className="w-11 h-11 border-4 border-[#f0f0f0] border-t-[#f5a623] rounded-full animate-spin" />
                    <p className="text-[14px] font-bold text-[#9ca3af]">Sending your message...</p>
                  </div>
                )}

                {isSuccess && (
                  <div className="absolute inset-0 bg-white/95 rounded-[26px] flex flex-col items-center justify-center gap-3 z-20 animate-[fadein_0.4s_ease]">
                    <div className="w-[76px] h-[76px] bg-[#f5a623] rounded-full flex items-center justify-center shadow-[0_10px_32px_rgba(245,166,35,0.42)] animate-[bouncein_0.6s_cubic-bezier(0.36,0.07,0.19,0.97)]">
                      <svg viewBox="0 0 24 24" className="w-[38px] h-[38px] stroke-white stroke-[3px] fill-none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <h3 className="text-[24px] font-black text-[#1e2a3a] m-0">Message Sent! 🎉</h3>
                    <p className="text-[14px] text-[#f5a623] font-bold m-0">We'll get back to you soon.</p>
                  </div>
                )}

                {apiError && (
                  <div className="mb-[18px] px-[18px] py-[14px] bg-[#fff5f5] border-[1.5px] border-[#fecaca] rounded-[12px] text-[14px] text-[#dc2626] font-semibold flex items-center justify-between gap-3">
                    <span>⚠️ {apiError}</span>
                    <button className="bg-transparent border-none text-[#f87171] text-[22px] cursor-pointer leading-none p-0" onClick={() => setApiError('')}>×</button>
                  </div>
                )}

                <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>

                  {/* Student Name */}
                  <div className="flex flex-col gap-[7px]">
                    <label className="text-[11px] font-extrabold text-[#b0b7c3] tracking-[0.1em] uppercase pl-0.5">Student Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full py-[15px] px-5 rounded-[13px] text-[15px] font-medium outline-none box-border transition-all duration-200 placeholder:text-[#c8cdd6]
                        ${errors.name 
                          ? 'bg-[#fff8f8] border-[1.5px] border-[#f87171] text-[#1e2a3a] focus:border-[#f87171] focus:ring-4 focus:ring-[#f87171]/15' 
                          : 'bg-[#f9fafb] border-[1.5px] border-[#e9ecf0] text-[#1e2a3a] hover:border-[#d1d5db] hover:bg-white focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/15 focus:bg-white'
                        }`}
                    />
                    {errors.name && <span className="text-[12px] text-[#ef4444] font-bold pl-0.5 flex items-center gap-1">⚠ {errors.name}</span>}
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-[7px]">
                    <label className="text-[11px] font-extrabold text-[#b0b7c3] tracking-[0.1em] uppercase pl-0.5">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0771234567"
                      className={`w-full py-[15px] px-5 rounded-[13px] text-[15px] font-medium outline-none box-border transition-all duration-200 placeholder:text-[#c8cdd6]
                        ${errors.phone 
                          ? 'bg-[#fff8f8] border-[1.5px] border-[#f87171] text-[#1e2a3a] focus:border-[#f87171] focus:ring-4 focus:ring-[#f87171]/15' 
                          : 'bg-[#f9fafb] border-[1.5px] border-[#e9ecf0] text-[#1e2a3a] hover:border-[#d1d5db] hover:bg-white focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/15 focus:bg-white'
                        }`}
                    />
                    {errors.phone && <span className="text-[12px] text-[#ef4444] font-bold pl-0.5 flex items-center gap-1">⚠ {errors.phone}</span>}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-[7px]">
                    <label className="text-[11px] font-extrabold text-[#b0b7c3] tracking-[0.1em] uppercase pl-0.5">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Please describe your issue or question in detail..."
                      className={`w-full py-[15px] px-5 rounded-[13px] text-[15px] font-medium outline-none box-border transition-all duration-200 placeholder:text-[#c8cdd6] resize-none h-[138px] leading-[1.65]
                        ${errors.description 
                          ? 'bg-[#fff8f8] border-[1.5px] border-[#f87171] text-[#1e2a3a] focus:border-[#f87171] focus:ring-4 focus:ring-[#f87171]/15' 
                          : 'bg-[#f9fafb] border-[1.5px] border-[#e9ecf0] text-[#1e2a3a] hover:border-[#d1d5db] hover:bg-white focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/15 focus:bg-white'
                        }`}
                    />
                    {errors.description && <span className="text-[12px] text-[#ef4444] font-bold pl-0.5 flex items-center gap-1">⚠ {errors.description}</span>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full p-[17px] mt-1 bg-[#f5a623] border-none rounded-[13px] text-white text-[14px] font-extrabold tracking-[0.1em] uppercase cursor-pointer shadow-[0_5px_20px_rgba(245,166,35,0.38)] transition-all duration-200 hover:bg-[#e09615] hover:shadow-[0_8px_28px_rgba(245,166,35,0.48)] hover:-translate-y-[1px] active:scale-[0.99] disabled:opacity-[0.55] disabled:cursor-not-allowed"
                  >
                    Send Now
                  </button>
                </form>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ContactUs;