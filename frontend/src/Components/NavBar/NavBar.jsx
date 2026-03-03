import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/learnbuddy-logo.jpg'; // Ensure this path is correct

const StudentNavbar = () => {
  const navigate = useNavigate();
  const profileImage = localStorage.getItem('profileImage');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] px-6 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-slate-100">
      
      {/* Left Side: Logo & Brand */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <img src={logo} alt="LearnBuddy" className="w-10 h-10 rounded-full border border-indigo-100 shadow-sm object-cover" />
        <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent hidden sm:block">
          LearnBuddy
        </span>
      </div>

      {/* Middle: Navigation Links & Dropdowns */}
      <div className="flex items-center gap-2 sm:gap-6">
        
        {/* Home Button */}
        <Link 
          to="/student-dashboard" 
          className="text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all cursor-pointer"
        >
          Home
        </Link>

        {/* Faculty Dropdown */}
        <div className="relative group cursor-pointer">
          <div className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 group-hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all flex items-center gap-1">
            Faculty
            {/* Dropdown Arrow */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Faculty Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg rounded-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col overflow-hidden">
            <Link to="/faculty/engineer" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer border-b border-slate-50">
              Engineer
            </Link>
            <Link to="/faculty/computing" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">
              Computing
            </Link>
          </div>
        </div>

        {/* Support Button */}
        <Link 
          to="/support" 
          className="text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all cursor-pointer"
        >
          Support
        </Link>

        {/* AI Bot Dropdown */}
        <div className="relative group cursor-pointer">
          <div className="text-sm font-bold text-slate-600 group-hover:text-teal-600 group-hover:bg-teal-50 px-3 py-2 rounded-lg transition-all flex items-center gap-1">
            AI Bot
            {/* Dropdown Arrow */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          {/* AI Bot Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col overflow-hidden">
            <Link to="/ai/note-summaries" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer border-b border-slate-50">
              Note Summaries
            </Link>
            <Link to="/ai/resources-finder" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer border-b border-slate-50">
              Resources Finder
            </Link>
            <Link to="/ai/qa-generator" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer border-b border-slate-50">
              Q&A Generator
            </Link>
            <Link to="/ai/timetable-generator" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer">
              Time Table Generator
            </Link>
          </div>
        </div>

      </div>

      {/* Right Side: Profile & Logout */}
      <div className="flex items-center gap-4 border-l border-slate-200 pl-4 sm:pl-6">
        
        {/* Profile Icon */}
        <Link to="/users/:id" className="relative group cursor-pointer block transform transition-transform hover:scale-105">
          {profileImage && profileImage !== 'undefined' ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 group-hover:border-indigo-500 transition-colors shadow-sm" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-teal-100 flex items-center justify-center text-indigo-700 font-extrabold border-2 border-transparent group-hover:border-indigo-500 transition-colors shadow-sm">
              U
            </div>
          )}
          {/* Tooltip */}
          <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            My Profile
          </span>
        </Link>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          className="text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>
    </nav>
  );
};

export default StudentNavbar;