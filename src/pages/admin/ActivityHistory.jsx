import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ActivityHistory({ history, users }) {
  const navigate = useNavigate();
  const getUser = (email) => users.find((u) => u.email === email)?.fullName || email;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Engineering Activity & Audit History</h1>
        <p className="text-xs text-slate-400">Immutable chronological log of all task and review actions</p>
      </div>
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
        {history.map((item) => (
          <div key={item.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-slate-500">{item.historyId || item.id}</span>
                <button onClick={() => navigate(`/task/${item.taskId}`)} className="font-mono font-bold text-cyan-400 hover:underline">{item.taskId}</button>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold">{item.action}</span>
                <span className="text-slate-400">({item.previousStatus} → <strong className="text-slate-200">{item.newStatus}</strong>)</span>
              </div>
              <p className="text-xs text-slate-300">{item.description}</p>
            </div>
            <div className="text-left sm:text-right text-[11px] font-mono text-slate-400 shrink-0">
              <div>By {getUser(item.userEmail)}</div>
              <div className="text-slate-500">{item.timestamp?.toDate?.()?.toLocaleString?.() || item.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
