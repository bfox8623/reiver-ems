import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/Shared';
import { DivisionBadge } from '../../components/Layout';

export default function RevisionTracker({ tasks, reviews, users, userProfile }) {
  const navigate = useNavigate();
  const getUser = (email) => users.find((u) => u.email === email);
  const list = tasks.filter((t) => t.status === 'Revision Required' || t.status === 'Resubmitted');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Revision Management & Correction Tracker</h1>
        <p className="text-xs text-slate-400">Tracks tasks returned for corrections, mandatory feedback, and revision deadlines</p>
      </div>
      {list.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center text-sm text-slate-400">No active revision requests.</div>
      ) : list.map((task) => {
        const review = reviews.filter((r) => r.taskId === task.id && r.reviewDecision === 'Revision Required').sort((a, b) => (b.reviewDate || '').localeCompare(a.reviewDate || ''))[0];
        const staff = getUser(task.assignedStaffEmail);
        return (
          <div key={task.id} onClick={() => navigate(`/task/${task.id}`)} className="p-5 rounded-2xl bg-[#0F172A] border border-rose-500/30 hover:border-rose-400/60 transition cursor-pointer space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{task.taskId}</span>
                <StatusBadge status={task.status} />
                {staff && <DivisionBadge division={staff.division} />}
              </div>
              {review?.revisionDeadline && <span className="text-xs font-mono text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-500/30">Due: {review.revisionDeadline}</span>}
            </div>
            <h3 className="text-base font-bold text-white">{task.taskTitle}</h3>
            {review && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1">ADMIN FEEDBACK</span>
                  <p className="text-slate-200">{review.adminFeedback}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">REQUIRED CORRECTIONS</span>
                  <p className="text-slate-200 whitespace-pre-line">{review.requiredCorrections}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
