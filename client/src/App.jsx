import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PageSkeleton } from './components/common/PageSkeleton';
import { ThemeProvider } from './components/theme-provider';

// Lazy Loaded Page Components (Code Splitting)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const SearchHome = lazy(() => import('./pages/SearchHome').then(m => ({ default: m.SearchHome })));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail').then(m => ({ default: m.PropertyDetail })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const FinanceSuite = lazy(() => import('./pages/FinanceSuite').then(m => ({ default: m.FinanceSuite })));
const Dashboards = lazy(() => import('./pages/Dashboards').then(m => ({ default: m.Dashboards })));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard').then(m => ({ default: m.BuyerDashboard })));
const BrokerLeadsKanban = lazy(() => import('./pages/BrokerLeadsKanban').then(m => ({ default: m.BrokerLeadsKanban })));
const AdminModerationQueue = lazy(() => import('./pages/AdminModerationQueue').then(m => ({ default: m.AdminModerationQueue })));
const PropertyEditor = lazy(() => import('./pages/PropertyEditor').then(m => ({ default: m.PropertyEditor })));
const PropertyCompare = lazy(() => import('./pages/PropertyCompare').then(m => ({ default: m.PropertyCompare })));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp').then(m => ({ default: m.VerifyOtp })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const UserVerification = lazy(() => import('./pages/UserVerification').then(m => ({ default: m.UserVerification })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function AppLayout() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      {!isAuthenticated && <Navbar />}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                isAuthenticated ? (
                  <Navigate to={
                    user?.role?.toUpperCase() === 'BROKER' ? '/broker' :
                    (user?.role?.toUpperCase() === 'BUILDER' || user?.role?.toUpperCase() === 'SELLER') ? '/builder' :
                    user?.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard'
                  } replace />
                ) : <LandingPage />
              } />
              <Route path="/properties" element={<SearchHome />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/compare" element={<PropertyCompare />} />
              <Route path="/finance/:toolId?" element={<FinanceSuite />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Authenticated Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/verifications" element={
                <ProtectedRoute>
                  <UserVerification />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['BUYER']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/builder" element={
                <ProtectedRoute allowedRoles={['BUILDER', 'SELLER']}>
                  <Dashboards />
                </ProtectedRoute>
              } />
              <Route path="/broker" element={
                <ProtectedRoute allowedRoles={['BROKER']}>
                  <Dashboards />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Dashboards />
                </ProtectedRoute>
              } />
              <Route path="/editor" element={
                <ProtectedRoute allowedRoles={['BUILDER', 'BROKER', 'ADMIN', 'SELLER']}>
                  <PropertyEditor />
                </ProtectedRoute>
              } />
              <Route path="/leads" element={
                <ProtectedRoute allowedRoles={['BROKER', 'BUILDER', 'ADMIN']}>
                  <BrokerLeadsKanban />
                </ProtectedRoute>
              } />
              <Route path="/admin/moderation" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminModerationQueue />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="gharsetu-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;