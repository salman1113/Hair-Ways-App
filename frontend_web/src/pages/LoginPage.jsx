import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api, { googleLogin } from '../services/api';

const LoginPage = () => {
  const { login, loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login(formData.email, formData.password);

      // Check if Admin OTP is required
      if (response.require_otp) {
        navigate('/admin/verify', {
          state: { email: formData.email, type: 'ADMIN_LOGIN' }
        });
        return;
      }

      const userData = response.user || response; // fallback if user object is top level

      if (userData.role === 'ADMIN' || userData.role === 'MANAGER') {
        navigate('/admin');
      } else if (userData.role === 'EMPLOYEE') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        // Check if it's an email verification error
        if (err.response.data.error === "Email not verified" || err.response.data.error.includes("inactive")) {
          if (window.confirm("Your email is not verified. Would you like to verify it now?")) {
            navigate('/verify-email', {
              state: { email: formData.email, type: 'REGISTER' }
            });
          }
          setError("Email not verified.");
        } else {
          setError("Access Denied.");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential);

      if (data.access) {
        loginSuccess(data);

        if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') {
          navigate('/admin');
        } else if (data.user.role === 'EMPLOYEE') {
          navigate('/employee');
        } else {
          navigate('/');
        }
      }

    } catch (err) {
      console.error('Google Login Failed', err);
      setError('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Pop-up closed or error occurred.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 md:p-0">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-in border border-gray-100">

        {/* Left Side - Dark Image Panel */}
        <div className="w-full md:w-1/2 relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1621644827845-ea5c7a36f40b?auto=format&fit=crop&q=80&w=1000"
            alt="Login Visual"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0B0B0B]/70 flex items-center justify-center p-12">
            <div className="text-white text-center">
              <span className="text-[#C19D6C] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Hair Ways</span>
              <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
              <p className="opacity-80 leading-relaxed text-gray-300">Login to access your personalized grooming dashboard and smart booking features.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Sign In</h2>
            <p className="text-gray-500 mb-8">Enter your details to continue</p>

            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#FAFAFA] border border-gray-200 focus:border-[#C19D6C] focus:ring-1 focus:ring-[#C19D6C] outline-none transition text-[#1A1A1A]"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#FAFAFA] border border-gray-200 focus:border-[#C19D6C] focus:ring-1 focus:ring-[#C19D6C] outline-none transition text-[#1A1A1A]"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-[#C19D6C] hover:text-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  shape="circle"
                />
              </div>
            </div>

            <p className="text-center mt-6 text-sm text-gray-500">
              Don't have an account? <Link to="/signup" className="text-[#C19D6C] font-bold hover:underline">Register here</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;