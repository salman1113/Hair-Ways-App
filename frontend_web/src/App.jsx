import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import IntroScreen from './components/IntroScreen';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout'; // 🔥 New Layout

// Pages - Public
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import BarberDetails from './pages/BarberDetails'; // 🔥 New Details Page
import ServiceDetails from './pages/ServiceDetails';
import GalleryPage from './pages/GalleryPage';
import ReviewsPage from './pages/ReviewsPage'; // 🔥 New Reviews Page
import NotFoundPage from './pages/NotFoundPage'; // 🔥 New 404 Page
import SignupPage from './pages/SignupPage';
import OTPVerificationPage from './pages/OTPVerificationPage';

// Pages - Customer
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import ProfilePage from './pages/ProfilePage';

// Pages - Admin (Separated) 🔥
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminInventory from './pages/admin/AdminInventory';
import AdminBookings from './pages/admin/AdminBookings';

// Pages - Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  useEffect(() => {
    if (!firstLoadDone) {
      setFirstLoadDone(true);
      return;
    }
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) return <Loader />;

  // 🛡️ GUARDS
  const AdminRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') return <Navigate to="/" />;
    return children;
  };

  const EmployeeRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'EMPLOYEE' && user.role !== 'ADMIN') return <Navigate to="/" />;
    return children;
  };

  // 🛡️ Redirect authenticated admins from the homepage to the dashboard
  const HomeOrAdminRedirect = () => {
    if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      return <Navigate to="/admin" replace />;
    }
    return <HomePage />;
  };

  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee');

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'z-[9999]', duration: 4000 }} />
      {pageLoading && <Loader />}
      {!isDashboard && <Navbar />}

      {/* ... rest of the code ... */}

      <div className={`transition-opacity duration-500 pb-24 md:pb-0 ${pageLoading ? "opacity-0" : "opacity-100"}`}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomeOrAdminRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<OTPVerificationPage />} />
          <Route path="/admin/verify" element={<OTPVerificationPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/reviews" element={<ReviewsPage />} /> {/* 🔥 Reviews Route */}
          <Route path="/about" element={<AboutPage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/:id" element={<BarberDetails />} /> {/* 🔥 Dynamic Route */}

          {/* Customer */}
          <Route path="/book" element={<BookingPage />} />
          <Route path="/success" element={<BookingSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* 🔥 NEW NESTED ADMIN ROUTES */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} /> {/* Main Dashboard */}
            <Route path="services" element={<AdminServices />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>

          {/* Employee */}
          <Route path="/employee/*" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  const [introVisible, setIntroVisible] = useState(true);
  useEffect(() => { setTimeout(() => setIntroVisible(false), 2500); }, []);
  return <Router>{introVisible && <IntroScreen />}<AppContent /></Router>;
}

export default App;