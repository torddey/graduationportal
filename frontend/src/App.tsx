import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';
import NoticePage from './pages/NoticePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUpload from './pages/admin/AdminUpload';
import AdminSettings from './pages/admin/AdminSettings';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/registration" element={
            <ProtectedRoute>
              <RegistrationPage />
            </ProtectedRoute>
          } />
          <Route path="/confirmation" element={
            <ProtectedRoute>
              <ConfirmationPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/upload" element={
            <AdminRoute>
              <AdminUpload />
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          } />
          <Route path="/admin/analytics" element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
