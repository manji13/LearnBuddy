import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/learnbuddy-logo.jpg'; // Adjust path if needed

const EmployeeNavbar = () => {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false); // NEW STATE FOR MANAGE DROPDOWN
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const analysisRef = useRef(null);
  const manageRef = useRef(null); // NEW REF FOR MANAGE DROPDOWN
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (analysisRef.current && !analysisRef.current.contains(event.target)) {
        setIsAnalysisOpen(false);
      }
      if (manageRef.current && !manageRef.current.contains(event.target)) {
        setIsManageOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Add your logout logic here (e.g., clearing localStorage/tokens)
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left Side: Logo & Brand */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/admin-dashboard')}>
            <img src={logo} alt="LearnBuddy Logo" className="h-10 w-10 rounded-full border border-indigo-100 object-cover" />
            <span className="ml-3 text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent hidden sm:block">
              LearnBuddy
            </span>
            <span className="ml-2 text-sm font-medium text-slate-500 hidden sm:block">| Employee Workspace</span>
          </div>

          {/* Right Side: Navigation Links & Profile */}
          <div className="flex items-center space-x-6">
            
            {/* ========================================== */}
            {/* NEW: Manage (Faculties/Semesters/Modules) Dropdown */}
            {/* ========================================== */}
            <div className="relative" ref={manageRef}>
              <button 
                onClick={() => {
                  setIsManageOpen(!isManageOpen);
                  setIsAnalysisOpen(false); // Close others
                  setIsProfileOpen(false);
                }}
                className="flex items-center text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors duration-200 focus:outline-none cursor-pointer"
              >
                Manage
                <svg className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isManageOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isManageOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-fade-in-down origin-top-right">
                  <Link 
                    to="/admin-dashboard" 
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => setIsManageOpen(false)}
                  >
                    <div className="flex items-center cursor-pointer">
                      <span className="mr-3 text-lg">📊</span> Dashboard
                    </div>
                  </Link>
                  <Link 
                    to="/faculties" 
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => setIsManageOpen(false)}
                  >
                    <div className="flex items-center cursor-pointer">
                      <span className="mr-3 text-lg">🏛️</span> Faculties
                    </div>
                  </Link>
                  <Link 
                    to="/semesters" 
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => setIsManageOpen(false)}
                  >
                    <div className="flex items-center cursor-pointer">
                      <span className="mr-3 text-lg">📅</span> Semesters
                    </div>
                  </Link>
                  <Link 
                    to="/modules" 
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => setIsManageOpen(false)}
                  >
                    <div className="flex items-center cursor-pointer">
                      <span className="mr-3 text-lg">📚</span> Modules
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Analysis Dropdown */}
            <div className="relative" ref={analysisRef}>
              <button 
                onClick={() => {
                  setIsAnalysisOpen(!isAnalysisOpen);
                  setIsManageOpen(false); // Close others
                  setIsProfileOpen(false);
                }}
                className="flex items-center text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors duration-200 focus:outline-none cursor-pointer"
              >
                Analysis
                <svg className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isAnalysisOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Analysis Dropdown Menu */}
              {isAnalysisOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-fade-in-down origin-top-right">
                  <Link 
                    to="/employee/users" 
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => setIsAnalysisOpen(false)}
                  >
                    <div className="flex items-center cursor-pointer">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      User Details
                    </div>
                  </Link>
                  <Link 
                    to="/admin-dashboard" 
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    onClick={() => setIsAnalysisOpen(false)}
                  >
                    <div className="flex items-center cursor-pointer">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      Student Analysis
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-300"></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsAnalysisOpen(false); // Close others
                  setIsManageOpen(false);
                }}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 focus:outline-none transition-colors cursor-pointer"
              >
                {/* Default User SVG Icon */}
                <svg className="h-6 w-6 text-slate-600 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-fade-in-down origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">Employee Account</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">employee@learnbuddy.com</p>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors mt-1 cursor-pointer"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  
                  <div className="border-t border-slate-100 mt-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default EmployeeNavbar;