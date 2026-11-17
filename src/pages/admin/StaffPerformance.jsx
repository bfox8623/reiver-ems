import React from 'react';
import { ChevronRight } from 'lucide-react';
import { DivisionBadge } from '../../components/Layout';
import { isTaskOverdue } from '../../utils/date';

export default function StaffPerformance({ users, tasks, updates, reviews }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Staff Engineering Performance</h1>
        <p className="text-xs text-slate-400">Monitor task completion, overdue items, revision frequency, and submissions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => {
          const userTasks = tasks.filter((t) => t.assignedStaffEmail === u.email);
          const completed = userTasks.filter((t) => ['Completed', 'Approved'].includes(t.status)).length;
          const active = userTasks.filter((t) => ['In Progress', 'Assigned'].includes(t.status)).length;
          const overdue = userTasks.filter(isTaskOverdue).length;
          const revs = reviews.filter((r) => userTasks.some((t) => t.id === r.taskId) && r.reviewDecision === 'Revision Required').length;
          const subs = updates.filter((up) => up.submittedBy === u.email).length;
          const avg = userTasks.length ? Math.round(userTasks.reduce((s, t) => s + (t.progressPercentage || 0), 0) / userTasks.length) : 0;
          return (
            <div key={u.email} className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{u.fullName}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{u.role}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{u.position}</p>
                  <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{u.email}</p>
                </div>
                <DivisionBadge division={u.division} />
              </div>
              <div className="grid grid-cols-5 gap-2 text-center bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div><span className="text-[10px] font-mono text-slate-400 block">ASSIGNED</span><span className="text-sm font-bold text-white">{userTasks.length}</span></div>
                <div><span className="text-[10px] font-mono text-slate-400 block">DONE</span><span className="text-sm font-bold text-emerald-400">{completed}</span></div>
                <div><span className="text-[10px] font-mono text-slate-400 block">ACTIVE</span><span className="text-sm font-bold text-cyan-400">{active}</span></div>
                <div><span className="text-[10px] font-mono text-slate-400 block">OVERDUE</span><span className="text-sm font-bold text-rose-400">{overdue}</span></div>
                <div><span className="text-[10px] font-mono text-slate-400 block">REVISIONS</span><span className="text-sm font-bold text-amber-400">{revs}</span></div>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                <span>Submissions: <strong className="text-white font-mono">{subs}</strong> • Avg: <strong className="text-cyan-400 font-mono">{avg}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
