import React from 'react';
import { X } from 'lucide-react';
import { STATUS_STYLES, PRIORITY_STYLES } from '../utils/constants';

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Assigned;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}`}>
      {priority}
    </span>
  );
}

export function KpiCard({ label, value, accent = 'text-white', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl bg-[#0F172A] border border-slate-800 ${onClick ? 'cursor-pointer hover:border-cyan-500/40 transition' : ''}`}
    >
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">{label}</span>
      <span className={`text-2xl font-bold font-mono mt-1 block ${accent}`}>{value}</span>
    </div>
  );
}

export function Modal({ title, children, onClose, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-[#0F172A] border border-slate-700 rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-[#0F172A] z-10">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-sm bg-slate-900 border border-cyan-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
      <span className="text-xs font-medium">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="p-10 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-2">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}
