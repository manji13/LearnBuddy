import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/learnbuddy-logo.jpg';

const Navbar = () => {
  const navigate = useNavigate();
  const profileImage = localStorage.getItem('profileImage');
  const userRole = localStorage.getItem('userRole'); // Automatically gets the role

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] px-6 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-slate-100">
      
      {/* Left Side: Logo & Brand */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="LearnBuddy" className="w-10 h-10 rounded-full border border-indigo-100 shadow-sm object-cover" />
        <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent hidden sm:block">
          LearnBuddy
        </span>
      </div>

      {/* Middle: Dynamic Role-Based Links */}
      <div className="flex items-center gap-2 sm:gap-6">
        
        {/* Render Student Links */}
        {userRole === 'Student' && (
          <>
            <Link 
              to="/all-generator" 
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
            >
              All Generator
            </Link>
            <Link 
              to="/past-papers" 
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
            >
              Past Papers
            </Link>
          </>
        )}

        {/* Render Employee/Admin Links */}
        {(userRole === 'Employee' || userRole === 'Admin') && (
          <>
            <Link 
              to="/add-notes" 
              className="text-sm font-bold text-slate-600 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-lg transition-all"
            >
              Add Notes
            </Link>
            <Link 
              to="/admin/users" 
              className="text-sm font-bold text-slate-600 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-lg transition-all"
            >
              Users
            </Link>
          </>
        )}
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
          className="text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
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

export default Navbar;