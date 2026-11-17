import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { Modal } from '../../components/Shared';
import { saveProject, removeProject, saveMilestone, removeMilestone } from '../../services/db';

const emptyProject = {
  projectId: '',
  projectName: '',
  description: '',
  projectCategory: 'Riset Airframe',
  startDate: '',
  targetCompletion: '',
  projectStatus: 'Active',
  projectLeader: '',
};

const emptyMilestone = {
  milestoneId: '',
  projectId: '',
  milestoneName: '',
  description: '',
  targetDate: '',
  completionStatus: 'Pending',
};

const PROJECT_CATEGORIES = [
  'Riset Airframe',
  'Sistem Propulsi & PCB',
  'Autopilot & Telemetry',
  'Manajemen & Modul Magang',
];
const PROJECT_STATUSES = ['Active', 'On Hold', 'Completed', 'Archived'];
const MILESTONE_STATUSES = ['Pending', 'In Progress', 'Completed'];

export default function AdminProjects({ projects, milestones, users, userProfile, showToast }) {
  const [projectModal, setProjectModal] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [msForm, setMsForm] = useState(emptyMilestone);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const openNewProject = () => {
    setEditingProject(null);
    setForm({
      ...emptyProject,
      projectId: `PRJ-${Date.now().toString().slice(-5)}`,
      projectLeader: userProfile.email,
    });
    setProjectModal(true);
  };

  const openEditProject = (p) => {
    setEditingProject(p);
    setForm({ ...p });
    setProjectModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const id = editingProject?.id || form.projectId;
    await saveProject(id, { ...form, projectId: form.projectId || id });
    showToast(editingProject ? 'Project updated.' : 'Project created.');
    setProjectModal(false);
  };

  const handleDeleteProject = async (p) => {
    if (!window.confirm(`Delete project "${p.projectName}"?`)) return;
    await removeProject(p.id);
    showToast('Project deleted.');
  };

  const openNewMilestone = (projectId) => {
    setEditingMilestone(null);
    setMsForm({
      ...emptyMilestone,
      milestoneId: `MS-${Date.now().toString().slice(-5)}`,
      projectId,
    });
    setMilestoneModal(true);
  };

  const openEditMilestone = (m) => {
    setEditingMilestone(m);
    setMsForm({ ...m });
    setMilestoneModal(true);
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    const id = editingMilestone?.id || msForm.milestoneId;
    await saveMilestone(id, { ...msForm, milestoneId: msForm.milestoneId || id });
    showToast(editingMilestone ? 'Milestone updated.' : 'Milestone created.');
    setMilestoneModal(false);
  };

  const handleDeleteMilestone = async (m) => {
    if (!window.confirm(`Delete milestone "${m.milestoneName}"?`)) return;
    await removeMilestone(m.id);
    showToast('Milestone deleted.');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Project & Milestone Management</h1>
          <p className="text-xs text-slate-400">
            Define R&D projects and milestone gates before assigning tasks
          </p>
        </div>
        <button
          onClick={openNewProject}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0F172A] border border-amber-500/30 text-center space-y-3">
          <Layers className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">Belum ada project</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Task tidak bisa dibuat tanpa project. Buat project pertama dulu — misalnya
            "NAGANTARA-RP Gen 2 Airframe" — lalu tambahkan milestone di dalamnya.
          </p>
          <button
            onClick={openNewProject}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Buat Project Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const pMilestones = milestones.filter((m) => m.projectId === p.id);
            const isOpen = expanded[p.id];
            return (
              <div key={p.id} className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleExpand(p.id)}
                      className="mt-1 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-cyan-400 font-bold">
                          {p.projectId || p.id}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-mono">
                          {p.projectStatus || p.status}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {p.projectCategory}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{p.projectName}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{p.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 mt-1.5">
                        <span>Start: <span className="text-slate-200">{p.startDate}</span></span>
                        <span>Target: <span className="text-cyan-300">{p.targetCompletion}</span></span>
                        <span>Milestones: <span className="text-slate-200">{pMilestones.length}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => openEditProject(p)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProject(p)} className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-800 bg-slate-900/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Milestones ({pMilestones.length})
                      </h4>
                      <button
                        onClick={() => openNewMilestone(p.id)}
                        className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Milestone
                      </button>
                    </div>
                    {pMilestones.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No milestones yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {pMilestones.map((m) => (
                          <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] text-cyan-400">
                                  {m.milestoneId || m.id}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {m.completionStatus}
                                </span>
                                <span className="text-[11px] font-mono text-amber-300">
                                  Target: {m.targetDate}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-white mt-1">{m.milestoneName}</p>
                              <p className="text-xs text-slate-400">{m.description}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => openEditMilestone(m)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteMilestone(m)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-rose-300">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {projectModal && (
        <Modal title={editingProject ? 'Edit Project' : 'Create Project'} onClose={() => setProjectModal(false)} maxWidth="max-w-2xl">
          <form onSubmit={handleSaveProject} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Project Name</label>
              <input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Category</label>
                <select value={form.projectCategory} onChange={(e) => setForm({ ...form, projectCategory: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  {PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Status</label>
                <select value={form.projectStatus} onChange={(e) => setForm({ ...form, projectStatus: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Target Completion</label>
                <input type="date" value={form.targetCompletion} onChange={(e) => setForm({ ...form, targetCompletion: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Project Leader</label>
                <select value={form.projectLeader} onChange={(e) => setForm({ ...form, projectLeader: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="">Select leader</option>
                  {users.map((u) => <option key={u.email} value={u.email}>{u.fullName} — {u.role}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setProjectModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold">{editingProject ? 'Save Changes' : 'Create Project'}</button>
            </div>
          </form>
        </Modal>
      )}

      {milestoneModal && (
        <Modal title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'} onClose={() => setMilestoneModal(false)} maxWidth="max-w-lg">
          <form onSubmit={handleSaveMilestone} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Milestone Name</label>
              <input value={msForm.milestoneName} onChange={(e) => setMsForm({ ...msForm, milestoneName: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Description</label>
              <textarea value={msForm.description} onChange={(e) => setMsForm({ ...msForm, description: e.target.value })} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Target Date</label>
                <input type="date" value={msForm.targetDate} onChange={(e) => setMsForm({ ...msForm, targetDate: e.target.value })} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Status</label>
                <select value={msForm.completionStatus} onChange={(e) => setMsForm({ ...msForm, completionStatus: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  {MILESTONE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMilestoneModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold">{editingMilestone ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
