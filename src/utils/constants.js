export const STATUS_STYLES = {
  Assigned:              { bg: 'bg-slate-800/90',    text: 'text-sky-300',      border: 'border-sky-500/30',      dot: 'bg-sky-400' },
  'In Progress':         { bg: 'bg-cyan-950/70',     text: 'text-cyan-300',     border: 'border-cyan-500/40',     dot: 'bg-cyan-400' },
  'Submitted for Review':{ bg: 'bg-amber-950/70',   text: 'text-amber-300',    border: 'border-amber-500/40',    dot: 'bg-amber-400' },
  'Revision Required':   { bg: 'bg-rose-950/70',     text: 'text-rose-300',     border: 'border-rose-500/40',     dot: 'bg-rose-400' },
  Resubmitted:           { bg: 'bg-violet-950/70',   text: 'text-violet-300',   border: 'border-violet-500/40',   dot: 'bg-violet-400' },
  Approved:              { bg: 'bg-emerald-950/70',  text: 'text-emerald-300',  border: 'border-emerald-500/40',  dot: 'bg-emerald-400' },
  Completed:             { bg: 'bg-green-950/80',    text: 'text-green-300',    border: 'border-green-500/40',    dot: 'bg-green-400' },
  'On Hold':             { bg: 'bg-zinc-800/80',     text: 'text-zinc-400',     border: 'border-zinc-600/40',     dot: 'bg-zinc-400' },
};

export const PRIORITY_STYLES = {
  Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  High:     'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Medium:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  Low:      'text-slate-400 bg-slate-500/10 border-slate-500/30',
};
