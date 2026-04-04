import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/learnbuddy-logo.jpg';
import API_URL from '../../api/config';

const NavLink = ({ to, children, onClick, className = '' }) => {
  const baseClasses = "text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none";
  return to ? (
    <Link to={to} className={`${baseClasses} ${className}`}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
};

const DropdownArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const StudentNavbar = () => {
  const navigate = useNavigate();
  const profileImage = localStorage.getItem('profileImage');

  // Get actual user ID from localStorage if available, fallback to a default or handle it
  const userId = localStorage.getItem('userId') || '';

  const [unreadCount, setUnreadCount] = useState(0);

  // Helper to get the storage key for this student
  const getStorageKey = () => `announcement_last_seen_id_${userId}`;

  useEffect(() => {
    // Only fetch if we have a valid userId
    if (!userId) return;

    const fetchAnnouncementCount = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        const announcements = Array.isArray(data) ? data : (data.data ?? []);
        const total = announcements.length;

        const storageKey = getStorageKey();
        const lastSeenCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
        const newCount = Math.max(0, total - lastSeenCount);
        setUnreadCount(newCount);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
    };

    fetchAnnouncementCount();
  }, [userId]); // Re-run when userId changes (e.g., login/logout)

  const handleBellClick = () => {
    // Immediately clear the badge for a responsive UI
    setUnreadCount(0);

    // Update the stored "last seen" count for this student
    fetch(`${API_URL}/announcements`)
      .then(r => r.json())
      .then(data => {
        const announcements = Array.isArray(data) ? data : (data.data ?? []);
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, String(announcements.length));
      })
      .catch(err => console.error('Failed to update announcement read status:', err));

    navigate('/student/announcements');
  };

  return (
    <nav className="w-full backdrop-blur-md bg-white/70 px-6 py-2.5 flex justify-between items-center sticky top-0 z-50 border-b border-white/20 shadow-lg">

      {/* Left Side: Logo & Brand */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate('/student-dashboard')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/student-dashboard')}
      >
        <img
          src={logo}
          alt="LearnBuddy"
          className="w-10 h-10 rounded-full border-2 border-white/50 shadow-md group-hover:border-indigo-300 transition-all duration-200 object-cover"
        />
        <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent hidden sm:block group-hover:opacity-80 transition-opacity">
          LearnBuddy
        </span>
      </div>

      {/* Middle: Nav Links */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Home Button */}
        <NavLink to="/student-dashboard">Home</NavLink>

        {/* Faculty Dropdown */}
        <div className="relative group">
          <button className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 group-hover:bg-indigo-50/80 px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1 cursor-pointer backdrop-blur-sm">
            Faculty
            <DropdownArrow />
          </button>

          {/* Faculty Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-44 backdrop-blur-md bg-white/90 shadow-xl rounded-xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
            <Link
              to="/student/faculties"
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-indigo-50/80 hover:text-indigo-600 hover:pl-5 transition-all duration-200 cursor-pointer border-b border-white/20"
            >
              All Faculties
            </Link>
          </div>
        </div>

        <NavLink to="/student/saved-modules">My Modules</NavLink>
        <NavLink to="/contact">Support</NavLink>

        {/* AI Bot Dropdown */}
        <div className="relative group">
          <button className="text-sm font-semibold text-slate-600 group-hover:text-teal-600 group-hover:bg-teal-50/80 px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1 cursor-pointer backdrop-blur-sm">
            AI Bot
            <DropdownArrow />
          </button>

          {/* AI Bot Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-52 backdrop-blur-md bg-white/90 shadow-xl rounded-xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
            <Link
              to="/ai/note-summaries"
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-teal-50/80 hover:text-teal-600 hover:pl-5 transition-all duration-200 cursor-pointer border-b border-white/20"
            >
              Note Summaries
            </Link>
            <Link 
              to="/resource-finder" 
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-teal-50/80 hover:text-teal-600 hover:pl-5 transition-all duration-200 cursor-pointer border-b border-white/20"
            >
              Resources Finder
            </Link>
            <Link
              to="/ai/qa-generator"
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-teal-50/80 hover:text-teal-600 hover:pl-5 transition-all duration-200 cursor-pointer border-b border-white/20"
            >
              Q&A Generator
            </Link>
            <Link
              to="/timetable-generator"
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-teal-50/80 hover:text-teal-600 hover:pl-5 transition-all duration-200 cursor-pointer"
            >
              Time Table Generator
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side: Bell + Profile */}
      <div className="flex items-center gap-3 border-l border-white/20 pl-4 sm:pl-6">

        {/* Notification Bell */}
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all duration-200 cursor-pointer"
          aria-label="Announcements"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <Link
          to={userId ? `/users/${userId}` : "#"}
          className="relative group cursor-pointer block"
          aria-label="My Profile"
        >
          {profileImage && profileImage !== 'undefined' ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/50 group-hover:border-indigo-500 group-hover:shadow-md transition-all duration-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100/90 to-teal-100/90 backdrop-blur-sm flex items-center justify-center text-indigo-700 font-bold text-lg border-2 border-white/50 group-hover:border-indigo-500 group-hover:shadow-md transition-all duration-200">
              U
            </div>
          )}
          <span className="absolute top-12 left-1/2 -translate-x-1/2 backdrop-blur-md bg-slate-800/90 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-white/10">
            My Profile
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default StudentNavbar;