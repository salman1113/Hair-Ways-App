import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LogOut, Calendar, Clock, IndianRupee, User, CheckCircle, Smartphone,
    Home, BarChart2, Bell, Play, Check, Navigation, Star, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getEmployeeDashboard, updateEmployee, getEmployeeAnalytics,
    getMyEmployeeProfile, getEmployeeReviews, getEmployeeNotifications, getEmployeeAttendance,
    startJob, finishJob
} from '../../services/api';
import toast from 'react-hot-toast';

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

    const [isAvailable, setIsAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyticsDate, setAnalyticsDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (user) {
            const available = user.employee_profile?.is_available ?? user.is_available ?? false;
            setIsAvailable(available);
            fetchDashboardData();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'profile' && !profile) fetchProfileData();
        if (activeTab === 'inbox' && notifications.length === 0) fetchNotifications();
    }, [activeTab, analyticsDate]);

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
            toast.error("Failed to start job");
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
                                        {activeJob.customer_name ? activeJob.customer_name[0] : <User size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1A1A1A]">{activeJob.customer_name || 'Walk-in Customer'}</h4>
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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                        <Calendar size={18} className="text-[#C19D6C]" /> Today's Queue
                    </h2>
                    <span className="text-xs font-bold text-[#1A1A1A] bg-gray-200 px-2 py-1 rounded-md">{dashboardData.queue?.filter(b => b.status !== 'IN_PROGRESS').length || 0} Up Next</span>
                </div>

                <div className="space-y-4">
                    {dashboardData.queue?.filter(b => b.status !== 'IN_PROGRESS').length > 0 ? (
                        dashboardData.queue.filter(b => b.status !== 'IN_PROGRESS').map((booking, index) => (
                            <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#C19D6C]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                            <Clock size={18} className="text-[#1A1A1A]" />
                                        </div>
                                        <div>
                                            <span className="text-base font-black text-[#1A1A1A] block">{booking.booking_time}</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Token #{booking.token_number}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="border-t border-gray-100 pt-4 flex items-center gap-4">
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-[#1A1A1A] text-sm md:text-base">{booking.customer_name || 'Walk-in Customer'}</h4>
                                        <p className="text-xs text-gray-500 font-medium truncate">{booking.items?.map(i => i.service?.name).join(', ') || 'Assigned Service'}</p>
                                    </div>

                                    <button
                                        onClick={() => handleStartJob(booking.id)}
                                        className="h-10 px-4 rounded-xl bg-[#C19D6C] text-white flex items-center justify-center font-bold text-sm hover:bg-[#a6865c] transition-colors shadow-md active:scale-95 whitespace-nowrap gap-1.5"
                                    >
                                        <Play size={14} fill="currentColor" /> Start
                                    </button>
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

                {/* Availability Status Toggle */}
                <div className="bg-white/5 backdrop-blur-xl p-3 rounded-2xl flex items-center justify-between border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className="font-bold text-xs tracking-wide">{isAvailable ? 'Accepting Bookings' : 'Currently Offline'}</span>
                    </div>
                    <button
                        onClick={toggleAvailability}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isAvailable ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="pt-6">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'profile' && renderProfile()}
                {activeTab === 'inbox' && renderInbox()}
            </div>

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