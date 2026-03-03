import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/NavBar/NavBar.jsx';

// Import your images directly from the assets folder
import heroImg1 from '../../assets/hero-student-studying.jpg';
import heroImg2 from '../../assets/Signin_img2.jpg';
import heroImg3 from '../../assets/Signin_img3.jpg';
import logo from '../../assets/learnbuddy-logo.jpg';

const StudentDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const backgroundImages = [heroImg1, heroImg2, heroImg3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Loading animation
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Image slider interval - Simplified for smoother transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
    }, 7000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pb-12">

      {/* Loading Animation - Same as Home.jsx */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 border-r-indigo-600"></div>
              {/* Inner pulse ring */}
              <div className="absolute inset-2 border-4 border-transparent rounded-full animate-pulse border-t-teal-500"></div>
              {/* Center logo */}
              <img
                src={logo}
                alt="Logo"
                className="absolute inset-0 w-12 h-12 m-auto rounded-full object-cover border-2 border-indigo-300"
              />
            </div>
            <p className="text-lg font-semibold text-indigo-600 animate-pulse">Loading LearnBuddy...</p>
          </div>
        </div>
      )}

      {/* Main Content with Fade-in Animation */}
      <div className={`transition-all duration-1000 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Navbar />

        {/* 1. HERO SECTION */}
        <div className="relative w-full min-h-[500px] h-[70vh] flex items-center justify-center overflow-hidden">

          {/* Smooth Background Images Transition */}
          {backgroundImages.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${img})`,
                zIndex: index === currentImageIndex ? 2 : 1,
                opacity: index === currentImageIndex ? 1 : 0,
                transition: 'opacity 1500ms ease-in-out',
              }}
            />
          ))}

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/90 pointer-events-none"
            style={{ zIndex: 3 }}
          />

          {/* Text Content */}
          <div className="relative text-center px-6 w-full max-w-4xl mx-auto flex flex-col items-center" style={{ zIndex: 4 }}>
            <span className="mb-5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-semibold tracking-wider uppercase shadow-lg animate-in fade-in-down">
              Welcome to LearnBuddy
            </span>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-10 rounded-3xl shadow-2xl animate-in fade-in-up animation-delay-200">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 mb-5 tracking-tight drop-shadow-lg">
                How We Help Students
              </h1>
              <p className="text-base md:text-lg text-slate-100 leading-relaxed font-medium drop-shadow-md max-w-3xl mx-auto">
                Navigating university life can be overwhelming, but you don't have to do it alone. We provide a centralized, easy-to-use hub where you can access faculty-specific materials, organize your coursework, and find the exact resources you need right when you need them. Whether you are preparing for tough exams or just trying to stay on top of daily lectures, our platform is designed to streamline your workflow, reduce academic stress, and help you study smarter, not harder.
              </p>
            </div>
          </div>

          {/* Slider Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 items-center" style={{ zIndex: 4 }}>
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-700 ease-in-out ${
                  index === currentImageIndex
                    ? 'bg-indigo-400 w-10 shadow-[0_0_12px_rgba(129,140,248,0.8)]'
                    : 'bg-white/40 w-2 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block opacity-70" style={{ zIndex: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* 2. MISSION & TARGET SECTION WITH HOVER EFFECTS */}
        <div className="container mx-auto px-6 mt-16 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Mission Card */}
            <div className="relative group overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-[400px] animate-in fade-in-up animation-delay-200">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                style={{ backgroundImage: `url(${heroImg1})` }}
              />
              <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/80 transition-colors duration-500" />
              
              <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center transform transition-all duration-500">
                <div className="w-16 h-16 bg-indigo-50/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-300 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-4 drop-shadow-md">Our Mission</h2>
                
                <div className="opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out h-0 group-hover:h-auto">
                  <p className="text-slate-200 text-lg leading-relaxed mt-4">
                    To empower students by providing an intuitive, all-in-one educational platform that bridges the gap between raw information and effective learning.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Card */}
            <div className="relative group overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-[400px] animate-in fade-in-up animation-delay-400">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                style={{ backgroundImage: `url(${heroImg2})` }}
              />
              <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/80 transition-colors duration-500" />
              
              <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center transform transition-all duration-500">
                <div className="w-16 h-16 bg-teal-50/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-300 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-4 drop-shadow-md">Our Target</h2>
                
                <div className="opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out h-0 group-hover:h-auto">
                  <p className="text-slate-200 text-base md:text-lg leading-relaxed mt-4">
                    We are built for dedicated learners—from Engineering to Computing and beyond. We aim to replace scattered notes and endless web searching with structured, accessible, and intelligent study tools, ensuring that every student has the resources they need to achieve their highest academic potential.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. AI STUDY ASSISTANTS SECTION */}
        <div className="container mx-auto px-6 mt-20 max-w-7xl">
          <div className="text-center mb-12 animate-in fade-in-down">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Meet Your AI Study Assistants</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Supercharge your study sessions and save hours of manual work with our suite of built-in AI tools.
            </p>
          </div>

          {/* AI Tools Grid (4 items with hover effects) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* AI Tool 1: Note Summary Generator */}
            <div className="relative group overflow-hidden rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 h-[320px] cursor-pointer animate-in fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110" style={{ backgroundImage: `url(${heroImg3})` }} />
              <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-indigo-900/80 transition-colors duration-500" />
              
              <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center text-center transform transition-all duration-500">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:-translate-y-2 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Note Summary</h3>
                
                <div className="opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out h-0 group-hover:h-auto overflow-hidden">
                  <p className="text-slate-200 text-sm leading-relaxed mt-2">
                    Instantly condense long lectures and heavy reading materials into bite-sized, easy-to-review key points.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Tool 2: Resource Finder */}
            <div className="relative group overflow-hidden rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 h-[320px] cursor-pointer animate-in fade-in-up animation-delay-300">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110" style={{ backgroundImage: `url(${heroImg1})` }} />
              <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-teal-900/80 transition-colors duration-500" />
              
              <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center text-center transform transition-all duration-500">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:-translate-y-2 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Resource Finder</h3>
                
                <div className="opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out h-0 group-hover:h-auto overflow-hidden">
                  <p className="text-slate-200 text-sm leading-relaxed mt-2">
                    Skip the endless scrolling and let our AI quickly locate the exact study materials, links, and documents relevant to your course.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Tool 3: Papers Generator */}
            <div className="relative group overflow-hidden rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 h-[320px] cursor-pointer animate-in fade-in-up animation-delay-400">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110" style={{ backgroundImage: `url(${heroImg2})` }} />
              <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-purple-900/80 transition-colors duration-500" />
              
              <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center text-center transform transition-all duration-500">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:-translate-y-2 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Papers Generator</h3>
                
                <div className="opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out h-0 group-hover:h-auto overflow-hidden">
                  <p className="text-slate-200 text-sm leading-relaxed mt-2">
                    Test your knowledge before the real exam by generating custom Q&A sets and practice papers based on your syllabus.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Tool 4: Time Table Generator */}
            <div className="relative group overflow-hidden rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 h-[320px] cursor-pointer animate-in fade-in-up animation-delay-500">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110" style={{ backgroundImage: `url(${heroImg3})` }} />
              <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-blue-900/80 transition-colors duration-500" />
              
              <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center text-center transform transition-all duration-500">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:-translate-y-2 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Time Table Gen</h3>
                
                <div className="opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out h-0 group-hover:h-auto overflow-hidden">
                  <p className="text-slate-200 text-sm leading-relaxed mt-2">
                    Create a balanced, perfectly optimized study schedule tailored to your personal habits, upcoming deadlines, and exam dates.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. CONTACT US SECTION */}
        <div className="container mx-auto px-6 mt-20 max-w-6xl mb-12">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] shadow-2xl p-8 md:p-14 text-center text-white relative overflow-hidden animate-in fade-in-up">
            
            {/* Decorative background blur element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 relative z-10">How to Contact Us</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Got a question, facing a technical issue, or have a great idea to make the platform even better? We are always here to help! Reach out to our dedicated support team, and we will get back to you as quickly as possible.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 relative z-10">
              
              {/* Email Contact */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <div className="p-2 bg-indigo-500/30 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="font-semibold text-slate-100 text-lg">support@learnbuddy.com</span>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-default">
                <div className="p-2 bg-teal-500/30 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-100 text-sm">Mon - Fri</p>
                  <p className="text-slate-300 text-xs">9:00 AM – 6:00 PM</p>
                </div>
              </div>

              {/* Direct Support Ticket - UPDATED */}
              <button className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-semibold text-sm cursor-pointer transition-colors shadow-lg shadow-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Direct Support
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Keyframes and Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInSlide {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-in { 
          animation: fadeIn 0.6s ease-in-out forwards; 
        }
        
        .fade-in-down { 
          animation: fadeInDown 0.6s ease-out; 
        }
        
        .fade-in-up { 
          animation: fadeInUp 0.6s ease-out; 
        }
        
        .slide-in-from-left { 
          animation: slideInFromLeft 0.8s ease-out; 
        }
        
        .slide-in-from-right { 
          animation: slideInFromRight 0.8s ease-out; 
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;