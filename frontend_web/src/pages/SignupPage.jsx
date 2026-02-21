import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { Loader2, ArrowRight, User, Mail, Lock, Phone } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerUser(formData);

      alert("Registration Successful! Please Verify your Email.");
      navigate('/verify-email', {
        state: {
          email: formData.email,
          type: 'REGISTER'
        }
      });
    } catch (err) {
      console.error("Signup Error:", err);
      if (err.response && err.response.data) {
        const errorMsg = Object.values(err.response.data).flat()[0];
        setError(errorMsg || "Registration failed. Try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 md:p-0">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px] animate-fade-in border border-gray-100">

        {/* Left Side - Dark Image Panel */}
        <div className="w-full md:w-1/2 relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=1000"
            alt="Signup Visual"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0B0B0B]/70 flex items-center justify-center p-12">
            <div className="text-white text-center">
              <span className="text-[#C19D6C] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Hair Ways</span>
              <h2 className="text-4xl font-bold mb-4">Join the Elite</h2>
              <p className="opacity-80 leading-relaxed text-gray-300 text-lg">
                Create an account to unlock exclusive grooming services, AI style recommendations, and priority booking.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Begin your journey with Hair Ways</p>

            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name (Username) */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#FAFAFA] border border-gray-200 focus:border-[#C19D6C] focus:ring-1 focus:ring-[#C19D6C] outline-none transition text-[#1A1A1A]"
                    placeholder="John Doe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#FAFAFA] border border-gray-200 focus:border-[#C19D6C] focus:ring-1 focus:ring-[#C19D6C] outline-none transition text-[#1A1A1A]"
                    placeholder="+91 98765 43210"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
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
                className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-[#C19D6C] hover:text-black transition-all flex items-center justify-center gap-2 mt-6 shadow-lg hover:shadow-xl active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-[#C19D6C] font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;