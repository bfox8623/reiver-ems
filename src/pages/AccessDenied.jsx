import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DIVISIONS } from '../config/bootstrap';
import { DivisionBadge } from '../components/Layout';

export default function AccessDenied() {
  const { firebaseUser, userProfile, logout, requestAccess } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(firebaseUser?.displayName || '');
  const [division, setDivision] = useState('Mekanikal');
  const [position, setPosition] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestAccess({ fullName, division, position });
    setSubmitted(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-8 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Access Denied / Pending Activation</h1>
            <p className="text-xs text-slate-400">{firebaseUser?.email}</p>
          </div>
        </div>

        {userProfile?.accountStatus === 'Pending' || submitted ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            Your request has been submitted. An administrator will review and activate your account soon.
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your Google account is not yet registered in the REIVER team database. You may request access as a staff member below.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Position / Role</label>
                <input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g., Airframe Staff"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm">
                <Send className="w-4 h-4" /> Request Access
              </button>
            </form>
          </>
        )}

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
