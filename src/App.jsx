import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { subscribeUsers, subscribeProjects, subscribeMilestones, subscribeTasks, subscribeProgressUpdates, subscribeReviews, subscribeHistory } from './services/db';
import { Spinner, Toast } from './components/Shared';
import Layout from './components/Layout';

import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';

import AdminDashboard from './pages/admin/Dashboard';
import AdminTaskManagement from './pages/admin/TaskManagement';
import AdminReviewCenter from './pages/admin/ReviewCenter';
import AdminRevisionTracker from './pages/admin/RevisionTracker';
import AdminStaffPerformance from './pages/admin/StaffPerformance';
import AdminTimeline from './pages/admin/Timeline';
import AdminActivityHistory from './pages/admin/ActivityHistory';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminProjects from './pages/admin/Projects';

import StaffDashboard from './pages/staff/Dashboard';
import StaffMyTasks from './pages/staff/MyTasks';
import StaffMySubmissions from './pages/staff/MySubmissions';
import StaffRevisionRequests from './pages/staff/RevisionRequests';

import TaskDetail from './pages/shared/TaskDetail';

export default function App() {
  const { firebaseUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubs = [
      subscribeUsers((snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
      subscribeProjects((snap) => setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
      subscribeMilestones((snap) => setMilestones(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
      subscribeTasks((snap) => setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
      subscribeProgressUpdates((snap) => setUpdates(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
      subscribeReviews((snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
      subscribeHistory((snap) => setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    ];
    return () => unsubs.forEach((u) => u());
  }, [firebaseUser]);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      navigate('/login', { replace: true });
    } else if (!userProfile || userProfile.accountStatus !== 'Active') {
      navigate('/access-denied', { replace: true });
    } else {
      const target = userProfile.role === 'ADMIN' ? '/admin' : '/staff';
      if (window.location.hash === '#/' || window.location.hash === '') {
        navigate(target, { replace: true });
      }
    }
  }, [firebaseUser, userProfile, loading, navigate]);

  const notifications = useMemo(() => {
    if (!userProfile) return [];
    const list = [];
    if (userProfile.role === 'ADMIN') {
      tasks.filter((t) => t.status === 'Submitted for Review' || t.status === 'Resubmitted').forEach((t) => {
        list.push({ id: `sub-${t.id}`, title: `Pending Review: ${t.taskId}`, message: `${t.taskTitle}`, read: false });
      });
      tasks.filter((t) => t.status === 'Revision Required').forEach((t) => {
        list.push({ id: `rev-${t.id}`, title: `Revision in Progress: ${t.taskId}`, message: t.taskTitle, read: false });
      });
    } else {
      tasks.filter((t) => t.assignedStaffEmail === userProfile.email && t.status === 'Revision Required').forEach((t) => {
        list.push({ id: `rev-${t.id}`, title: `Revision Requested: ${t.taskId}`, message: t.taskTitle, read: false });
      });
      tasks.filter((t) => t.assignedStaffEmail === userProfile.email && t.status === 'Approved').forEach((t) => {
        list.push({ id: `app-${t.id}`, title: `Approved: ${t.taskId}`, message: t.taskTitle, read: false });
      });
    }
    return list;
  }, [tasks, userProfile]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const sharedProps = {
    users, projects, milestones, tasks, updates, reviews, history,
    userProfile, showToast,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          userProfile?.role === 'ADMIN' && userProfile?.accountStatus === 'Active'
            ? <Layout notifications={notifications} unreadCount={notifications.filter(n => !n.read).length} onMarkAllRead={() => {}}><AdminDashboard {...sharedProps} /></Layout>
            : <Navigate to="/login" replace />
        } />
        <Route path="/admin/tasks" element={
          userProfile?.role === 'ADMIN' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminTaskManagement {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/reviews" element={
          userProfile?.role === 'ADMIN' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminReviewCenter {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/revisions" element={
          userProfile?.role === 'ADMIN' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminRevisionTracker {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/performance" element={
          userProfile?.role === 'ADMIN' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminStaffPerformance {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/timeline" element={
          userProfile?.role === 'ADMIN' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminTimeline {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/history" element={
          userProfile?.role === 'ADMIN' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminActivityHistory {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/users" element={
          userProfile?.role === 'ADMIN' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminUserManagement {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/projects" element={
          userProfile?.role === 'ADMIN'
            ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminProjects {...sharedProps} /></Layout>
            : <Navigate to="/login" replace />
        } />


        {/* Staff routes */}
        <Route path="/staff" element={
          userProfile?.role === 'STAFF' && userProfile?.accountStatus === 'Active'
            ? <Layout notifications={notifications} unreadCount={notifications.filter(n => !n.read).length} onMarkAllRead={() => {}}><StaffDashboard {...sharedProps} /></Layout>
            : <Navigate to="/login" replace />
        } />
        <Route path="/staff/tasks" element={
          userProfile?.role === 'STAFF' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><StaffMyTasks {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/staff/revisions" element={
          userProfile?.role === 'STAFF' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><StaffRevisionRequests {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/staff/submissions" element={
          userProfile?.role === 'STAFF' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><StaffMySubmissions {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />
        <Route path="/staff/timeline" element={
          userProfile?.role === 'STAFF' ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><AdminTimeline {...sharedProps} /></Layout> : <Navigate to="/login" replace />
        } />

        {/* Shared task detail */}
        <Route path="/task/:taskId" element={
          userProfile?.accountStatus === 'Active'
            ? <Layout notifications={notifications} unreadCount={0} onMarkAllRead={() => {}}><TaskDetail {...sharedProps} /></Layout>
            : <Navigate to="/login" replace />
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}
