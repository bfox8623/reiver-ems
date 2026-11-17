// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, firebaseUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false); // State baru

  useEffect(() => {
    if (!loading && firebaseUser) {
      if (userProfile?.accountStatus === 'Active') {
        navigate(userProfile.role === 'ADMIN' ? '/admin' : '/staff', { replace: true });
      } else {
        navigate('/access-denied', { replace: true });
      }
    }
  }, [firebaseUser, userProfile, loading, navigate]);

  const handleLogin = async () => {
    if (isLoggingIn) return; // Cegah klik ganda
    setIsLoggingIn(true);    // Kunci tombol
    setError('');
    try {
      await login();
    } catch (e) {
      // Abaikan error jika user memang sengaja menutup popup
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        console.log('Login popup ditutup oleh pengguna.');
      } else {
        setError(e.message);
      }
    } finally {
      setIsLoggingIn(false); // Buka kunci setelah selesai/gagal
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-7 h-7 text-slate-950 stroke-[2.4]" />
          </div>
          <h1 className="text-2xl font-bold text-white">REIVER EMS</h1>
          <p className="text-sm text-slate-400">Engineering & Team Management System</p>
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in with your institutional Google account. New accounts require administrator activation.
          </p>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || isLoggingIn} // Nonaktifkan saat loading
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            // Tampilkan indikator loading saat proses
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              {/* ... (path SVG Google, biarkan seperti aslinya) ... */}
            </svg>
          )}
          {isLoggingIn ? 'Menunggu Popup...' : 'Sign in with Google'}
        </button>

        <p className="text-[10px] text-center text-slate-500">
          By signing in, you agree to the team's data and safety policies.
        </p>
      </div>
    </div>
  );
}
