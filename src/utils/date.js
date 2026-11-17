export function nowTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isTaskOverdue(task) {
  if (!task) return false;
  if (task.status === 'Completed' || task.status === 'Approved') return false;
  return task.deadline < todayStr();
}

export function isDeadlineApproaching(task) {
  if (!task) return false;
  if (task.status === 'Completed' || task.status === 'Approved') return false;
  if (task.deadline < todayStr()) return false;
  const diff = (new Date(task.deadline) - new Date(todayStr())) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 4;
}

export function formatFirestoreDate(ts) {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  if (ts.toDate) {
    const d = ts.toDate();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return String(ts);
}
