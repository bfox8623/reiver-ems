import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/Shared';

export default function RevisionRequests({ tasks, reviews, userProfile }) {
  const navigate = useNavigate();
  const myRevs = tasks.filter(
    (t) =>
      t.assignedStaffEmail === userProfile.email &&
      ['Revision Required', 'Resubmitted'].includes(t.status)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">My Revision Requests</h1>
        <p className="text-xs text-slate-400">
          Tasks returned for corrections with admin feedback
        </p>
      </div>
      {myRevs.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center text-sm text-slate-400">
          No active revision requests.
        </div>
      ) : (
        myRevs.map((t) => {
          const rev = reviews
            .filter((r) => r.taskId === t.id && r.reviewDecision === 'Revision Required')
            .sort((a, b) => (b.reviewDate || '').localeCompare(a.reviewDate || ''))[0];
          return (
            <div
              key={t.id}
              onClick={() => navigate(`/task/${t.id}`)}
              className="p-5 rounded-2xl bg-[#0F172A] border border-rose-500/30 hover:border-rose-400/60 transition cursor-pointer space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{t.taskId}</span>
                  <StatusBadge status={t.status} />
                </div>
                {rev?.revisionDeadline && (
                  <span className="text-xs font-mono text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-500/30">
                    Due: {rev.revisionDeadline}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white">{t.taskTitle}</h3>
              {rev && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1">
                      ADMIN FEEDBACK
                    </span>
                    <p className="text-slate-200">{rev.adminFeedback}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                      REQUIRED CORRECTIONS
                    </span>
                    <p className="text-slate-200 whitespace-pre-line">{rev.requiredCorrections}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
