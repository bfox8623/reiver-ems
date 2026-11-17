import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/Shared';

export default function Timeline({ projects, milestones, tasks, users }) {
  const navigate = useNavigate();
  const getUser = (email) => users.find((u) => u.email === email)?.fullName || email;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Project Timeline & Engineering Milestones</h1>
        <p className="text-xs text-slate-400">Master schedule linking projects, milestones, and task deadlines</p>
      </div>
      {projects.map((proj) => {
        const pms = milestones.filter((m) => m.projectId === proj.id);
        const pts = tasks.filter((t) => t.projectId === proj.id);
        return (
          <div key={proj.id} className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{proj.projectId || proj.id}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs font-mono">{proj.status}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{proj.projectName}</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl">{proj.description}</p>
              </div>
              <div className="text-xs font-mono bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl shrink-0">
                <div className="text-slate-400">Start: <span className="text-slate-200">{proj.startDate}</span></div>
                <div className="text-slate-400 mt-1">Target: <span className="text-cyan-300">{proj.targetCompletion}</span></div>
                <div className="text-slate-400 mt-1">Lead: <span className="text-slate-200">{getUser(proj.projectLeader)}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {pms.map((ms) => (
                <div key={ms.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-400 font-semibold">{ms.milestoneId || ms.id}</span>
                    <span className="font-mono text-amber-300">Target: {ms.targetDate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{ms.milestoneName}</h4>
                  <p className="text-xs text-slate-400">{ms.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Scheduled Tasks ({pts.length})</h3>
              {pts.map((t) => (
                <div key={t.id} onClick={() => navigate(`/task/${t.id}`)} className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400">{t.taskId}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs font-semibold text-white">{t.taskTitle}</p>
                    <p className="text-[11px] text-slate-400">Assignee: {getUser(t.assignedStaffEmail)} • Milestone: {t.milestoneId}</p>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-slate-400 block">{t.startDate} → {t.deadline}</span>
                    <span className="text-cyan-300 font-bold">{t.progressPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
