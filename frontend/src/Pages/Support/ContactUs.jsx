import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../api/config';
import NavBar from '../../Components/NavBar/NavBar';
import contactusImg from '../../assets/contactus_img.png';

const ContactUs = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // This perfectly matches the updated backend now
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
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
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Id is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid Email Id';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
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
          @keyframes bouncein {
            0% { transform: scale(0.2); opacity: 0; }
            55% { transform: scale(1.12); }
            75% { transform: scale(0.94); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadein {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      <div className="min-h-screen flex flex-col bg-white font-['Nunito',sans-serif] relative overflow-hidden">
        
        <div className="fixed rounded-full opacity-30 pointer-events-none z-0 w-[400px] h-[400px] bg-[#f5f3ff] -top-[100px] -right-[100px]" />

        <NavBar />

        {isInitialLoading && (
          <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center gap-3">
            <div className="w-[42px] h-[42px] border-4 border-[#f0f0f0] border-t-[#332b85] rounded-full animate-spin" />
            <p className="text-[13px] font-bold text-[#9ca3af] animate-pulse">Loading LearnBuddy...</p>
          </div>
        )}

        <main 
          className={`flex-1 flex items-center justify-center pt-20 px-6 pb-16 relative z-10 transition-all duration-700 ease-in-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
          }`}
        >
          <div className="w-full max-w-[960px]">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-center">
              
              <div className="relative w-full max-w-[400px] mx-auto md:mx-0">
                
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-[2px] bg-[#ff6b6b]"></div>
                    <span className="text-[#ff6b6b] font-bold text-[13px]">Contact us</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-[#1e1e2d] tracking-tight leading-tight">
                    Let’s get in touch
                  </h1>
                </div>

                {isSubmitting && !isSuccess && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-[4px] flex flex-col items-center justify-center gap-3 z-20">
                    <div className="w-10 h-10 border-4 border-[#f0f0f0] border-t-[#332b85] rounded-full animate-spin" />
                    <p className="text-[13px] font-bold text-[#9ca3af]">Sending...</p>
                  </div>
                )}

                {isSuccess && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-3 z-20 animate-[fadein_0.4s_ease]">
                    <div className="w-16 h-16 bg-[#332b85] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(51,43,133,0.3)] animate-[bouncein_0.6s_cubic-bezier(0.36,0.07,0.19,0.97)]">
                      <svg viewBox="0 0 24 24" className="w-[30px] h-[30px] stroke-white stroke-[3px] fill-none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-[#1e1e2d] m-0">Sent! 🎉</h3>
                  </div>
                )}

                {apiError && (
                  <div className="mb-5 px-3 py-2 bg-[#fff5f5] border-[1px] border-[#fecaca] rounded text-[13px] text-[#dc2626] font-semibold flex items-center justify-between gap-2">
                    <span>⚠️ {apiError}</span>
                    <button className="bg-transparent border-none text-[#f87171] text-[18px] cursor-pointer leading-none p-0" onClick={() => setApiError('')}>×</button>
                  </div>
                )}

                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                  
                  <div className="flex flex-col relative group">
                    <label className="text-[11px] font-bold text-[#8a94a6] mb-1">Full Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jonathan Hunter"
                      className={`w-full py-1 bg-transparent text-[14px] font-bold text-[#1e1e2d] outline-none placeholder:text-[#d1d5db] transition-all duration-300 border-b-[1.5px]
                        ${errors.name ? 'border-[#f87171]' : 'border-[#e5e7eb] focus:border-[#332b85]'}`}
                    />
                    {errors.name && <span className="absolute -bottom-4 left-0 text-[10px] text-[#ef4444] font-bold">⚠ {errors.name}</span>}
                  </div>

                  <div className="flex flex-col relative group">
                    <label className="text-[11px] font-bold text-[#8a94a6] mb-1">Email Id*</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Jonathan_Hunter@coy.org"
                      className={`w-full py-1 bg-transparent text-[14px] font-bold text-[#1e1e2d] outline-none placeholder:text-[#d1d5db] transition-all duration-300 border-b-[1.5px]
                        ${errors.email ? 'border-[#f87171]' : 'border-[#e5e7eb] focus:border-[#332b85]'}`}
                    />
                    {errors.email && <span className="absolute -bottom-4 left-0 text-[10px] text-[#ef4444] font-bold">⚠ {errors.email}</span>}
                  </div>

                  <div className="flex flex-col relative group mt-1">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full py-1 bg-transparent text-[14px] font-bold outline-none appearance-none transition-all duration-300 border-b-[1.5px]
                        ${formData.subject ? 'text-[#1e1e2d]' : 'text-[#d1d5db]'} 
                        ${errors.subject ? 'border-[#f87171]' : 'border-[#e5e7eb] focus:border-[#332b85]'}`}
                    >
                      <option value="" disabled hidden>Subject</option>
                      <option value="support" className="text-[#1e1e2d]">Support</option>
                      <option value="inquiry" className="text-[#1e1e2d]">General Inquiry</option>
                      <option value="feedback" className="text-[#1e1e2d]">Feedback</option>
                    </select>
                    {errors.subject && <span className="absolute -bottom-4 left-0 text-[10px] text-[#ef4444] font-bold">⚠ {errors.subject}</span>}
                    <svg className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <div className="flex flex-col relative group mt-1">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message here"
                      className={`w-full py-1 bg-transparent text-[14px] font-bold text-[#1e1e2d] outline-none placeholder:text-[#d1d5db] transition-all duration-300 border-b-[1.5px] resize-none h-[60px]
                        ${errors.message ? 'border-[#f87171]' : 'border-[#e5e7eb] focus:border-[#332b85]'}`}
                    />
                    {errors.message && <span className="absolute -bottom-4 left-0 text-[10px] text-[#ef4444] font-bold">⚠ {errors.message}</span>}
                  </div>

                  <div className="mt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="inline-flex items-center justify-center gap-2 py-[10px] px-[28px] bg-[#332b85] rounded text-white text-[13px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#251e66] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Send
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              <div className="hidden md:flex justify-center items-center w-full">
                <img 
                  src={contactusImg} 
                  alt="Contact Us Illustration" 
                  className="w-full max-w-[420px] h-auto object-contain"
                />
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ContactUs;