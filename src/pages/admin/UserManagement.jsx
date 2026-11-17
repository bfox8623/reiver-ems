import React, { useState } from 'react';
import { saveUser, updateUser } from '../../services/db';
import { DivisionBadge } from '../../components/Layout';
import { DIVISIONS } from '../../config/bootstrap';

export default function UserManagement({ users, userProfile, showToast }) {
  const [editing, setEditing] = useState(null);

  const handleRoleChange = async (email, role) => {
    await updateUser(email, { role });
    showToast(`Role updated to ${role}.`);
  };
  const handleStatusChange = async (email, accountStatus) => {
    await updateUser(email, { accountStatus });
    showToast(`Account ${accountStatus}.`);
  };
  const handleDivisionChange = async (email, division) => {
    await updateUser(email, { division });
    showToast('Division updated.');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <p className="text-xs text-slate-400">Approve pending staff, change roles, and assign divisions</p>
      </div>
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-900/50">
              <th className="py-3.5 px-4">Member</th>
              <th className="py-3.5 px-4">Division</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs">
            {users.map((u) => (
              <tr key={u.email} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{u.fullName}</div>
                  <div className="font-mono text-slate-400">{u.email}</div>
                  <div className="text-[11px] text-slate-500">{u.position}</div>
                </td>
                <td className="py-3.5 px-4">
                  <select value={u.division} onChange={(e) => handleDivisionChange(u.email, e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200">
                    {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
                <td className="py-3.5 px-4">
                  <select value={u.role} onChange={(e) => handleRoleChange(u.email, e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200">
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${u.accountStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : u.accountStatus === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>{u.accountStatus}</span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {u.accountStatus === 'Pending' && (
                    <button onClick={() => handleStatusChange(u.email, 'Active')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold">Approve</button>
                  )}
                  {u.accountStatus === 'Active' && u.email !== userProfile.email && (
                    <button onClick={() => handleStatusChange(u.email, 'Inactive')} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
