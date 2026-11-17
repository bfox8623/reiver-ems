import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { StatusBadge, KpiCard } from '../../components/Shared';
import { DivisionBadge } from '../../components/Layout';
import { isTaskOverdue } from '../../utils/date';

export default function AdminDashboard({ projects, tasks, users, history, userProfile }) {
  const navigate = useNavigate();
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed' || t.status === 'Approved').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingReviews = tasks.filter((t) => t.status === 'Submitted for Review' || t.status === 'Resubmitted').length;
  const revisions = tasks.filter((t) => t.status === 'Revision Required').length;
  const overdue = tasks.filter(isTaskOverdue).length;
  const overall = totalTasks ? Math.round(tasks.reduce((s, t) => s + (t.progressPercentage || 0), 0) / totalTasks) : 0;
  const divisions = ['Mekanikal', 'Elektrikal', 'Program', 'Manajerial'];

  const getUserName = (email) => users.find((u) => u.email === email)?.fullName || email;
  const getUserByEmail = (email) => users.find((u) => u.email === email);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">REIVER Engineering Command Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Centralized R&D oversight for KRTI Racing Plane divisions</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">OVERALL TEAM PROGRESS</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{overall}%</span>
          </div>
          <div className="w-28 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${overall}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <KpiCard label="Total Projects" value={totalProjects} accent="text-white" />
        <KpiCard label="Total Tasks" value={totalTasks} accent="text-sky-300" />
        <KpiCard label="Completed / Approved" value={completed} accent="text-emerald-400" />
        <KpiCard label="In Progress" value={inProgress} accent="text-cyan-400" />
        <KpiCard label="Pending Reviews" value={pendingReviews} accent="text-amber-400" onClick={() => navigate('/admin/reviews')} />
        <KpiCard label="Revision Requests" value={revisions} accent="text-rose-400" onClick={() => navigate('/admin/revisions')} />
        <KpiCard label="Overdue Tasks" value={overdue} accent="text-rose-500" />
        <KpiCard label="Team Progress" value={`${overall}%`} accent="text-cyan-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Progress by Engineering Division</h2>
          {divisions.map((div) => {
            const divTasks = tasks.filter((t) => getUserByEmail(t.assignedStaffEmail)?.division === div);
            const avg = divTasks.length ? Math.round(divTasks.reduce((s, t) => s + (t.progressPercentage || 0), 0) / divTasks.length) : 0;
            return (
              <div key={div} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <DivisionBadge division={div} />
                  <span className="font-mono text-slate-300">{divTasks.length} tasks • <strong className="text-cyan-400">{avg}%</strong></span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${avg}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Action Queue: Reviews & Overdue</h2>
            <button onClick={() => navigate('/admin/reviews')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              Open Review Center <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {tasks.filter((t) => ['Submitted for Review', 'Resubmitted', 'Revision Required'].includes(t.status) || isTaskOverdue(t)).map((t) => (
              <div key={t.id} onClick={() => navigate(`/task/${t.id}`)} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400">{t.taskId}</span>
                    <StatusBadge status={t.status} />
                    {isTaskOverdue(t) && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">OVERDUE</span>}
                  </div>
                  <p className="text-sm font-medium text-white truncate mt-1">{t.taskTitle}</p>
                  <p className="text-xs text-slate-400">Assignee: {getUserName(t.assignedStaffEmail)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Recent Engineering Activity</h2>
          <button onClick={() => navigate('/admin/history')} className="text-xs text-cyan-400 hover:underline">Full Audit Log</button>
        </div>
        <div className="divide-y divide-slate-800/70">
          {history.slice(0, 5).map((h) => (
            <div key={h.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-400">{h.taskId}</span>
                <span className="font-semibold text-slate-200">{h.action}:</span>
                <span className="text-slate-400">{h.description}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">{h.timestamp?.toDate?.()?.toLocaleString?.() || ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
