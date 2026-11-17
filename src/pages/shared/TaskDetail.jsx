import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, Plus, Trash2 } from 'lucide-react';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/Shared';
import { DivisionBadge } from '../../components/Layout';
import { saveProgressUpdate, saveTask, saveHistory, saveReview } from '../../services/db';
import { nowTimestamp, isTaskOverdue } from '../../utils/date';

export default function TaskDetail({ tasks, users, projects, milestones, updates, reviews, userProfile, showToast }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = tasks.find((t) => t.id === taskId);
  const assignee = users.find((u) => u.email === task?.assignedStaffEmail);
  const isAdmin = userProfile.role === 'ADMIN';
  const canSubmit = !isAdmin && task?.assignedStaffEmail === userProfile.email && task?.status !== 'Completed';
  const taskUpdates = updates.filter((u) => u.taskId === taskId).sort((a, b) => (b.submissionVersion || 0) - (a.submissionVersion || 0));
  const taskReviews = reviews.filter((r) => r.taskId === taskId).sort((a, b) => (b.reviewDate || '').localeCompare(a.reviewDate || ''));

  const [progress, setProgress] = useState(task?.progressPercentage || 0);
  const [workDesc, setWorkDesc] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [findings, setFindings] = useState('');
  const [problems, setProblems] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [links, setLinks] = useState([]);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  if (!task) return <div className="p-8 text-center text-slate-400">Task not found.</div>;

  const addLink = () => {
    if (!linkUrl.trim()) return;
    setLinks([...links, { label: linkLabel || linkUrl, url: linkUrl }]);
    setLinkLabel(''); setLinkUrl('');
  };

  const handleSubmit = async (isFinal) => {
    if (!workDesc.trim() || !workDone.trim()) { alert('Please fill Work Description and Work Completed.'); return; }
    const nextVersion = taskUpdates.length + 1;
    const updateId = `UPD-${Date.now()}`;
    const newStatus = isFinal ? (task.status === 'Revision Required' ? 'Resubmitted' : 'Submitted for Review') : (task.status === 'Assigned' ? 'In Progress' : task.status);
    await saveProgressUpdate(updateId, {
      updateId, taskId, submittedBy: userProfile.email, submissionDate: nowTimestamp(),
      progressPercentage: Number(progress), workDescription: workDesc, workCompleted: workDone,
      technicalFindings: findings, problemsEncountered: problems, nextAction,
      evidenceLinks: links, submissionVersion: nextVersion,
    });
    await saveTask(taskId, { ...task, status: newStatus, progressPercentage: Number(progress) });
    await saveHistory(`HST-${Date.now()}`, {
      historyId: `HST-${Date.now()}`, userEmail: userProfile.email, userName: userProfile.fullName,
      taskId, action: isFinal ? `${newStatus} (v${nextVersion})` : `Progress Logged (v${nextVersion})`,
      previousStatus: task.status, newStatus, description: `${userProfile.fullName} submitted v${nextVersion} (${progress}%).`,
      timestamp: nowTimestamp(),
    });
    showToast(isFinal ? `Submission v${nextVersion} sent to Admin!` : 'Progress saved.');
    setWorkDesc(''); setWorkDone(''); setFindings(''); setProblems(''); setNextAction(''); setLinks([]);
  };

  const handleAdminStatus = async (newStatus) => {
    await saveTask(taskId, { ...task, status: newStatus, progressPercentage: newStatus === 'Completed' ? 100 : task.progressPercentage });
    await saveHistory(`HST-${Date.now()}`, {
      historyId: `HST-${Date.now()}`, userEmail: userProfile.email, userName: userProfile.fullName,
      taskId, action: `Status → ${newStatus}`, previousStatus: task.status, newStatus,
      description: `${userProfile.fullName} changed status to ${newStatus}.`, timestamp: nowTimestamp(),
    });
    showToast(`Task moved to ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-xs font-semibold text-slate-300 hover:text-cyan-400">← Back</button>

      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-cyan-400">{task.taskId}</span>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {assignee && <DivisionBadge division={assignee.division} />}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{task.taskTitle}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">ASSIGNEE</span>
            <span className="font-semibold text-white mt-0.5 block">{assignee?.fullName}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">DEADLINE</span>
            <span className={`font-mono font-semibold mt-0.5 block ${isTaskOverdue(task) ? 'text-rose-400' : 'text-amber-300'}`}>{task.deadline}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">PROJECT</span>
            <span className="font-medium text-slate-200 mt-0.5 block truncate">{projects.find((p) => p.id === task.projectId)?.projectName || task.projectId}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">PROGRESS</span>
            <span className="font-mono font-bold text-cyan-400 mt-0.5 block">{task.progressPercentage}%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400">DESCRIPTION</span>
            <p className="text-slate-200 whitespace-pre-line">{task.taskDescription}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-cyan-400">REQUIREMENTS</span>
            <p className="text-slate-200 whitespace-pre-line">{task.technicalRequirements}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-emerald-400">DELIVERABLES</span>
            <p className="text-slate-200 whitespace-pre-line">{task.expectedDeliverables}</p>
          </div>
        </div>
      </div>

      {taskReviews.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white">Administrative Review Decisions</h2>
          {taskReviews.map((rev) => (
            <div key={rev.id} className={`p-5 rounded-2xl border space-y-2.5 ${rev.reviewDecision === 'Approved' ? 'bg-emerald-950/25 border-emerald-500/40' : 'bg-rose-950/25 border-rose-500/40'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${rev.reviewDecision === 'Approved' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>{rev.reviewDecision}</span>
                  <span className="font-semibold text-white">by {users.find((u) => u.email === rev.reviewedBy)?.fullName || rev.reviewedBy}</span>
                </div>
                <span className="font-mono text-slate-400">{rev.reviewDate?.toDate?.()?.toLocaleString?.() || rev.reviewDate}</span>
              </div>
              <p className="text-xs text-slate-200">{rev.adminFeedback}</p>
              {rev.reviewDecision === 'Revision Required' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-rose-500/20 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-rose-300 block">REQUIRED CORRECTIONS</span>
                    <p className="text-slate-200 whitespace-pre-line mt-0.5">{rev.requiredCorrections}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-300 block">EXPECTED RESULT</span>
                    <p className="text-slate-200 mt-0.5">{rev.expectedResult}</p>
                    <span className="text-[10px] font-mono uppercase text-rose-300 block mt-2">DEADLINE</span>
                    <p className="text-slate-200">{rev.revisionDeadline}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canSubmit && (
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-cyan-500/30 space-y-4">
          <h2 className="text-sm font-bold text-white">Submit Progress Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Progress %</label>
              <input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Next Action</label>
              <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Work Description</label>
              <textarea value={workDesc} onChange={(e) => setWorkDesc(e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Work Completed</label>
              <textarea value={workDone} onChange={(e) => setWorkDone(e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-cyan-400 block mb-1">Technical Findings</label>
              <textarea value={findings} onChange={(e) => setFindings(e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-rose-400 block mb-1">Problems / Blockers</label>
              <textarea value={problems} onChange={(e) => setProblems(e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-slate-400 block">Evidence Links</label>
            <div className="flex gap-2">
              <input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Label" className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
              <button type="button" onClick={addLink} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300"><Plus className="w-4 h-4" /></button>
            </div>
            {links.map((l, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs">
                <span className="flex items-center gap-1.5 text-slate-200"><Paperclip className="w-3 h-3 text-cyan-400" />{l.label}</span>
                <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => handleSubmit(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white">Save Progress</button>
            <button onClick={() => handleSubmit(true)} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold">Submit for Review</button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/admin/reviews')} className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">Go to Review Center</button>
          {task.status === 'Approved' && <button onClick={() => handleAdminStatus('Completed')} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold">Mark Completed</button>}
          {task.status !== 'On Hold' && <button onClick={() => handleAdminStatus('On Hold')} className="px-4 py-2 rounded-lg bg-slate-800 text-amber-300 text-xs font-semibold">Put On Hold</button>}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white">Submission History (v{taskUpdates.length})</h2>
        {taskUpdates.length === 0 ? <p className="text-xs text-slate-400">No submissions yet.</p> : taskUpdates.map((u) => (
          <div key={u.id} className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-400 font-bold">v{u.submissionVersion}</span>
              <span className="font-mono text-slate-400">{u.submissionDate?.toDate?.()?.toLocaleString?.() || u.submissionDate}</span>
            </div>
            <p className="text-xs text-slate-300">{u.workDescription}</p>
            <div className="text-[11px] text-slate-400">Progress: {u.progressPercentage}%</div>
            {u.evidenceLinks?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {u.evidenceLinks.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-slate-800 text-cyan-300 text-[11px] flex items-center gap-1"><Paperclip className="w-3 h-3" />{l.label}</a>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
