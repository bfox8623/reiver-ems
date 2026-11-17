import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { StatusBadge, KpiCard } from '../../components/Shared';
import { isTaskOverdue, isDeadlineApproaching } from '../../utils/date';

export default function StaffDashboard({ tasks, userProfile, projects }) {
  const navigate = useNavigate();
  const myTasks = tasks.filter((t) => t.assignedStaffEmail === userProfile.email);
  const upcoming = myTasks.filter((t) => isDeadlineApproaching(t) || isTaskOverdue(t)).length;
  const inProgress = myTasks.filter((t) => ['In Progress', 'Assigned'].includes(t.status)).length;
  const submitted = myTasks.filter((t) => ['Submitted for Review', 'Resubmitted'].includes(t.status)).length;
  const revisions = myTasks.filter((t) => t.status === 'Revision Required').length;
  const done = myTasks.filter((t) => ['Completed', 'Approved'].includes(t.status)).length;
  const avg = myTasks.length
    ? Math.round(myTasks.reduce((s, t) => s + (t.progressPercentage || 0), 0) / myTasks.length)
    : 0;
  const revTasks = myTasks.filter((t) => t.status === 'Revision Required');
  const getProjectName = (id) => projects.find((p) => p.id === id)?.projectName || id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Welcome back, {userProfile.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {userProfile.position} • {userProfile.division} Division
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-4">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">MY PROGRESS</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{avg}%</span>
          </div>
          <div className="w-28 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: `${avg}%` }} />
          </div>
        </div>
      </div>

      {revTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-rose-200">Action Required: {revTasks.length} Revision(s) Requested</h3>
              <p className="text-xs text-rose-300/80 mt-0.5">Open the task to inspect feedback and resubmit.</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/task/${revTasks[0].id}`)}
            className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold text-xs"
          >
            Inspect Revision
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard label="My Tasks" value={myTasks.length} accent="text-white" />
        <KpiCard label="Upcoming / Overdue" value={upcoming} accent="text-amber-400" />
        <KpiCard label="Active" value={inProgress} accent="text-cyan-400" />
        <KpiCard label="Submitted" value={submitted} accent="text-amber-300" />
        <KpiCard label="Revisions" value={revisions} accent="text-rose-400" />
        <KpiCard label="Approved / Done" value={done} accent="text-emerald-400" />
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">My Active Tasks</h2>
            <p className="text-xs text-slate-400">Click any task to log progress or submit for review</p>
          </div>
          <button onClick={() => navigate('/staff/tasks')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-800/70">
          {myTasks.map((t) => {
            const overdue = isTaskOverdue(t);
            return (
              <div
                key={t.id}
                onClick={() => navigate(`/task/${t.id}`)}
                className="p-4 sm:px-5 hover:bg-slate-800/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-semibold">{t.taskId}</span>
                    <StatusBadge status={t.status} />
                    {overdue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">OVERDUE</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">{t.taskTitle}</h3>
                  <p className="text-xs text-slate-400 truncate">{getProjectName(t.projectId)}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-mono text-slate-400 block">DEADLINE</span>
                    <span className={`text-xs font-mono font-medium ${overdue ? 'text-rose-400' : 'text-slate-200'}`}>{t.deadline}</span>
                  </div>
                  <div className="w-24">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-cyan-300">{t.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${t.progressPercentage}%` }} />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
