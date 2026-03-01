import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/NavBar/NavBar'; // Make sure this path points to your new Navbar

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
  const navigate = useNavigate();
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // If no userId exists or it's 'undefined', force the user to log in again
    if (!userId || userId === 'undefined' || userId === 'null') {
      localStorage.clear();
      navigate('/login');
      return;
    }
    
    fetchUserProfile();
  }, [userId, navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          campus: data.campus || '',
          // Ensure we don't save the literal string "undefined" into state
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

  // Convert new uploaded image to Base64 instantly
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
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        
        // Update the image in local storage so the Navbar updates instantly
        if (formData.profileImage) {
          localStorage.setItem('profileImage', formData.profileImage);
        }
        
        // Refresh the page slightly to ensure the Navbar re-renders with the new image
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

  // Helper function to handle missing profile images gracefully
  const getProfileDisplayImage = () => {
    if (formData.profileImage && formData.profileImage !== '') {
      return formData.profileImage;
    }
    // Beautiful fallback if no image exists
    return `https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=4f46e5&color=fff&size=150`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <div className="text-indigo-600 font-bold">Loading Your Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <main className="max-w-2xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Header Graphic */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-teal-400"></div>

          <div className="p-8 pt-0 relative">
            
            {/* Profile Picture Upload Container */}
            <div className="relative w-28 h-28 mx-auto -mt-14 mb-6">
              <img 
                src={getProfileDisplayImage()} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg bg-white"
              />
              <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-teal-500 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-slate-800">{formData.fullName || 'LearnBuddy User'}</h1>
              <p className="text-sm text-slate-500 font-medium">Manage your personal information</p>
            </div>

            {/* Alert Messages */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm text-center font-bold transition-all ${
                message.type === 'success' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 
                message.type === 'loading' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Phone Number</label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Campus</label>
                  <input type="text" name="campus" value={formData.campus} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50" required />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={message.type === 'loading'} className="w-full bg-slate-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:bg-indigo-600 hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.98] text-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;