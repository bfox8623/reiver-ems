import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/Shared';
import { TASK_STATUSES } from '../../config/bootstrap';

export default function MyTasks({ tasks, userProfile, projects }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const myTasks = tasks.filter((t) => t.assignedStaffEmail === userProfile.email);
  const filtered = filter === 'ALL' ? myTasks : myTasks.filter((t) => t.status === filter);
  const getProjectName = (id) => projects.find((p) => p.id === id)?.projectName || id;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">My Assigned Tasks</h1>
          <p className="text-xs text-slate-400">Filtered strictly to your account</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
          <option value="ALL">All Statuses ({myTasks.length})</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div key={t.id} onClick={() => navigate(`/task/${t.id}`)} className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">{t.taskId}</span>
                <StatusBadge status={t.status} />
              </div>
              <h3 className="text-base font-semibold text-white leading-snug">{t.taskTitle}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{t.taskDescription}</p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[60%]">{getProjectName(t.projectId)}</span>
              <span className="font-mono text-slate-200">Due: {t.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
