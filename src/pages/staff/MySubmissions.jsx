import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MySubmissions({ updates, reviews, tasks, userProfile, users }) {
  const navigate = useNavigate();
  const myUpdates = updates.filter((u) => u.submittedBy === userProfile.email);
  const getUser = (email) => users.find((u) => u.email === email)?.fullName || email;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">My Submission & Review History</h1>
        <p className="text-xs text-slate-400">Immutable versioned log of your progress reports</p>
      </div>
      <div className="space-y-4">
        {myUpdates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center text-sm text-slate-400">
            No submissions yet.
          </div>
        ) : (
          myUpdates.map((upd) => {
            const task = tasks.find((t) => t.id === upd.taskId);
            const rev = reviews.find((r) => r.progressUpdateId === upd.id);
            return (
              <div
                key={upd.id}
                onClick={() => task && navigate(`/task/${task.id}`)}
                className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-xs font-bold">
                      v{upd.submissionVersion}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {upd.updateId || upd.id}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {task ? `${task.taskId}: ${task.taskTitle}` : upd.taskId}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {upd.submissionDate?.toDate?.()?.toLocaleString?.() || upd.submissionDate}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{upd.workDescription}</p>
                {rev && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      rev.reviewDecision === 'Approved'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="font-semibold">
                      Admin Review ({rev.reviewDecision}) by {getUser(rev.reviewedBy)}:
                    </div>
                    <p className="mt-1 opacity-90">{rev.adminFeedback}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
