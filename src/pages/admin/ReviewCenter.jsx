import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Paperclip } from 'lucide-react';
import { StatusBadge, Modal } from '../../components/Shared';
import { DivisionBadge } from '../../components/Layout';
import { saveReview, saveTask, saveHistory, saveProgressUpdate } from '../../services/db';
import { nowTimestamp } from '../../utils/date';
import { formatTimestamp } from '../../utils/date';

export default function ReviewCenter({ tasks, updates, reviews, users, userProfile, showToast }) {
  const navigate = useNavigate();
  const [modalTask, setModalTask] = useState(null);
  const [mode, setMode] = useState('Approve');
  const [feedback, setFeedback] = useState('');
  const [corrections, setCorrections] = useState('');
  const [expected, setExpected] = useState('');
  const [deadline, setDeadline] = useState('');

  const getUser = (email) => users.find((u) => u.email === email);
  const queue = tasks.filter((t) => t.status === 'Submitted for Review' || t.status === 'Resubmitted');

  const latestUpdate = (taskId) => updates.filter((u) => u.taskId === taskId).sort((a, b) => (b.submissionVersion || 0) - (a.submissionVersion || 0))[0];

  const handleDecision = async () => {
    if (!modalTask) return;
    const isApprove = mode === 'Approve';
    const reviewId = `REV-${Date.now()}`;
    const latest = latestUpdate(modalTask.id);
    await saveReview(reviewId, {
      reviewId,
      taskId: modalTask.id,
      progressUpdateId: latest?.id || 'DIRECT',
      reviewedBy: userProfile.email,
      reviewDate: nowTimestamp(),
      reviewDecision: isApprove ? 'Approved' : 'Revision Required',
      adminFeedback: feedback,
      requiredCorrections: isApprove ? 'None' : corrections,
      expectedResult: isApprove ? 'Approved' : expected,
      revisionDeadline: isApprove ? '' : deadline,
    });
    await saveTask(modalTask.id, {
      ...modalTask,
      status: isApprove ? 'Approved' : 'Revision Required',
      progressPercentage: isApprove ? 100 : modalTask.progressPercentage,
    });
    await saveHistory(`HST-${Date.now()}`, {
      historyId: `HST-${Date.now()}`,
      userEmail: userProfile.email,
      userName: userProfile.fullName,
      taskId: modalTask.id,
      action: isApprove ? 'Submission Approved' : 'Revision Requested',
      previousStatus: modalTask.status,
      newStatus: isApprove ? 'Approved' : 'Revision Required',
      description: isApprove ? `${userProfile.fullName} approved the submission.` : `${userProfile.fullName} requested revision (Due: ${deadline}).`,
      timestamp: nowTimestamp(),
    });
    showToast(isApprove ? 'Task approved.' : 'Revision request sent.');
    setModalTask(null);
    setFeedback(''); setCorrections(''); setExpected(''); setDeadline('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Submission Review Center</h1>
        <p className="text-xs text-slate-400">Evaluate staff deliverables, approve work, or issue structured revision requests</p>
      </div>

      {queue.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">Review Queue Clear</h3>
          <p className="text-xs text-slate-400">All submitted work has been reviewed.</p>
        </div>
      ) : queue.map((task) => {
        const staff = getUser(task.assignedStaffEmail);
        const latest = latestUpdate(task.id);
        return (
          <div key={task.id} className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{task.taskId}</span>
                  <StatusBadge status={task.status} />
                  {latest && <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-xs text-cyan-300">v{latest.submissionVersion}</span>}
                  {staff && <DivisionBadge division={staff.division} />}
                </div>
                <h3 onClick={() => navigate(`/task/${task.id}`)} className="text-base font-bold text-white hover:text-cyan-300 cursor-pointer">{task.taskTitle}</h3>
                <p className="text-xs text-slate-400"> Submitted by <strong className="text-slate-200">{staff?.fullName}</strong> • {formatTimestamp(latest?.submissionDate || task.updatedAt)} </p>  
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button onClick={() => navigate(`/task/${task.id}`)} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200">Full History</button>
                <button onClick={() => { setModalTask(task); setMode('Revision'); }} className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-semibold">Request Revision</button>
                <button onClick={() => { setModalTask(task); setMode('Approve'); }} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold">Approve</button>
              </div>
            </div>
            {latest && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">WORK COMPLETED</span>
                  <p className="text-slate-200 leading-relaxed">{latest.workCompleted}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-400">TECHNICAL FINDINGS</span>
                  <p className="text-slate-200 leading-relaxed">{latest.technicalFindings || 'N/A'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400">EVIDENCE ({latest.evidenceLinks?.length || 0})</span>
                  <div className="space-y-1">
                    {latest.evidenceLinks?.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800/80 text-slate-200 hover:text-cyan-300">
                        <Paperclip className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{link.label || link.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {modalTask && (
        <Modal title={mode === 'Approve' ? 'Approve Submission' : 'Request Revision'} onClose={() => setModalTask(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Admin Feedback</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            {mode === 'Revision' && (
              <>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Required Corrections</label>
                  <textarea value={corrections} onChange={(e) => setCorrections(e.target.value)} rows={3} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Expected Result</label>
                  <textarea value={expected} onChange={(e) => setExpected(e.target.value)} rows={2} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Revision Deadline</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalTask(null)} className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-white">Cancel</button>
              <button onClick={handleDecision} className={`px-4 py-2 rounded-lg text-xs font-bold ${mode === 'Approve' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                {mode === 'Approve' ? 'Confirm Approval' : 'Send Revision Request'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
