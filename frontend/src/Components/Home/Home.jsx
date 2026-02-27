import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../assets/hero-student-studying.jpg';
import logo from '../../assets/learnbuddy-logo.jpg';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Simulate page loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-slate-50 font-sans text-slate-800">

      {/* Loading Animation */}
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

      {/* Main Content */}
      <div className={`transition-all duration-1000 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-3 shadow-md md:px-12 border-b border-gray-200 animate-in fade-in-down">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative overflow-hidden rounded-full">
              <img
                src={logo}
                alt="LearnBuddy Logo"
                className="h-12 w-12 object-cover rounded-full border-2 border-indigo-200 group-hover:border-indigo-600 transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent group-hover:from-teal-500 group-hover:to-indigo-700 transition-all duration-300">
              LearnBuddy
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate('/login')}
              className="cursor-pointer relative overflow-hidden rounded-lg border-2 border-indigo-600 px-4 py-2 font-semibold text-indigo-600 transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-700 active:scale-95 md:px-6 group"
            >
              <span className="relative z-10">Sign In</span>
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="cursor-pointer relative overflow-hidden rounded-lg border-2 border-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:border-teal-600 active:scale-95 md:px-6 group"
            >
              <span className="relative z-10">Sign Up</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-20"></div>
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col-reverse items-center justify-between gap-8 bg-gradient-to-r from-indigo-50 via-white to-teal-50 px-6 py-12 md:flex-row md:px-12 md:py-24 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="mt-10 flex-1 text-center md:mt-0 md:pr-10 md:text-left animate-in fade-in slide-in-from-left duration-1000 relative z-10">
            <div className="inline-block mb-4 px-4 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold animate-pulse">
              🎓 AI-Powered Learning Platform
            </div>
            <h2 className="mb-4 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              Ace Your Exams with <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent animate-gradient">LearnBuddy</span>
            </h2>
            <p className="mb-8 text-lg text-slate-600 md:text-xl leading-relaxed">
              Your ultimate AI-powered campus companion for notes, papers, and smarter studying. Get instant access to lecture notes, practice papers, and personalized study schedules.
            </p>

            <button
              onClick={() => navigate('/signup')}
              className="cursor-pointer relative overflow-hidden rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-95 group"
            >
              <span className="relative z-10">Get Started Now 🚀</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

          </div>
          <div className="flex-1 w-full max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right duration-1000 relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img
              src={heroImage}
              alt="Student studying with LearnBuddy"
              className="w-full h-auto object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-sm font-semibold text-indigo-600">Study smarter with AI assistance</p>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="px-6 py-16 md:px-12 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent"></div>

          <div className="mb-12 text-center animate-in fade-in duration-1000 relative">
            <h3 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Everything You Need to <span className="bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">Succeed</span>
            </h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for campus students to excel in their exams and dominate their studies
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative">

            {/* Feature 1: Lecture Notes */}
            <div className="group cursor-pointer flex flex-col items-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-md transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-indigo-300 hover:bg-indigo-50/80 animate-in fade-in-up duration-700 fill-mode-both" style={{ animationDelay: '0.1s' }}>
              <div className="mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">📚</span>
              </div>
              <h4 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Lecture Notes</h4>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                Access your campus lecture notes instantly after class. Download, search, and organize all your course materials in one place.
              </p>
              <button className="cursor-pointer mt-4 px-4 py-2 text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-teal-700 transform translate-y-2 group-hover:translate-y-0">
                Learn More →
              </button>
            </div>

            {/* Feature 2: Past Papers */}
            <div className="group cursor-pointer flex flex-col items-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-md transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-indigo-300 hover:bg-indigo-50/80 animate-in fade-in-up duration-700 fill-mode-both" style={{ animationDelay: '0.2s' }}>
              <div className="mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">📝</span>
              </div>
              <h4 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Past Papers</h4>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                Get previous exam papers to practice and prepare. Solve real exam questions and understand the exam pattern better.
              </p>
              <button className="cursor-pointer mt-4 px-4 py-2 text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-teal-700 transform translate-y-2 group-hover:translate-y-0">
                Learn More →
              </button>
            </div>

            {/* Feature 3: AI Note Summarizer */}
            <div className="group cursor-pointer flex flex-col items-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-md transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-indigo-300 hover:bg-indigo-50/80 animate-in fade-in-up duration-700 fill-mode-both" style={{ animationDelay: '0.3s' }}>
              <div className="mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">✨</span>
              </div>
              <h4 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">AI Note Summarizer</h4>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                Generate quick, easy-to-read summaries of long lecture notes using advanced AI. Save study time with key points extracted.
              </p>
              <button className="cursor-pointer mt-4 px-4 py-2 text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-teal-700 transform translate-y-2 group-hover:translate-y-0">
                Learn More →
              </button>
            </div>

            {/* Feature 4: AI Resource Finder */}
            <div className="group cursor-pointer flex flex-col items-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-md transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-indigo-300 hover:bg-indigo-50/80 animate-in fade-in-up duration-700 fill-mode-both" style={{ animationDelay: '0.4s' }}>
              <div className="mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">🔍</span>
              </div>
              <h4 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">AI Resource Finder</h4>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                Discover relevant YouTube videos and Google links for your topics. Find the best study resources curated by AI.
              </p>
              <button className="cursor-pointer mt-4 px-4 py-2 text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-teal-700 transform translate-y-2 group-hover:translate-y-0">
                Learn More →
              </button>
            </div>

            {/* Feature 5: Time Table Generator */}
            <div className="group cursor-pointer flex flex-col items-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-md transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-indigo-300 hover:bg-indigo-50/80 animate-in fade-in-up duration-700 fill-mode-both" style={{ animationDelay: '0.5s' }}>
              <div className="mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">⏱️</span>
              </div>
              <h4 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Time Table Generator</h4>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                Organize your study schedule automatically based on your exams. Get AI-optimized schedules that maximize your study time.
              </p>
              <button className="cursor-pointer mt-4 px-4 py-2 text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-teal-700 transform translate-y-2 group-hover:translate-y-0">
                Learn More →
              </button>
            </div>

            {/* Feature 6: AI Q&A Generator */}
            <div className="group cursor-pointer flex flex-col items-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-md transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:border-indigo-300 hover:bg-indigo-50/80 animate-in fade-in-up duration-700 fill-mode-both" style={{ animationDelay: '0.6s' }}>
              <div className="mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">❓</span>
              </div>
              <h4 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">AI Q&A Generator</h4>
              <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                Test your knowledge with custom questions and answers. AI generates practice questions from your study materials.
              </p>
              <button className="cursor-pointer mt-4 px-4 py-2 text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-teal-700 transform translate-y-2 group-hover:translate-y-0">
                Learn More →
              </button>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 md:px-12 md:py-24 bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h3 className="mb-6 text-3xl md:text-4xl font-bold animate-in fade-in-down">
              Ready to Transform Your Study Experience?
            </h3>
            <p className="mb-8 text-lg text-indigo-100 animate-in fade-in-up animation-delay-200">
              Join thousands of campus students using LearnBuddy to ace their exams
            </p>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="cursor-pointer relative overflow-hidden rounded-lg bg-white text-indigo-600 px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-95 group animate-in fade-in-up animation-delay-400"
            >
              <span className="relative z-10">Start Your Free Trial ✨</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-300 px-6 py-12 md:px-12 text-center relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-500"></div>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
            <div className="flex items-center gap-2 group cursor-pointer">
              <img
                src={logo}
                alt="LearnBuddy Logo"
                className="h-10 w-10 rounded-full border-2 border-indigo-400 group-hover:border-teal-400 transition-all duration-300 object-cover"
              />
              <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent group-hover:from-teal-400 group-hover:to-indigo-400 transition-all duration-300">
                LearnBuddy
              </h4>
            </div>
            <p className="text-sm text-slate-400">Your AI-powered campus companion for academic excellence.</p>
            <div className="flex gap-4 mt-2">
              <span className="text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors">About</span>
              <span className="text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors">Privacy</span>
              <span className="text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors">Terms</span>
              <span className="text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors">Contact</span>
            </div>
            <p className="mt-4 text-sm text-slate-600">© 2026 LearnBuddy. All rights reserved.</p>
          </div>
        </footer>

      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in-up">
            <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-teal-500 to-indigo-600"></div>
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-3xl">
                🔐
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">Sign In Required</h3>
              <p className="text-slate-600">
                Please sign in or create an account first to start your free trial and access all features.
              </p>
            </div>
            {/* THIS IS THE ONLY CHANGED LINE: sm:justify-end -> sm:justify-center */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setShowAuthModal(false)}
                className="cursor-pointer rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/signup');
                }}
                className="cursor-pointer rounded-lg bg-gradient-to-r from-indigo-600 to-teal-500 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:opacity-90 active:scale-95"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-in { 
          animation: fadeIn 0.6s ease-in-out forwards; 
        }
        
        .fade-in { 
          animation: fadeIn 0.6s ease-in-out; 
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
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .fill-mode-both { 
          animation-fill-mode: both; 
        }
        
        .bg-grid-white {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default HomePage;