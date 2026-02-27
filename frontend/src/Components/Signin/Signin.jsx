import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/learnbuddy-logo.jpg';

// 1. Import your local images here!
import signinImg1 from '../../assets/Signup_Img.jpg';
import signinImg2 from '../../assets/Signin_Img2.jpg';
import signinImg3 from '../../assets/Signin_Img3.jpg';

const Signin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');

  // 2. Add your imported images to this array! 
  // (It will just show your first image steadily until you uncomment the others)
  const bgImages = [
    signinImg1,
    signinImg2, 
    signinImg3
  ];

  useEffect(() => {
    // Page load animations
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setIsMounted(true), 50);
    }, 1500);

    // Image slider interval (changes every 5 seconds)
    // Only runs if you have more than 1 image in the array
    const sliderInterval = setInterval(() => {
      if (bgImages.length > 1) {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
      }
    }, 5000);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(sliderInterval);
    };
  }, [bgImages.length]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);

      setIsSuccess(true);

      setTimeout(() => {
        if (data.role === 'Student') {
          navigate('/student-dashboard');
        } else if (data.role === 'Employee') {
          navigate('/employee-dashboard');
        } else {
          navigate('/');
        }
      }, 1500); 

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 relative flex items-center justify-center p-4 font-sans text-slate-800 overflow-hidden">

      {/* Home Icon Top Left */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 bg-white/70 backdrop-blur-md hover:bg-white text-slate-700 hover:text-indigo-600 p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110"
        title="Go to Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>

      {/* Loading Animation */}
      {isLoading && (
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

      {/* HD Background Image Slider Container */}
      <div className="absolute top-0 left-0 w-full h-[50dvh] z-0 bg-slate-200">
        {bgImages.map((img, index) => (
          <img 
            key={index}
            src={img} 
            alt={`Campus Background ${index + 1}`} 
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
              currentImageIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Quality Blend Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-slate-50"></div>
      </div>

      {/* Deep Shadow Login Card */}
      <div 
        className={`z-10 w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 relative overflow-hidden transition-all duration-1000 ease-out transform
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_15px_30px_-10px_rgba(0,0,0,0.08)]
          ${isMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}
        `}
      >
        {/* Success Animation Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-500">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4 shadow-xl animate-bounce">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Welcome Back!</h3>
            <p className="text-teal-700 text-sm font-semibold animate-pulse">Logging you in...</p>
          </div>
        )}

        {/* Form Header */}
        <div className="text-center mb-7">
          <img src={logo} alt="LearnBuddy" className="w-14 h-14 mx-auto rounded-full border-2 border-indigo-100 mb-4 shadow-md" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-slate-600 text-sm mt-1.5 font-medium">Sign in to continue to LearnBuddy</p>
        </div>

        {error && <div className="mb-5 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm text-center font-medium shadow-inner">{error}</div>}

        {/* Login Form Layout */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" 
              placeholder="john@example.com" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm tracking-wide"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-600 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-indigo-700 hover:text-teal-600 transition-colors">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signin;