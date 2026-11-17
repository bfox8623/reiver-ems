import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit3, PauseCircle, PlayCircle } from 'lucide-react';
import { StatusBadge, Modal } from '../../components/Shared';
import { DivisionBadge } from '../../components/Layout';
import { saveTask, removeTask, saveHistory } from '../../services/db';
import { nowTimestamp, isTaskOverdue } from '../../utils/date';
import { DIVISIONS, PRIORITIES, TASK_STATUSES } from '../../config/bootstrap';

const emptyTask = {
  taskTitle: '', projectId: '', milestoneId: '', taskDescription: '', technicalRequirements: '',
  expectedDeliverables: '', assignedStaffEmail: '', startDate: '', deadline: '',
  priority: 'Medium', status: 'Assigned', progressPercentage: 0, taskDependencies: '',
};

export default function TaskManagement({ tasks, users, projects, milestones, userProfile, showToast }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [divFilter, setDivFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTask);

  const getUserByEmail = (email) => users.find((u) => u.email === email);
  const getProjectName = (id) => projects.find((p) => p.id === id)?.projectName || id;

  const filtered = tasks.filter((t) => {
    const staff = getUserByEmail(t.assignedStaffEmail);
    const matchesSearch = t.taskTitle?.toLowerCase().includes(search.toLowerCase()) || t.taskId?.toLowerCase().includes(search.toLowerCase()) || staff?.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchesDiv = divFilter === 'ALL' || staff?.division === divFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesDiv && matchesStatus;
  });

  const openNew = () => { setEditing(null); setForm(emptyTask); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...t }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    const id = editing ? editing.id : `TSK-${Date.now()}`;
    const payload = {
      ...form,
      taskId: id,
      progressPercentage: Number(form.progressPercentage),
      createdBy: editing?.createdBy || userProfile.email,
      createdAt: editing?.createdAt || nowTimestamp(),
      updatedAt: nowTimestamp(),
    };
    await saveTask(id, payload);
    await saveHistory(`HST-${Date.now()}`, {
      historyId: `HST-${Date.now()}`,
      userEmail: userProfile.email,
      userName: userProfile.fullName,
      taskId: id,
      action: editing ? 'Task Edited' : 'Task Assigned',
      previousStatus: editing?.status || 'None',
      newStatus: payload.status,
      description: editing ? `${userProfile.fullName} updated task details.` : `${userProfile.fullName} assigned task to ${getUserByEmail(payload.assignedStaffEmail)?.fullName}.`,
      timestamp: nowTimestamp(),
    });
    showToast(editing ? 'Task updated.' : 'Task created.');
    setModalOpen(false);
  };

  const handleStatusChange = async (task, newStatus) => {
    await saveTask(task.id, { ...task, status: newStatus, progressPercentage: newStatus === 'Completed' ? 100 : task.progressPercentage });
    await saveHistory(`HST-${Date.now()}`, {
      historyId: `HST-${Date.now()}`,
      userEmail: userProfile.email,
      userName: userProfile.fullName,
      taskId: task.id,
      action: `Status → ${newStatus}`,
      previousStatus: task.status,
      newStatus,
      description: `${userProfile.fullName} changed status to ${newStatus}.`,
      timestamp: nowTimestamp(),
    });
    showToast(`Task moved to ${newStatus}.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Task Management & Assignment</h1>
          <p className="text-xs text-slate-400">Assign, monitor, hold, reopen, or mark approved tasks completed</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs">
          <Plus className="w-4 h-4" /> Assign New Task
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0F172A] p-3.5 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search task or staff..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" />
        </div>
        <select value={divFilter} onChange={(e) => setDivFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
          <option value="ALL">All Divisions</option>
          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
          <option value="ALL">All Statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-900/50">
              <th className="py-3.5 px-4">Task</th>
              <th className="py-3.5 px-4">Assignee</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Progress</th>
              <th className="py-3.5 px-4">Deadline</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs">
            {filtered.map((t) => {
              const staff = getUserByEmail(t.assignedStaffEmail);
              const overdue = isTaskOverdue(t);
              return (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 max-w-xs">
                    <button onClick={() => navigate(`/task/${t.id}`)} className="text-left group">
                      <span className="font-mono text-cyan-400 font-semibold group-hover:underline">{t.taskId}</span>
                      <p className="font-semibold text-white group-hover:text-cyan-300 mt-0.5 line-clamp-1">{t.taskTitle}</p>
                      <span className="text-[11px] text-slate-500">{getProjectName(t.projectId)}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{staff?.fullName}</div>
                    {staff && <div className="mt-1"><DivisionBadge division={staff.division} /></div>}
                  </td>
                  <td className="py-3.5 px-4"><StatusBadge status={t.status} /></td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-300">{t.progressPercentage}%</span>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${t.progressPercentage}%` }} />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={overdue ? 'text-rose-400 font-semibold' : 'text-slate-300'}>{t.deadline}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                      {t.status !== 'On Hold' && t.status !== 'Completed' && (
                        <button onClick={() => handleStatusChange(t, 'On Hold')} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300" title="Hold"><PauseCircle className="w-3.5 h-3.5" /></button>
                      )}
                      {(t.status === 'On Hold' || t.status === 'Completed') && (
                        <button onClick={() => handleStatusChange(t, 'In Progress')} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300" title="Reopen"><PlayCircle className="w-3.5 h-3.5" /></button>
                      )}
                      {t.status === 'Approved' && (
                        <button onClick={() => handleStatusChange(t, 'Completed')} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold">Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit Task' : 'Assign New Task'} onClose={() => setModalOpen(false)} maxWidth="max-w-3xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Task Title</label>
                <input value={form.taskTitle} onChange={(e) => setForm({ ...form, taskTitle: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Project</label>
                <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Milestone</label>
                <select value={form.milestoneId} onChange={(e) => setForm({ ...form, milestoneId: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="">Select milestone</option>
                  {milestones.filter((m) => !form.projectId || m.projectId === form.projectId).map((m) => <option key={m.id} value={m.id}>{m.milestoneName}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Description</label>
                <textarea value={form.taskDescription} onChange={(e) => setForm({ ...form, taskDescription: e.target.value })} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Technical Requirements</label>
                <textarea value={form.technicalRequirements} onChange={(e) => setForm({ ...form, technicalRequirements: e.target.value })} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Expected Deliverables</label>
                <textarea value={form.expectedDeliverables} onChange={(e) => setForm({ ...form, expectedDeliverables: e.target.value })} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Assign to Staff</label>
                <select value={form.assignedStaffEmail} onChange={(e) => setForm({ ...form, assignedStaffEmail: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="">Select staff</option>
                  {users.filter((u) => u.role === 'STAFF' && u.accountStatus === 'Active').map((u) => <option key={u.email} value={u.email}>{u.fullName} — {u.division}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Progress %</label>
                <input type="number" min="0" max="100" value={form.progressPercentage} onChange={(e) => setForm({ ...form, progressPercentage: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Dependencies</label>
                <input value={form.taskDependencies} onChange={(e) => setForm({ ...form, taskDependencies: e.target.value })} placeholder="None" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold">{editing ? 'Save Changes' : 'Create Task'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
