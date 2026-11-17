import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, FileCheck2, RotateCcw, Users,
  CalendarRange, History, Database, Bell, Menu, X, LogOut, Shield,
  UserCheck, Cpu, Wrench, Code2, Briefcase, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DIVISION_ICONS = { Mekanikal: Wrench, Elektrikal: Cpu, Program: Code2, Manajerial: Briefcase };

export function DivisionBadge({ division }) {
  const Icon = DIVISION_ICONS[division] || Layers;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      <Icon className="w-3 h-3 text-cyan-400" />
      {division}
    </span>
  );
}

export default function Layout({ children, notifications = [], onMarkAllRead, unreadCount = 0 }) {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const isAdmin = userProfile?.role === 'ADMIN';

  const adminNav = [
    { to: '/admin', label: 'Command Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/admin/reviews', label: 'Submission Review', icon: FileCheck2 },
    { to: '/admin/revisions', label: 'Revision Tracker', icon: RotateCcw },
    { to: '/admin/performance', label: 'Staff Performance', icon: Users },
    { to: '/admin/timeline', label: 'Project Timeline', icon: CalendarRange },
    { to: '/admin/history', label: 'Engineering Log', icon: History },
    { to: '/admin/users', label: 'User Management', icon: Database },
  ];

  const staffNav = [
    { to: '/staff', label: 'My Workspace', icon: LayoutDashboard, end: true },
    { to: '/staff/tasks', label: 'Assigned Tasks', icon: CheckSquare },
    { to: '/staff/revisions', label: 'Revision Requests', icon: RotateCcw },
    { to: '/staff/submissions', label: 'My Submissions', icon: FileCheck2 },
    { to: '/staff/timeline', label: 'Project Milestones', icon: CalendarRange },
  ];

  const nav = isAdmin ? adminNav : staffNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-slate-950 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-white text-sm sm:text-base">
                  REIVER <span className="text-cyan-400 font-mono text-xs sm:text-sm">EMS</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  KRTI Racing Plane
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Engineering & Team Management System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${isAdmin ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
            {isAdmin ? <Shield className="w-3.5 h-3.5 text-cyan-400" /> : <UserCheck className="w-3.5 h-3.5 text-slate-400" />}
            {userProfile?.role}
          </span>

          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Alerts ({notifications.length})</span>
                  <button onClick={onMarkAllRead} className="text-xs text-cyan-400 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/70">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No notifications.</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} className={`p-3.5 ${!n.read ? 'bg-cyan-950/20' : ''}`}>
                      <span className="text-xs font-semibold text-slate-100 block">{n.title}</span>
                      <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#0F172A] border-r border-slate-800/80 p-4 justify-between">
          <div className="space-y-6">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-cyan-300 text-sm">
                  {userProfile?.fullName?.split(' ').slice(0, 2).map((n) => n[0]).join('') || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userProfile?.fullName}</p>
                  <p className="text-[11px] font-mono text-cyan-400 truncate">{userProfile?.email}</p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <DivisionBadge division={userProfile?.division} />
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {isAdmin ? 'Administrator Console' : 'Staff Engineering Portal'}
              </div>
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-300/90">
            <span className="font-semibold block">Protected Workspace</span>
            All activity is logged to the audit history.
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 bg-[#0F172A] border-r border-slate-800 p-4 flex flex-col justify-between z-50">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">REIVER EMS</span>
                  <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-sm font-semibold text-white">{userProfile?.fullName}</p>
                  <p className="text-xs font-mono text-cyan-400">{userProfile?.email}</p>
                  <div className="mt-2"><DivisionBadge division={userProfile?.division} /></div>
                </div>
                <nav className="space-y-1">
                  {nav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'}`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
