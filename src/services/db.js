import { db } from '../firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, writeBatch, serverTimestamp
} from 'firebase/firestore';

// ── USERS ────────────────────────────────────────────────
export const getUserByEmail = (email) => getDoc(doc(db, 'users', email));
export const saveUser = (email, data) => setDoc(doc(db, 'users', email), data, { merge: true });
export const updateUser = (email, data) => updateDoc(doc(db, 'users', email), data);
export const subscribeUsers = (cb) => onSnapshot(collection(db, 'users'), cb);

// ── PROJECTS ─────────────────────────────────────────────
export const saveProject = (id, data) =>
  setDoc(doc(db, 'projects', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
export const removeProject = (id) => deleteDoc(doc(db, 'projects', id));
export const subscribeProjects = (cb) => onSnapshot(collection(db, 'projects'), cb);

// ── MILESTONES ───────────────────────────────────────────
export const saveMilestone = (id, data) =>
  setDoc(doc(db, 'milestones', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
export const removeMilestone = (id) => deleteDoc(doc(db, 'milestones', id));
export const subscribeMilestones = (cb) => onSnapshot(collection(db, 'milestones'), cb);

// ── TASKS ────────────────────────────────────────────────
export const saveTask = (id, data) =>
  setDoc(doc(db, 'tasks', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
export const removeTask = (id) => deleteDoc(doc(db, 'tasks', id));
export const subscribeTasks = (cb) => onSnapshot(collection(db, 'tasks'), cb);

// ── TASK CASCADE DELETE ──────────────────────────────────
// Hapus task + semua progress_updates & reviews terkait dalam satu batch.
// activity_history TIDAK dihapus (berfungsi sebagai audit trail).
export const deleteTaskWithCascade = async (taskId) => {
  const updatesSnap = await getDocs(
    query(collection(db, 'progress_updates'), where('taskId', '==', taskId))
  );
  const reviewsSnap = await getDocs(
    query(collection(db, 'reviews'), where('taskId', '==', taskId))
  );

  const batch = writeBatch(db);
  batch.delete(doc(db, 'tasks', taskId));
  updatesSnap.forEach((d) => batch.delete(d.ref));
  reviewsSnap.forEach((d) => batch.delete(d.ref));

  await batch.commit();

  return {
    updatesDeleted: updatesSnap.size,
    reviewsDeleted: reviewsSnap.size,
  };
};

// ── PROGRESS UPDATES (append-only) ──────────────────────
export const saveProgressUpdate = (id, data) =>
  setDoc(doc(db, 'progress_updates', id), { ...data, submissionDate: serverTimestamp() });
export const subscribeProgressUpdates = (cb) => onSnapshot(collection(db, 'progress_updates'), cb);

// ── REVIEWS (append-only) ────────────────────────────────
export const saveReview = (id, data) =>
  setDoc(doc(db, 'reviews', id), { ...data, reviewDate: serverTimestamp() });
export const subscribeReviews = (cb) => onSnapshot(collection(db, 'reviews'), cb);

// ── ACTIVITY HISTORY (append-only) ───────────────────────
export const saveHistory = (id, data) =>
  setDoc(doc(db, 'activity_history', id), { ...data, timestamp: serverTimestamp() });
export const subscribeHistory = (cb) =>
  onSnapshot(query(collection(db, 'activity_history'), orderBy('timestamp', 'desc')), cb);
