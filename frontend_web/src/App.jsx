import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import IntroScreen from './components/IntroScreen';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout'; // 🔥 New Layout
import CustomerChatWidget from './components/CustomerChatWidget';

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
import AiStylistPage from "./pages/AiStylistPage";

// Pages - Customer
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import ProfilePage from './pages/ProfilePage';

// Pages - Admin (Separated) 🔥
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminEmployeeDetail from './pages/admin/AdminEmployeeDetail';
import AdminInventory from './pages/admin/AdminInventory';
import AdminBookings from './pages/admin/AdminBookings';

// Pages - Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

import { Toaster } from 'react-hot-toast';

// 🛡️ GUARDS - Defined OUTSIDE AppContent for stable component identity
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') return <Navigate to="/" />;
  return children;
};

const EmployeeRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'EMPLOYEE' && user.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

const HomeOrAdminRedirect = () => {
  const { user } = useAuth();
  if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
    return <Navigate to="/admin" replace />;
  }
  if (user && user.role === 'EMPLOYEE') {
    return <Navigate to="/employee" replace />;
  }
  return <HomePage />;
};

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

  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee');

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'z-[9999]', duration: 4000 }} />
      {pageLoading && <Loader />}
      {!isDashboard && <Navbar />}
      {!isDashboard && <CustomerChatWidget />}

      {/* ... rest of the code ... */}

      <div className={`flex flex-col min-h-screen transition-opacity duration-500 relative ${pageLoading ? "opacity-0" : "opacity-100"}`}>
        <main className="flex-grow flex flex-col relative w-full">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomeOrAdminRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<OTPVerificationPage />} />
            <Route path="/admin/verify" element={<OTPVerificationPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/ai-stylist" element={<AiStylistPage />} /> {/* 🔥 AI Stylist Route */}
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
              <Route path="employees/:id" element={<AdminEmployeeDetail />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="bookings" element={<AdminBookings />} />
            </Route>

            {/* Employee */}
            <Route path="/employee/*" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
          </Routes>
        </main>
        {!isDashboard && <Footer />}
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