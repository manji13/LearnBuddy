import API_URL from '../../api/config';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import ProfileNavbar from '../../Components/NavBar/ProfileNavbar.jsx';

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
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  // Wrapped in useCallback to prevent unnecessary re-renders and fix useEffect warnings
  const fetchUserProfile = useCallback(async () => {
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
        setMessage({ text: 'Failed to load user data.', type: 'error' });
      }
      setIsLoading(false);
    } catch (error) {
      setMessage({ text: 'Server connection error.', type: 'error' });
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      localStorage.clear();
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [userId, navigate, fetchUserProfile]);

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
        setIsEditing(false);

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
      setMessage({ text: 'Network error occurred.', type: 'error' });
    }
  };

  const handleCancel = () => {
    fetchUserProfile();
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f4f6fb]">

      {/* Top Bar — no search, no bell */}
      <div className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-800 tracking-tight">
            Welcome,{' '}
            <span className="text-indigo-600">{formData.fullName?.split(' ')[0] || 'User'}</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">{today}</p>
        </div>
        <img
          src={
            formData.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=4f46e5&color=fff&size=40`
          }
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 py-7">

        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-20 md:h-fit">
          <ProfileNavbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">

          {/* Alert */}
          {message.text && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : message.type === 'loading'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {message.type === 'success' && (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {message.text}
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Banner */}
            <div
              className="h-32 w-full relative"
              style={{
                background: 'linear-gradient(120deg, #bfcfff 0%, #d4e8f7 50%, #fde8d0 100%)'
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%),
                                    radial-gradient(circle at 80% 20%, #38bdf8 0%, transparent 40%)`
                }}
              />
            </div>

            {/* Profile Header */}
            <div className="px-7 -mt-11 pb-5 flex items-end justify-between">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="relative group">
                  <img
                    src={
                      formData.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=4f46e5&color=fff&size=88`
                    }
                    alt="Profile"
                    className="w-[88px] h-[88px] rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                  <label className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg cursor-pointer transition-all shadow-md group-hover:scale-110">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>

                {/* Name / email / campus badge */}
                <div className="mb-1.5">
                  <p className="text-[17px] font-bold text-gray-900 leading-tight">
                    {formData.fullName || 'Your Name'}
                  </p>
                  <p className="text-[13px] text-gray-400 mt-0.5">{formData.email || 'your@email.com'}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                    {formData.campus || 'Campus'}
                  </span>
                </div>
              </div>

              {/* Edit / Cancel toggle */}
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="mb-1 flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-indigo-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 2.828L11.828 13.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                  </svg>
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mb-1 flex items-center gap-1.5 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-7" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Personal Information
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Your Phone Number"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="your@email.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                    required
                  />
                </div>

                {/* Campus */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Campus</label>
                  <input
                    type="text"
                    name="campus"
                    value={formData.campus}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Your Campus"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                    required
                  />
                </div>

              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={message.type === 'loading'}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-indigo-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {message.type === 'loading' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Email Info Section — no add button */}
            <div className="border-t border-gray-100 mx-7" />
            <div className="px-7 py-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                My Email Address
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{formData.email || 'your@email.com'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">1 month ago</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;