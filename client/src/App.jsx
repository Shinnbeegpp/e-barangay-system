import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

// Resident pages
import ResidentLayout from './components/ResidentLayout';
import ResidentDashboard from './pages/resident/Dashboard';
import ResidentProfile from './pages/resident/Profile';
import DocumentRequest from './pages/resident/DocumentRequest';
import AssistancePortal from './pages/resident/AssistancePortal';
import IncidentReport from './pages/resident/IncidentReport';
import MyTracker from './pages/resident/MyTracker';
import ResidentSettings from './pages/resident/Settings';

// Staff pages
import StaffLayout from './components/StaffLayout';
import StaffDashboard from './pages/staff/Dashboard';
import AccountVerification from './pages/staff/AccountVerification';
import StaffDocuments from './pages/staff/Documents';
import StaffAssistance from './pages/staff/Assistance';
import CitizenReports from './pages/staff/CitizenReports';
import Announcements from './pages/staff/Announcements';
import ResidentRecords from './pages/staff/ResidentRecords';
import AdminAccounts from './pages/staff/AdminAccounts';
import TransactionLogs from './pages/staff/TransactionLogs';
import StaffSettings from './pages/staff/Settings';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && !(role === 'staff' && user.role === 'admin')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={
        user ? (user.role === 'resident' ? <Navigate to="/resident/dashboard" /> : <Navigate to="/staff/dashboard" />) : <Navigate to="/login" />
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Resident Routes */}
      <Route path="/resident" element={<PrivateRoute role="resident"><ResidentLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<ResidentDashboard />} />
        <Route path="profile" element={<ResidentProfile />} />
        <Route path="documents" element={<DocumentRequest />} />
        <Route path="assistance" element={<AssistancePortal />} />
        <Route path="incidents" element={<IncidentReport />} />
        <Route path="tracker" element={<MyTracker />} />
        <Route path="settings" element={<ResidentSettings />} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={<PrivateRoute role="staff"><StaffLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="verification" element={<AccountVerification />} />
        <Route path="documents" element={<StaffDocuments />} />
        <Route path="assistance" element={<StaffAssistance />} />
        <Route path="reports" element={<CitizenReports />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="residents" element={<ResidentRecords />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="logs" element={<TransactionLogs />} />
        <Route path="settings" element={<StaffSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
