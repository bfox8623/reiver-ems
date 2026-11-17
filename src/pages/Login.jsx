import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, firebaseUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!loading && firebaseUser) {
      if (userProfile?.accountStatus === 'Active') {
        navigate(userProfile.role === 'ADMIN' ? '/admin' : '/staff', { replace: true });
      } else if (userProfile === null) {
        navigate('/access-denied', { replace: true });
      } else {
        navigate('/access-denied', { replace: true });
      }
    }
  }, [firebaseUser, userProfile, loading, navigate]);

  const handleLogin = async () => {
    try {
      setError('');
      await login();
    } catch (e) {
      setError(e.message);
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
          <p className="text-xs text-slate-500">KRTI Racing Plane — University Research Team</p>
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in with your institutional Google account. New accounts require administrator activation.
          </p>
        </div>

        {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-[10px] text-center text-slate-500">
          By signing in, you agree to the team's data and safety policies.
        </p>
      </div>
    </div>
  );
}
