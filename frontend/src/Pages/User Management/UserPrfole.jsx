import API_URL from '../../api/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/NavBar/ProfileNavbar';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    campus: '',
    profileImage: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imageHovered, setImageHovered] = useState(false);
  const navigate = useNavigate();
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      localStorage.clear();
      navigate('/login');
      return;
    }
    
    fetchUserProfile();
  }, [userId, navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          campus: data.campus || '',
          profileImage: (data.profileImage && data.profileImage !== 'undefined') ? data.profileImage : ''
        });
      } else {
        console.error("Failed to load user:", data.message);
        setMessage({ text: 'Failed to load user data.', type: 'error' });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ text: 'Server connection error.', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Saving changes...', type: 'loading' });

    try {
      const response = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        
        if (formData.profileImage) {
          localStorage.setItem('profileImage', formData.profileImage);
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error occurred. Is the server running?', type: 'error' });
    }
  };

  const getProfileDisplayImage = () => {
    if (formData.profileImage && formData.profileImage !== '') {
      return formData.profileImage;
    }
    return `https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=4f46e5&color=fff&size=150&bold=true&length=2`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-teal-400 rounded-full animate-spin animate-pulse"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-200 rounded-full animate-ping opacity-25"></div>
        </div>
        <div className="mt-8 text-indigo-600 font-bold text-xl">Loading Your Profile...</div>
        <div className="text-slate-400 text-sm mt-2">Please wait while we fetch your details</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 font-sans">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-80 -right-80 w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-80 -left-80 w-[600px] h-[600px] bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-32 right-[15%] w-3 h-3 bg-teal-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-1/3 right-[20%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-1/4 left-[25%] w-2 h-2 bg-indigo-300 rounded-full animate-ping delay-700 opacity-40"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar - Sticky */}
          <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-8 z-20">
            <div className="transform transition-all duration-300 hover:translate-x-1">
              <Navbar />
            </div>
          </div>

          {/* Right Content Area - Full Width */}
          <main className="flex-1 w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden w-full transform transition-all duration-500 hover:shadow-3xl">
              
              {/* Premium Header with Wave Effect */}
              <div className="relative h-40 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 overflow-hidden">
                <svg className="absolute bottom-0 left-0 w-full h-16 text-white/10" preserveAspectRatio="none" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" fill="white"/>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="relative h-full flex items-center justify-end px-8 lg:px-12">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-white/90 text-sm font-medium">Profile Active</span>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 lg:px-12 pb-12 pt-0 relative">
                
                {/* Profile Picture - Centered and Elevated */}
                <div className="relative w-36 h-36 mx-auto -mt-20 mb-8">
                  <div 
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setImageHovered(true)}
                    onMouseLeave={() => setImageHovered(false)}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <img 
                      src={getProfileDisplayImage()} 
                      alt="Profile" 
                      className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-2xl bg-white z-10 transition-all duration-300 group-hover:scale-105"
                    />
                    {imageHovered && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-20 transition-all duration-300 backdrop-blur-sm">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white p-2.5 rounded-full cursor-pointer shadow-xl transition-all duration-300 z-30 hover:scale-110 border-2 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>

                {/* User Info Header */}
                <div className="text-center mb-10">
                  <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-slate-800 via-slate-700 to-indigo-600 bg-clip-text text-transparent">
                    {formData.fullName || 'LearnBuddy User'}
                  </h1>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-400 to-transparent rounded-full"></div>
                    <p className="text-sm text-slate-500 font-medium">Manage Your Personal Information</p>
                    <div className="w-16 h-0.5 bg-gradient-to-l from-teal-400 to-transparent rounded-full"></div>
                  </div>
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-indigo-50 rounded-full">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span className="text-xs text-indigo-600 font-medium">Member since 2024</span>
                  </div>
                </div>

                {/* Alert Messages */}
                {message.text && (
                  <div className={`mb-8 p-4 rounded-xl text-sm font-medium transition-all duration-300 transform animate-fadeIn ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-lg' : 
                    message.type === 'loading' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-lg' :
                    'bg-rose-50 text-rose-700 border border-rose-200 shadow-lg'
                  }`}>
                    <div className="flex items-center gap-3">
                      {message.type === 'success' && (
                        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {message.type === 'loading' && (
                        <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      )}
                      {message.type === 'error' && (
                        <svg className="w-5 h-5 animate-shake" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className="flex-1">{message.text}</span>
                      {message.type !== 'loading' && (
                        <button onClick={() => setMessage({ text: '', type: '' })} className="text-slate-400 hover:text-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    
                    {/* Full Name */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 text-sm bg-slate-50 hover:bg-white group-hover:border-indigo-200"
                        required 
                      />
                    </div>
                    
                    {/* Email */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 text-sm bg-slate-50 hover:bg-white group-hover:border-indigo-200"
                        required 
                      />
                    </div>
                    
                    {/* Phone Number */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone Number
                      </label>
                      <input 
                        type="text" 
                        name="phoneNumber" 
                        value={formData.phoneNumber} 
                        onChange={handleChange} 
                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 text-sm bg-slate-50 hover:bg-white group-hover:border-indigo-200"
                        required 
                      />
                    </div>
                    
                    {/* Campus */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Campus
                      </label>
                      <input 
                        type="text" 
                        name="campus" 
                        value={formData.campus} 
                        onChange={handleChange} 
                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 text-sm bg-slate-50 hover:bg-white group-hover:border-indigo-200"
                        required 
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button 
                      type="submit" 
                      disabled={message.type === 'loading'} 
                      className="flex-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <span className="flex items-center justify-center gap-3">
                        {message.type === 'loading' ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData({
                          fullName: formData.fullName,
                          email: formData.email,
                          phoneNumber: formData.phoneNumber,
                          campus: formData.campus,
                          profileImage: formData.profileImage
                        });
                        setMessage({ text: 'Changes discarded', type: 'error' });
                        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
                      }}
                      className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 px-6 rounded-xl hover:bg-slate-50 hover:border-slate-300 transform transition-all duration-200 text-sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Discard
                      </span>
                    </button>
                  </div>
                </form>

                {/* Footer Info */}
                <div className="mt-10 pt-6 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secure & Encrypted
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified Account
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Fast Support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;