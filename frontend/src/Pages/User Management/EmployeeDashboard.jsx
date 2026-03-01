import React from 'react';
import Navbar from '../../Components/NavBar/NavBar.jsx'; // Ensure this path points to your new Navbar.jsx

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mt-4 relative overflow-hidden">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight relative z-10">
            Employee Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-medium relative z-10">
            Welcome to the employee portal. Manage internal notes and user accounts here.
          </p>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
             <div className="h-56 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-700 font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               Create & Manage Notes
             </div>
             
             <div className="h-56 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-700 font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               Manage LearnBuddy Users
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;