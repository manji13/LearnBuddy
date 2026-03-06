import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setMessage('Password reset successful! Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 relative flex items-center justify-center p-4 font-sans text-slate-800 overflow-hidden">
      <div className="z-10 w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_15px_30px_-10px_rgba(0,0,0,0.08)]">
        <div className="text-center mb-7">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-teal-600 bg-clip-text text-transparent">Reset Password</h2>
        </div>
        
        {error && <div className="mb-5 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm text-center font-medium shadow-inner">{error}</div>}
        {message && <div className="mb-5 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm text-center font-medium shadow-inner">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <p className="text-sm text-slate-600 text-center mb-4">Enter your registered email address to receive an OTP.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50" placeholder="john@example.com" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm">
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-sm text-slate-600 text-center mb-4">Enter the 6-digit code sent to {email}.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">OTP</label>
              <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 text-center tracking-[0.5em] font-bold" placeholder="------" maxLength="6" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm">
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-slate-600 text-center mb-4">Enter your new password below.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">New Password</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 hover:shadow-2xl transform transition-all active:scale-[0.97] cursor-pointer text-sm">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-600 font-medium">
          Remember your password? <Link to="/login" className="font-bold text-indigo-700 hover:text-teal-600 transition-colors">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;