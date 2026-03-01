import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/learnbuddy-logo.jpg';
import topBgImage from '../../assets/Signup_img.jpg';

const Signup = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    campus: '',
    password: '',
    confirmPassword: '',
    profileImage: '' // NEW: Added to state
  });

  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [error, setError] = useState('');

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setIsMounted(true), 50);
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // NEW: Handle File Upload & Convert to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
        setImagePreview(reader.result);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          campus: formData.campus,
          password: formData.password,
          profileImage: formData.profileImage // Include image payload
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 relative flex items-center justify-center p-4 font-sans text-slate-800 overflow-hidden">
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

      {/* HD Background Rendering */}
      <div className="absolute top-0 left-0 w-full h-[50dvh] z-0">
        <img
          src={topBgImage}
          alt="Campus Background"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-slate-50"></div>
      </div>

      {/* Deep Shadow Registration Card */}
      <div
        className={`z-10 w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 relative overflow-hidden transition-all duration-1000 ease-out transform
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_15px_30px_-10px_rgba(0,0,0,0.08)]
          ${isMounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}
        `}
      >
        {isSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-500">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4 shadow-xl animate-bounce">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Registration Successful!</h3>
            <p className="text-teal-700 text-sm font-semibold animate-pulse">Redirecting to login...</p>
          </div>
        )}

        {/* Form Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img 
              src={imagePreview || logo} 
              alt="Profile Preview" 
              className="w-16 h-16 mx-auto rounded-full border-2 border-indigo-100 mb-2 shadow-md object-cover" 
            />
            {/* Custom File Input Button floating over image */}
            <label className="absolute bottom-2 -right-2 bg-indigo-600 hover:bg-teal-500 text-white p-1.5 rounded-full cursor-pointer shadow-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent">Create an Account</h2>
          <p className="text-slate-600 text-sm mt-1.5 font-medium">Join LearnBuddy today</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm text-center font-medium shadow-inner">{error}</div>}

        {/* Compact Form Layout */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Full Name</label>
              <input type="text" name="fullName" required onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Email</label>
              <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" placeholder="john@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Phone Number</label>
              <input type="text" name="phoneNumber" required onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Campus</label>
              <input type="text" name="campus" required onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" placeholder="Main Campus" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Password</label>
              <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Confirm Password</label>
              <input type="password" name="confirmPassword" required onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-white hover:border-slate-300" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="w-full mt-5 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm tracking-wide">
            Sign Up
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-700 hover:text-teal-600 transition-colors">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;