import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AccountTypeSelection from './pages/AccountTypeSelection';
import IndividualRegistration from './pages/IndividualRegistration';
import VerificationSelection from './pages/VerificationSelection';
import InformationReview from './pages/InformationReview';
import TermsAndConditions from './pages/TermsAndConditions';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import PasswordReset from './pages/PasswordReset';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import FinancialDashboard from './pages/FinancialDashboard';
import Upload from './pages/Upload';
import Guides from './pages/Guides';
import Templates from './pages/Templates';
import FAQs from './pages/FAQs';
import About from './pages/About';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './store/useAuthStore';
import { useRole } from './hooks/useRole';

function PrivateRoute({ children, requiredRole, allowedRoles = [] }: { 
  children: React.ReactNode, 
  requiredRole?: string,
  allowedRoles?: string[]
}) {
  const { user, loading: authLoading } = useAuthStore();
  const { role, loading: roleLoading } = useRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the route requires a specific role
  if (requiredRole && role !== requiredRole) {
    console.log('Access denied. Required role:', requiredRole, 'Current role:', role);
    
    // Redirect based on user's role
    switch (role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'government':
        return <Navigate to="/government" replace />;
      case 'financial':
        return <Navigate to="/financial" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if the user's role is allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log('Access denied. Allowed roles:', allowedRoles, 'Current role:', role);
    
    // Redirect based on user's role
    switch (role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'government':
        return <Navigate to="/government" replace />;
      case 'financial':
        return <Navigate to="/financial" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/signup" element={<AccountTypeSelection />} />
        <Route path="/signup/terms/:sessionId" element={<TermsAndConditions />} />
        <Route path="/signup/individual/:sessionId" element={<IndividualRegistration />} />
        <Route path="/signup/review/:userId" element={<InformationReview />} />
        <Route path="/signup/verify/:userId" element={<VerificationSelection />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard/upload" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <Upload />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard/settings" 
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Government Routes */}
        <Route 
          path="/government" 
          element={
            <PrivateRoute requiredRole="government">
              <GovernmentDashboard />
            </PrivateRoute>
          } 
        />

        {/* Financial Institution Routes */}
        <Route 
          path="/financial" 
          element={
            <PrivateRoute requiredRole="financial">
              <FinancialDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;