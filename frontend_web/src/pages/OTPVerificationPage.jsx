import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyRegistrationOTP, verifyAdminLoginOTP } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const OTPVerificationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('REGISTER'); // REGISTER or ADMIN_LOGIN
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            toast.error("No email provided. Redirecting to login.");
            navigate('/login');
        }

        if (location.state?.type) {
            setType(location.state.type);
        }
    }, [location, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleResend = () => {
        setTimeLeft(60);
        toast.success("OTP Resent!");
        // Ideally trigger backend resend API here
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 4) {
            toast.error("Please enter a valid 4-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            let response;
            if (type === 'REGISTER') {
                response = await verifyRegistrationOTP(email, otp);
                toast.success("Email Verified! Logging you in...");
            } else {
                response = await verifyAdminLoginOTP(email, otp);
                toast.success("Admin Verified! Logging you in...");
            }

            // Login the user with the tokens received
            if (response && response.access) {
                loginSuccess(response);

                // Redirect based on role
                if (response.user.role === 'ADMIN' || response.user.role === 'MANAGER') {
                    navigate('/admin');
                } else if (response.user.role === 'EMPLOYEE') {
                    navigate('/employee');
                } else {
                    navigate('/');
                }
            } else {
                toast.error("Verification failed. Please try again.");
            }

        } catch (error) {
            console.error("OTP Verification Error:", error);
            toast.error(error.response?.data?.error || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="text-[#C19D6C]" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Verify OTP</h2>
                    <p className="text-gray-500">
                        We've sent a 4-digit code to <br />
                        <span className="font-semibold text-[#1A1A1A]">{email}</span>
                    </p>
                </div>
                <div className="mt-2 text-sm text-[#C19D6C] font-semibold text-center mb-6">
                    Expires in: {formatTime(timeLeft)}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 text-center">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            maxLength={4}
                            className="w-full py-4 text-center text-3xl tracking-[0.5em] font-bold rounded-xl bg-[#FAFAFA] border border-gray-200 focus:border-[#C19D6C] focus:ring-1 focus:ring-[#C19D6C] outline-none transition text-[#1A1A1A]"
                            placeholder="0000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-[#C19D6C] hover:text-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Verify & Login <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Didn't receive the code?
                        <button
                            className={`ml-1 font-bold ${timeLeft > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#C19D6C] hover:underline'}`}
                            onClick={handleResend}
                            disabled={timeLeft > 0}
                        >
                            Resend
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPVerificationPage;
