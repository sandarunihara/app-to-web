import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { Dashboard } from './features/dashboard/Dashboard';
import { MainLayout } from './components/layout/MainLayout';
import { useAuth } from './providers/AuthProvider';
import { PersonalDetails } from './features/profile/PersonalDetails';
import { HealthProfile } from './features/profile/HealthProfile';
import { SecuritySettings } from './features/profile/SecuritySettings';
import { ScreenWrapper } from './components/layout/ScreenWrapper';
import { DoctorList } from './features/doctors/DoctorList';
import { JendoTestsList } from './features/jendo-tests/JendoTestsList';
import { RecordsList } from './features/medical-records/RecordsList';
import { WellnessDashboard } from './features/wellness/WellnessDashboard';
import { LearningFeed } from './features/learning/LearningFeed';

// Auth Pages (Named exports)
const ForgotPassword = React.lazy(() => import('./features/auth/ForgotPassword.tsx').then(m => ({ default: m.ForgotPassword })));
const VerifyOtp = React.lazy(() => import('./features/auth/VerifyOtp.tsx').then(m => ({ default: m.VerifyOtp })));
const ResetPasswordOtp = React.lazy(() => import('./features/auth/ResetPasswordOtp.tsx').then(m => ({ default: m.ResetPasswordOtp })));
const NewPassword = React.lazy(() => import('./features/auth/NewPassword.tsx').then(m => ({ default: m.NewPassword })));

// Feature Pages (Named exports)
const DoctorDetail = React.lazy(() => import('./features/doctors/DoctorDetail.tsx').then(m => ({ default: m.DoctorDetail })));
const AppointmentDetail = React.lazy(() => import('./features/doctors/AppointmentDetail.tsx').then(m => ({ default: m.AppointmentDetail })));
const ReportDetail = React.lazy(() => import('./features/jendo-tests/ReportDetail.tsx').then(m => ({ default: m.ReportDetail })));
const MyReportDetail = React.lazy(() => import('./features/medical-records/MyReportDetail.tsx').then(m => ({ default: m.MyReportDetail })));
const AddReport = React.lazy(() => import('./features/medical-records/AddReport.tsx').then(m => ({ default: m.AddReport })));
const WellnessDetail = React.lazy(() => import('./features/wellness/WellnessDetail.tsx').then(m => ({ default: m.WellnessDetail })));
const LearningDetail = React.lazy(() => import('./features/learning/LearningDetail.tsx').then(m => ({ default: m.LearningDetail })));
const Chatbot = React.lazy(() => import('./features/wellness/Chatbot.tsx').then(m => ({ default: m.Chatbot })));

// Loading Component
const LoadingFallback = () => (
  <ScreenWrapper className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </ScreenWrapper>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main Layout with Sidebar
const LayoutWithSidebar = () => {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
};

// 404 Page
const NotFound = () => (
  <ScreenWrapper className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <a href="/dashboard" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        Back to Dashboard
      </a>
    </div>
  </ScreenWrapper>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Routes - Auth */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ForgotPassword />
            </React.Suspense>
          </PublicRoute>
        } />
        <Route path="/verify-otp" element={
          <PublicRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <VerifyOtp />
            </React.Suspense>
          </PublicRoute>
        } />
        <Route path="/reset-password-otp" element={
          <PublicRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ResetPasswordOtp />
            </React.Suspense>
          </PublicRoute>
        } />
        <Route path="/new-password" element={
          <PublicRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <NewPassword />
            </React.Suspense>
          </PublicRoute>
        } />

        {/* Protected Routes - Main Layout */}
        <Route element={<LayoutWithSidebar />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Dashboard />} />

          {/* Doctors Routes */}
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/doctors/:id" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <DoctorDetail />
            </React.Suspense>
          } />
          <Route path="/appointments/:id" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <AppointmentDetail />
            </React.Suspense>
          } />

          {/* Jendo Tests Routes */}
          <Route path="/jendo-reports" element={<JendoTestsList />} />
          <Route path="/tests" element={<JendoTestsList />} />
          <Route path="/jendo-reports/:id" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <ReportDetail />
            </React.Suspense>
          } />

          {/* Medical Records Routes */}
          <Route path="/my-reports" element={<RecordsList />} />
          <Route path="/records" element={<RecordsList />} />
          <Route path="/my-reports/:id" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <MyReportDetail />
            </React.Suspense>
          } />
          <Route path="/my-reports/add" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <AddReport />
            </React.Suspense>
          } />

          {/* Wellness Routes */}
          <Route path="/wellness" element={<WellnessDashboard />} />
          <Route path="/wellness/chatbot" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <Chatbot />
            </React.Suspense>
          } />
          <Route path="/wellness/:category" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <WellnessDetail />
            </React.Suspense>
          } />

          {/* Learning Routes */}
          <Route path="/learning" element={<LearningFeed />} />
          <Route path="/learning/:id" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <LearningDetail />
            </React.Suspense>
          } />

          {/* Profile Routes */}
          <Route path="/profile">
            <Route index element={<Navigate to="personal" replace />} />
            <Route path="personal" element={<PersonalDetails />} />
            <Route path="health" element={<HealthProfile />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="password" element={<SecuritySettings />} />
            <Route path="notifications" element={<PersonalDetails />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
