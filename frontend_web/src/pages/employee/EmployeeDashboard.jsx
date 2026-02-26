import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LogOut, Calendar, Clock, IndianRupee, User, CheckCircle, Smartphone,
    Home, BarChart2, Bell, Play, Check, Navigation, Star, FileText, Plus, X, Scissors, Wallet, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getEmployeeDashboard, updateEmployee, getEmployeeAnalytics,
    getMyEmployeeProfile, getEmployeeReviews, getEmployeeNotifications, getEmployeeAttendance,
    startJob, finishJob, getServices, createBooking, getMyPayoutHistory
} from '../../services/api';
import toast from 'react-hot-toast';
import useWebSocketNotification from '../../hooks/useWebSocketNotification';

// Circular Timer Component
const TimerCircle = ({ startTime, durationMinutes }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(startTime);
            const elapsed = Math.max(0, (now - start) / 1000 / 60); // minutes
            const remaining = Math.max(0, durationMinutes - elapsed);

            setTimeLeft(remaining);
            setProgress(Math.min(100, (elapsed / durationMinutes) * 100));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, durationMinutes]);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const formatTime = (minutes) => {
        const m = Math.floor(minutes);
        const s = Math.floor((minutes - m) * 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isOvertime = timeLeft === 0;

    return (
        <div className="flex flex-col items-center justify-center my-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-500 text-xs tracking-widest uppercase mb-4">Live Service Timer</h3>
            <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r={radius} className="stroke-gray-200" strokeWidth="8" fill="none" />
                    <circle cx="64" cy="64" r={radius} className={`transition-all duration-1000 ease-linear ${isOvertime ? 'stroke-red-500' : 'stroke-green-500'}`} strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className={`text-2xl font-black ${isOvertime ? 'text-red-500' : 'text-[#1A1A1A]'}`}>{formatTime(timeLeft)}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Remaining</span>
                </div>
            </div>
            {isOvertime && <span className="px-3 py-1 bg-red-100 text-red-600 font-bold text-[10px] rounded-md uppercase tracking-wider animate-pulse">Overtime</span>}
        </div>
    );
};

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    // States
    const [dashboardData, setDashboardData] = useState({ queue: [], earnings_today: 0, completed_today: 0 });
    const [analytics, setAnalytics] = useState(null);
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [payouts, setPayouts] = useState([]);

    const [isAvailable, setIsAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyticsDate, setAnalyticsDate] = useState(new Date().toISOString().split('T')[0]);

    // Walk-in Modal States
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [servicesList, setServicesList] = useState([]);
    const [walkInForm, setWalkInForm] = useState({ guest_name: '', guest_phone: '', service_ids: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tick every 30s so the Start button's 15-min buffer re-evaluates automatically
    const [currentTime, setCurrentTime] = useState(Date.now());
    useEffect(() => {
        const ticker = setInterval(() => setCurrentTime(Date.now()), 30000);
        return () => clearInterval(ticker);
    }, []);

    useEffect(() => {
        if (user) {
            const available = user.employee_profile?.is_available ?? user.is_available ?? false;
            setIsAvailable(available);
            fetchDashboardData();
            fetchServicesList();
            if (!profile) fetchProfileData(); // Eagerly fetch for walk-In POS system
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'inbox' && notifications.length === 0) fetchNotifications();
        if (activeTab === 'wallet') fetchPayouts();
    }, [activeTab, analyticsDate]);

    // WebSocket Integration: Auto-refresh data on new message
    useWebSocketNotification((messageData) => {
        console.log("Live update via WebSocket!", messageData);
        // Refresh the queue and earnings, and notifications list
        fetchDashboardData();
        fetchNotifications();

        // If the action is a completed job or wallet payout, refresh the wallet balance
        if (messageData.action === 'refresh_wallet' || messageData.message?.includes('completed')) {
            fetchProfileData();
            fetchPayouts(); // Optionally fetch payouts if it's a new payout
        }
    });

    // Data Fetching
    const fetchDashboardData = async () => {
        try {
            const data = await getEmployeeDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error("Dashboard error", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const data = await getEmployeeAnalytics(analyticsDate);
            setAnalytics(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchServicesList = async () => {
        try {
            const data = await getServices();
            setServicesList(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        }
    };

    const fetchProfileData = async () => {
        try {
            const [profData, revData, attData] = await Promise.all([
                getMyEmployeeProfile(),
                getEmployeeReviews(),
                getEmployeeAttendance()
            ]);
            setProfile(profData);
            setReviews(revData);
            setAttendance(attData);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await getEmployeeNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Actions
    const toggleAvailability = async () => {
        const newValue = !isAvailable;
        setIsAvailable(newValue);
        try {
            const empId = user.employee_profile?.id || user.id;
            await updateEmployee(empId, { is_available: newValue });
            toast.success(`Active Status: ${newValue ? 'Online' : 'Offline'}`);
        } catch (error) {
            setIsAvailable(!newValue);
            toast.error("Failed to update status");
        }
    };

    const handleStartJob = async (bookingId) => {
        try {
            await startJob(bookingId);
            toast.success("Job Started! Timer active.");
            fetchDashboardData(); // Refresh queue
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to start job");
        }
    };

    const handleFinishJob = async (bookingId) => {
        try {
            await finishJob(bookingId);
            toast.success("Job Completed! Earnings updated.");
            fetchDashboardData(); // Refresh queue
        } catch (error) {
            toast.error("Failed to finish job");
        }
    };

    const handleCreateWalkIn = async (e) => {
        e.preventDefault();
        if (walkInForm.service_ids.length === 0) {
            return toast.error("Please select at least one service!");
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Creating Walk-in Ticket...");

        // Generate current time and date
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0]; // "14:30:00"

        try {
            const payload = {
                booking_type: 'Walk-in',
                is_walk_in: true,
                guest_name: walkInForm.guest_name || 'Walk-in Guest',
                guest_phone: walkInForm.guest_phone,
                service_ids: walkInForm.service_ids,
                booking_date: currentDate,
                booking_time: currentTime,
                employee: profile?.id || user.id
            };

            await createBooking(payload);
            toast.success("Walk-in Ticket Created!", { id: toastId });
            setShowWalkInModal(false);
            setWalkInForm({ guest_name: '', guest_phone: '', service_ids: [] });
            fetchDashboardData(); // Refresh queue immediately
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to create ticket", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchPayouts = async () => {
        try {
            const data = await getMyPayoutHistory();
            setPayouts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleServiceSelection = (id) => {
        setWalkInForm(prev => {
            if (prev.service_ids.includes(id)) {
                return { ...prev, service_ids: prev.service_ids.filter(s => s !== id) };
            } else {
                return { ...prev, service_ids: [...prev.service_ids, id] };
            }
        });
    };

    // --- RENDERERS ---

    const renderDashboard = () => (
        <div className="space-y-6 animate-fade-in px-5">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-[#C19D6C]/10 text-[#C19D6C] flex items-center justify-center rounded-full mb-3">
                        <CheckCircle size={24} />
                    </div>
                    <span className="text-3xl font-black text-[#1A1A1A] leading-none mb-1">{dashboardData.jobs_completed || 0}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Completed</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-full mb-3">
                        <IndianRupee size={24} />
                    </div>
                    <span className="text-3xl font-black text-[#1A1A1A] leading-none mb-1">{parseFloat(dashboardData.today_earnings || 0).toFixed(0)}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Earnings</span>
                </div>
            </div>

            {/* In Progress Job (Timer View) */}
            {dashboardData.queue?.find(b => b.status === 'IN_PROGRESS') && (
                <div className="bg-white p-5 rounded-3xl shadow-lg border-2 border-green-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                        Active Job
                    </div>

                    {(() => {
                        const activeJob = dashboardData.queue.find(b => b.status === 'IN_PROGRESS');
                        const duration = activeJob.items?.reduce((acc, item) => acc + (item.service?.duration_minutes || 30), 0) || 30;

                        return (
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-[#C19D6C] font-bold text-sm uppercase shadow-inner">
                                        {(() => { const name = activeJob.is_walk_in ? activeJob.guest_name : activeJob.customer_details?.username; return name ? name[0].toUpperCase() : <User size={16} />; })()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1A1A1A]">{activeJob.is_walk_in ? (activeJob.guest_name || 'Walk-in Guest') : (activeJob.customer_details?.username || 'Online Customer')}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{activeJob.items?.map(i => i.service?.name).join(', ') || 'Service'}</p>
                                    </div>
                                </div>

                                <TimerCircle
                                    startTime={activeJob.actual_start_time || new Date()}
                                    durationMinutes={duration}
                                />

                                <button
                                    onClick={() => handleFinishJob(activeJob.id)}
                                    className="w-full bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-2"
                                >
                                    <Check size={18} /> Finish Service & Collect
                                </button>
                            </>
                        )
                    })()}
                </div>
            )}

            {/* Queue List */}
            <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                            <Calendar size={18} className="text-[#C19D6C]" /> Today's Queue
                        </h2>
                        <span className="text-xs font-bold text-[#1A1A1A] bg-gray-200 px-2 py-1 rounded-md">{dashboardData.queue?.filter(b => b.status !== 'IN_PROGRESS').length || 0} Up Next</span>
                    </div>
                    <button
                        onClick={() => setShowWalkInModal(true)}
                        className="w-full md:w-auto bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 transition-all"
                    >
                        <Plus size={16} /> New Walk-in
                    </button>
                </div>

                <div className="space-y-4">
                    {dashboardData.queue?.filter(b => b.status !== 'IN_PROGRESS').length > 0 ? (
                        dashboardData.queue.filter(b => b.status !== 'IN_PROGRESS').map((booking, index) => (
                            <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#C19D6C]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 relative">
                                            <Clock size={18} className="text-[#1A1A1A]" />
                                            {/* Source Indicator dot */}
                                            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${booking.is_walk_in ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-black text-[#1A1A1A] block">{booking.booking_time}</span>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${booking.is_walk_in ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {booking.is_walk_in ? 'Walk-in' : 'Online'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Token #{booking.token_number}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex items-center gap-4">
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-[#1A1A1A] text-sm md:text-base">{booking.is_walk_in ? (booking.guest_name || 'Walk-in Guest') : (booking.customer_details?.username || 'Online Customer')}</h4>
                                        <p className="text-xs text-gray-500 font-medium truncate">{booking.items?.map(i => i.service?.name).join(', ') || 'Assigned Service'}</p>
                                    </div>

                                    {(() => {
                                        // 15-minute buffer: allow start only within 15 mins before booking_time
                                        const now = new Date();
                                        const [h, m, s] = (booking.booking_time || '00:00:00').split(':').map(Number);
                                        const bookingDt = new Date(booking.booking_date);
                                        bookingDt.setHours(h, m, s || 0, 0);
                                        const earliest = new Date(bookingDt.getTime() - 15 * 60 * 1000);
                                        const tooEarly = now < earliest;
                                        const minsLeft = Math.ceil((earliest - now) / 60000);

                                        return (
                                            <div className="flex flex-col items-end gap-1">
                                                <button
                                                    onClick={() => !tooEarly && handleStartJob(booking.id)}
                                                    disabled={tooEarly}
                                                    className={`h-10 px-4 rounded-xl flex items-center justify-center font-bold text-sm shadow-md whitespace-nowrap gap-1.5 transition-colors ${tooEarly
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-[#C19D6C] text-white hover:bg-[#a6865c] active:scale-95'
                                                        }`}
                                                >
                                                    <Play size={14} fill="currentColor" /> {tooEarly ? `Wait ${minsLeft}m` : 'Start'}
                                                </button>
                                                {tooEarly && (
                                                    <span className="text-[9px] text-gray-400 font-medium">Opens 15 min before slot</span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white py-12 px-6 rounded-3xl shadow-sm border border-gray-100 border-dashed text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Smartphone size={32} className="text-gray-300" />
                            </div>
                            <p className="font-bold text-[#1A1A1A] text-lg">Queue is Empty</p>
                            <p className="text-sm text-gray-400 mt-1 max-w-[200px] leading-relaxed">Relax or toggle your availability.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6 animate-fade-in px-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Date</label>
                <input
                    type="date"
                    value={analyticsDate}
                    onChange={(e) => setAnalyticsDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] text-sm rounded-xl focus:ring-[#C19D6C] focus:border-[#C19D6C] block p-3 font-medium outline-none"
                />
            </div>

            {analytics ? (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-gray-800 p-6 rounded-3xl shadow-lg border border-gray-700 text-white flex items-center justify-between">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Earnings</span>
                                <h3 className="text-4xl font-black mt-1">₹{analytics.total_earnings || 0}</h3>
                            </div>
                            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                                <IndianRupee size={28} className="text-[#C19D6C]" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <span className="text-2xl font-black text-[#1A1A1A] block">{analytics.completed_jobs || 0}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Completed</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <span className="text-2xl font-black text-[#1A1A1A] block">{analytics.total_bookings || 0}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Booked</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-[#1A1A1A] mb-4 text-sm">Traffic Source</h4>
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-center">
                                <div className="text-2xl font-black text-blue-600">{analytics.online || 0}</div>
                                <span className="text-[10px] uppercase font-bold text-gray-400">Online</span>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-orange-500">{analytics.walk_ins || 0}</div>
                                <span className="text-[10px] uppercase font-bold text-gray-400">Walk-ins</span>
                            </div>
                        </div>
                        {/* Simple Bar */}
                        <div className="w-full h-3 bg-gray-100 rounded-full mt-4 flex overflow-hidden">
                            <div style={{ width: `${(analytics.online / Math.max(1, analytics.total_bookings)) * 100}%` }} className="bg-blue-500 h-full"></div>
                            <div style={{ width: `${(analytics.walk_ins / Math.max(1, analytics.total_bookings)) * 100}%` }} className="bg-orange-400 h-full"></div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-10 text-gray-400">Loading metrics...</div>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-6 animate-fade-in px-5">
            {profile && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-[#C19D6C]/20 to-transparent"></div>
                    <div className="w-20 h-20 bg-[#1A1A1A] mx-auto rounded-full flex items-center justify-center text-3xl font-black text-[#C19D6C] shadow-lg relative z-10 border-4 border-white">
                        {profile.username ? profile.username[0].toUpperCase() : 'E'}
                    </div>
                    <h2 className="text-xl font-black text-[#1A1A1A] mt-4">{profile.username}</h2>
                    <p className="text-sm font-bold text-gray-500 md:text-[#C19D6C] mt-1">{profile.job_title}</p>

                    <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-[#1A1A1A] font-black text-lg"><Star size={16} className="text-yellow-500" fill="currentColor" /> {profile.rating}</div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Rating</span>
                        </div>
                        <div className="text-center">
                            <div className="text-[#1A1A1A] font-black text-lg text-center">{profile.years_of_experience}Y</div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Experience</span>
                        </div>
                        <div className="text-center">
                            <div className="text-[#1A1A1A] font-black text-lg text-center">{profile.commission_rate}%</div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Commission</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <div>
                <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2"><Star size={18} className="text-[#C19D6C]" /> Recent Reviews</h3>
                <div className="space-y-3">
                    {reviews.length > 0 ? reviews.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm text-[#1A1A1A]">{r.customer_name}</span>
                                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 rounded-md">{r.rating} ★</span>
                            </div>
                            <p className="text-xs text-gray-500 italic">"{r.comment}"</p>
                        </div>
                    )) : <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl">No reviews yet.</p>}
                </div>
            </div>

            {/* Attendance Section */}
            <div>
                <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2"><Navigation size={18} className="text-[#C19D6C]" /> Recent Punches</h3>
                <div className="space-y-3 mb-10">
                    {attendance.length > 0 ? attendance.slice(0, 5).map(a => (
                        <div key={a.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <span className="font-bold text-sm text-[#1A1A1A] block">{a.date}</span>
                                {a.is_late && <span className="text-[10px] text-red-500 font-bold uppercase">Late Arrival</span>}
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-gray-500 block">In: {a.check_in.substring(0, 5)}</span>
                                <span className="text-xs font-bold text-gray-500">Out: {a.check_out ? a.check_out.substring(0, 5) : '--'}</span>
                            </div>
                        </div>
                    )) : <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl">No recent attendance records.</p>}
                </div>
            </div>
        </div>
    );

    const renderInbox = () => (
        <div className="space-y-4 animate-fade-in px-5 mb-10">
            {notifications.length > 0 ? notifications.map(n => (
                <div key={n.id} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${n.is_read ? 'border-gray-200 opacity-70' : 'border-[#C19D6C]'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${n.is_read ? 'bg-gray-100' : 'bg-[#C19D6C]/10 text-[#C19D6C]'}`}>
                            <Bell size={16} />
                        </div>
                        <div className="flex-grow">
                            <p className={`text-sm ${n.is_read ? 'text-gray-500 font-medium' : 'text-[#1A1A1A] font-bold'}`}>{n.message}</p>
                            <span className="text-[10px] text-gray-400 font-bold mt-2 block">{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                    <Bell size={40} className="text-gray-200 mb-4" />
                    <p className="font-medium text-sm">No new notifications</p>
                </div>
            )}
        </div>
    );

    const renderWalkInModal = () => (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up md:mt-0 mt-auto mb-10">
                <div className="p-5 md:p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl shrink-0">
                    <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
                        <Plus size={24} className="text-[#C19D6C]" /> Walk-In Ticket
                    </h2>
                    <button onClick={() => setShowWalkInModal(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
                </div>

                <form onSubmit={handleCreateWalkIn} className="p-4 md:p-6 overflow-y-auto w-full space-y-5">

                    <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Guest Details</h3>
                        <input
                            type="text"
                            placeholder="Guest Name (Optional)"
                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#C19D6C] text-sm font-medium"
                            value={walkInForm.guest_name}
                            onChange={e => setWalkInForm({ ...walkInForm, guest_name: e.target.value })}
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number (Optional)"
                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#C19D6C] text-sm font-medium"
                            value={walkInForm.guest_phone}
                            onChange={e => setWalkInForm({ ...walkInForm, guest_phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Select Services *</h3>
                            <span className="text-[10px] font-bold text-[#C19D6C] bg-[#C19D6C]/10 px-2 py-0.5 rounded-md">
                                {walkInForm.service_ids.length} Selected
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {servicesList.length > 0 ? servicesList.map(srv => (
                                <button
                                    type="button"
                                    key={srv.id}
                                    onClick={() => toggleServiceSelection(srv.id)}
                                    className={`flex justify-between items-center p-3 rounded-xl border text-left transition-all ${walkInForm.service_ids.includes(srv.id)
                                        ? 'border-[#C19D6C] bg-[#C19D6C]/5 shadow-sm'
                                        : 'border-gray-100 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${walkInForm.service_ids.includes(srv.id) ? 'bg-[#C19D6C] border-[#C19D6C]' : 'border-gray-300 bg-white'
                                            }`}>
                                            {walkInForm.service_ids.includes(srv.id) && <Check size={12} strokeWidth={4} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[#1A1A1A]">{srv.name}</p>
                                            <p className="text-[10px] font-medium text-gray-400">{srv.duration_minutes} Mins</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-[#1A1A1A]">₹{srv.price}</span>
                                </button>
                            )) : (
                                <p className="text-xs text-center p-4 text-gray-500 bg-gray-50 rounded-xl border border-dashed">No services available</p>
                            )}
                        </div>
                    </div>

                    {/* Pre-calculated Total */}
                    <div className="flex justify-between items-center bg-[#1A1A1A] text-white p-4 rounded-2xl shadow-lg mt-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Price</span>
                        <span className="text-2xl font-black text-[#C19D6C]">
                            ₹{walkInForm.service_ids.reduce((total, id) => {
                                const s = servicesList.find(srv => srv.id === id);
                                return total + (s ? parseFloat(s.price) : 0);
                            }, 0)}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || walkInForm.service_ids.length === 0}
                        className="w-full py-4 bg-[#C19D6C] text-white rounded-xl font-black text-sm uppercase tracking-wide hover:bg-[#a6865c] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? "Creating..." : "Create Walk-in Booking"}
                    </button>
                </form>
            </div>
        </div>
    );

    const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api/v1', '');

    const renderWallet = () => (
        <div className="space-y-6 animate-fade-in px-5">
            {/* Pending Balance Card */}
            <div className="bg-[#1A1A1A] p-6 rounded-3xl text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><IndianRupee size={80} /></div>
                <div className="relative z-10">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Pending Balance</p>
                    <h2 className="text-4xl font-black text-[#C19D6C]">₹{parseFloat(profile?.pending_wallet_balance || 0).toLocaleString()}</h2>
                    <p className="text-white/40 text-[10px] mt-2 font-bold">Commission Rate: {profile?.commission_percentage || 50}%</p>
                </div>
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-sm text-[#1A1A1A]">Payout History</h3>
                </div>
                {payouts.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {payouts.map((p, i) => (
                            <div key={p.id} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">₹{parseFloat(p.amount_paid).toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                {p.screenshot ? (
                                    <a
                                        href={`${MEDIA_BASE}${p.screenshot}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg"
                                    >
                                        <ExternalLink size={12} /> Receipt
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-300">No receipt</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <Wallet size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-xs font-medium">No payouts recorded yet</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium">Booting Portal...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans selection:bg-[#C19D6C] selection:text-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#1A1A1A] text-white pt-10 pb-5 px-6 rounded-b-3xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-[#C19D6C] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Stylist Portal</p>
                        <h1 className="text-xl font-black">{user?.username || 'Employee'}</h1>
                    </div>
                    <button onClick={() => { logout(); navigate('/login'); }} className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <LogOut size={16} className="text-white" />
                    </button>
                </div>
            </div>

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'wallet' && renderWallet()}
            {activeTab === 'inbox' && renderInbox()}

            {/* Modals */}
            {showWalkInModal && renderWalkInModal()}

            {/* Sticky Bottom Navigation (Mobile SaaS Feel) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-safe z-50">
                <div className="flex justify-around items-center px-4 py-3">
                    <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'dashboard' ? 'text-[#C19D6C]' : 'text-gray-400'}`}>
                        <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'analytics' ? 'text-[#C19D6C]' : 'text-gray-400'}`}>
                        <BarChart2 size={22} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Analytics</span>
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-[#C19D6C]' : 'text-gray-400'}`}>
                        <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
                    </button>
                    <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'wallet' ? 'text-[#C19D6C]' : 'text-gray-400'}`}>
                        <Wallet size={22} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Wallet</span>
                    </button>
                    <button onClick={() => setActiveTab('inbox')} className={`flex flex-col items-center gap-1 p-2 relative ${activeTab === 'inbox' ? 'text-[#C19D6C]' : 'text-gray-400'}`}>
                        <div className="relative">
                            <Bell size={22} strokeWidth={activeTab === 'inbox' ? 2.5 : 2} />
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Inbox</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;