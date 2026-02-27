import axios from 'axios';

// 1. BASE URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2.Request Interceptor (Attach Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 3. Response Interceptor (Handle 401 & Silent Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Attempt to refresh token
          const response = await axios.post(`${API_URL}/accounts/login/refresh/`, {
            refresh: refreshToken
          });

          // If successful, save new access token
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Only clear and redirect if we're not already on login/signup page
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token available, redirect if not on public auth pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTHENTICATION ---
export const loginUser = async (email, password) => {
  const response = await api.post('/accounts/login/', { email, password });
  // Response: { access, refresh, ?user }
  return response.data;
};

export const googleLogin = async (idToken) => {
  const response = await api.post('/accounts/login/google/', {
    id_token: idToken
  });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/accounts/register/', userData);
  return response.data;
};

export const verifyRegistrationOTP = async (email, otp) => {
  const response = await api.post('/accounts/register/verify/', { email, otp });
  return response.data;
};

export const verifyAdminLoginOTP = async (email, otp) => {
  const response = await api.post('/accounts/login/admin/verify/', { email, otp });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/accounts/me/');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.patch('/accounts/me/', data);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};

// --- SERVICES & PRODUCTS (INVENTORY) ---
export const getCategories = async () => {
  const response = await api.get('/services/categories/');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/services/categories/', data);
  return response.data;
};

export const deleteCategory = async (id) => {
  await api.delete(`/services/categories/${id}/`);
};

export const getServices = async () => {
  const response = await api.get('/services/services/');
  return response.data;
};

export const createService = async (serviceData) => {
  // Check if sending FormData (image) or JSON
  const headers = serviceData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await api.post('/services/services/', serviceData, { headers });
  return response.data;
};

export const updateService = async (id, serviceData) => {
  const headers = serviceData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await api.patch(`/services/services/${id}/`, serviceData, { headers });
  return response.data;
};

export const deleteService = async (id) => {
  await api.delete(`/services/services/${id}/`);
};

export const getProducts = async () => {
  const response = await api.get('/services/products/');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/services/products/', productData);
  return response.data;
};

// --- EMPLOYEES & ATTENDANCE ---
export const getEmployees = async () => {
  const response = await api.get('/accounts/employees/');
  return response.data;
};

export const deleteEmployee = async (id) => {
  await api.delete(`/accounts/employees/${id}/`);
};

export const updateEmployee = async (id, data) => {
  const response = await api.patch(`/accounts/employees/${id}/`, data);
  return response.data;
};

export const punchAttendance = async () => {
  const response = await api.post('/accounts/attendance/punch/');
  return response.data;
};

export const getEmployeeAttendance = async (employeeId) => {
  const url = employeeId ? `/accounts/attendance/?employee=${employeeId}` : '/accounts/attendance/';
  const response = await api.get(url);
  return response.data;
};

export const getEmployeeDashboard = async () => {
  const response = await api.get('/bookings/employee/dashboard/');
  return response.data;
};

export const getEmployeeAnalytics = async (date) => {
  const url = date ? `/bookings/employee/analytics/?date=${date}` : '/bookings/employee/analytics/';
  const response = await api.get(url);
  return response.data;
};

export const getMyEmployeeProfile = async () => {
  const response = await api.get('/accounts/employees/me/');
  return response.data;
};

export const getEmployeeReviews = async () => {
  const response = await api.get('/accounts/employees/me/reviews/');
  return response.data;
};

export const getEmployeeNotifications = async () => {
  const response = await api.get('/accounts/employees/me/notifications/');
  return response.data;
};

// --- REVIEWS ---
export const submitReview = async (reviewData) => {
  // reviewData: { booking_id, rating, comment }
  const response = await api.post('/accounts/reviews/create/', reviewData);
  return response.data;
};


// --- BOOKINGS ---
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings/bookings/', bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/bookings/');
  return response.data;
};

export const getQueue = async (date) => {
  const url = date ? `/bookings/bookings/?date=${date}` : '/bookings/bookings/';
  const response = await api.get(url);
  return response.data;
};

export const updateBookingStatus = async (id, statusData) => {
  const response = await api.patch(`/bookings/bookings/${id}/`, statusData);
  return response.data;
};

export const getBookingDetails = async (id) => {
  const response = await api.get(`/bookings/bookings/${id}/`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.post(`/bookings/bookings/${id}/cancel/`);
  return response.data;
};

export const rescheduleBooking = async (id) => {
  const response = await api.post(`/bookings/bookings/${id}/reschedule/`);
  return response.data;
};

export const trackBooking = async (id) => {
  const response = await api.get(`/bookings/bookings/${id}/track/`);
  return response.data;
};

// --- JOB TIMER (EMPLOYEE) ---
export const startJob = async (id) => {
  const response = await api.post(`/bookings/bookings/${id}/start_job/`);
  return response.data;
};

export const finishJob = async (id) => {
  const response = await api.post(`/bookings/bookings/${id}/finish_job/`);
  return response.data;
};

// --- ADMIN STATS & PAYROLL ---
export const getAdminAnalytics = async (date) => {
  const url = date ? `/bookings/admin/analytics/?date=${date}` : '/bookings/admin/analytics/';
  const response = await api.get(url);
  return response.data;
};

export const getPayroll = async () => {
  const response = await api.get('/accounts/payroll/');
  return response.data;
};

export const generatePayroll = async (month) => {
  const response = await api.post('/accounts/payroll/generate/', { month });
  return response.data;
};

// --- PAYOUTS ---
export const getEmployeeDetail = async (id) => {
  const response = await api.get(`/accounts/employees/${id}/`);
  return response.data;
};

export const settlePayout = async (employeeId, formData) => {
  const response = await api.post(`/accounts/employees/${employeeId}/settle-payout/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getPayoutHistory = async (employeeId) => {
  const response = await api.get(`/accounts/employees/${employeeId}/payout-history/`);
  return response.data;
};

export const getMyPayoutHistory = async () => {
  const response = await api.get('/accounts/employees/me/payout-history/');
  return response.data;
};

// --- AI ENGINE ---
export const analyzeFaceShape = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  // Using out master proxy gateway by prefixing with /api/ai
  // Wait, the baseURL is: const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  // Oh, wait! Our baseURL is API_URL which ends in `/api/v1`.
  // The gateway points to `/api/ai/` and `/api/v1/`.
  // So if API_URL ='http://localhost/api/v1', we need to go up one level.
  // Or we can just use an absolute path for this specific endpoint.

  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/v1', '') : 'http://localhost/api';

  const response = await axios.post(`${API_BASE}/ai/analyze-face`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const chatCustomerAI = async (query) => {
  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/v1', '') : 'http://localhost/api';
  const response = await axios.post(`${API_BASE}/ai/chat/customer`, { query }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const chatAdminAI = async (query) => {
  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/v1', '') : 'http://localhost/api';
  const response = await axios.post(`${API_BASE}/ai/chat/admin`, { query }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export default api;