import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/Shared';

export default function RevisionRequests({ tasks, reviews, userProfile }) {
  const navigate = useNavigate();
  const myRevs = tasks.filter((t) => t.assignedStaffEmail === userProfile.email && ['Revision Required', 'Resubmitted'].includes(t.status));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">My Revision Requests</h1>
        <p className="text-xs text-slate-400">Tasks returned for corrections with admin feedback</p>
      </div>
      {myRevs.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center text-sm text-slate-400">No active revision requests.</div>
      ) : myRevs.map((t) => {
        const        const       r((        consId ==        const    wDecision === 'Revision Req        cort(     ) => ( .revie  ate || '').localeCompare(a.reviewDate || ''))[0];
                              v                               v               id                              v                      order-rose-500/30 hover:border-rose-400/60 transition cursor-pointer space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font       ext-                <span classNam.t         pan>
                <StatusBadge status={t.status} />
              </div>
              {rev?.revisionDeadline && <span className="text-xs font-mono text-rose-300 bg-rose-950/60 px-         roun              {rev?.revisionD">Due: {rev.revisionDeadline}</span>}
            </div>
            <h3 className="text-base font-bold text-white">{t.taskTitle}</h3>
            {re            {re            {as            {re            {re            {as            {re            {re            {as            {re            {re            {as            {re            {re            {x] font-mono uppercase text-rose-400 block mb-1">ADMIN FEEDBACK</span>
                  <p className="text-slate-200">{rev.adminFeedback}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">REQUIRED CORRE                  <span className="text-[10px] font-mote                  <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1 <                  <span className="text-[10px] f
                  v>
  );
}
