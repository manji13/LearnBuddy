import React from 'react';
import Navbar from '../../Components/NavBar/NavBar.jsx'; // Ensure this path points to your new Navbar.jsx

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mt-4 relative overflow-hidden">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight relative z-10">
            Student Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-medium relative z-10">
            Welcome to your student portal. Access your tools and study materials here.
          </p>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
             <div className="h-48 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-indigo-600 font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               AI Generator Hub
             </div>
             
             <div className="h-48 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 flex flex-col items-center justify-center text-teal-600 font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Past Papers Archive
             </div>
             
             <div className="h-48 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-600 font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
               My Courses
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;