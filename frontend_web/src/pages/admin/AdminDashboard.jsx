import React, { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../services/api';
import {
    TrendingUp, Users, Clock, UserCheck,
    Briefcase, XCircle, CheckCircle,
    DollarSign, CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10)); // Default Today

    // Data States injected directly from Backend API
    const [analytics, setAnalytics] = useState({
        revenue: { daily: 0, monthly: 0 },
        customer_flow: { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
        staff_status: { total: 0, active: 0, busy: 0 },
        source: { walk_ins: 0, online: 0 },
        metrics: { total_tokens: 0 },
        hourly_volume: [],
        leaderboard: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, [dateFilter]); // 🔥 Re-fetch when date changes

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const data = await getAdminAnalytics(dateFilter);
            setAnalytics({
                revenue: data.revenue || { daily: 0, monthly: 0 },
                customer_flow: data.customer_flow || { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
                staff_status: data.staff_status || { total: 0, active: 0, busy: 0 },
                source: data.source || { walk_ins: 0, online: 0 },
                metrics: data.metrics || { total_tokens: 0 },
                hourly_volume: data.hourly_volume || [],
                leaderboard: data.leaderboard || []
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dashboard analytics");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">

            {/* Top Bar with Date Filter */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-auto text-center md:text-left">
                        <h1 className="text-xl md:text-2xl font-serif font-bold text-[#3F0D12]">Executive Dashboard</h1>
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">Store Performance Overview</p>
                    </div>

                    <div className="w-full md:w-auto flex items-center justify-center md:justify-start gap-3 bg-gray-100 p-2 md:p-1.5 rounded-xl border border-gray-200">
                        <CalendarDays size={18} className="text-gray-500" />
                        <span className="text-xs font-bold text-gray-500">Filter Date:</span>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-white border border-gray-300 text-[#3F0D12] text-sm rounded-lg focus:ring-[#3F0D12] focus:border-[#3F0D12] p-1.5 font-bold outline-none w-full md:w-auto text-center"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto space-y-8">

                {/* 1️⃣ REVENUE SECTION */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Daily Revenue */}
                    <div className="bg-[#3F0D12] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={100} /></div>
                        <div className="relative z-10">
                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                            <h2 className="text-4xl font-black">₹{analytics.revenue.daily.toLocaleString()}</h2>
                            <div className="mt-4 flex items-center gap-2 text-sm text-green-300 bg-white/10 w-fit px-3 py-1 rounded-full">
                                <TrendingUp size={16} /> Calculated for selected date
                            </div>
                        </div>
                    </div>

                    {/* Total Tokens (Volume) */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Tokens</p>
                                <h2 className="text-4xl font-black text-[#3F0D12] mt-1">{analytics.metrics.total_tokens}</h2>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-xl text-[#3F0D12]"><FileTextIcon /></div>
                        </div>
                        <div className="mt-6 flex gap-4 text-xs font-bold text-gray-500">
                            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-600" /> {analytics.customer_flow.completed} Completed</span>
                            <span className="flex items-center gap-1"><XCircle size={14} className="text-red-500" /> {analytics.customer_flow.cancelled} Cancelled</span>
                        </div>
                    </div>

                    {/* Walk-in vs Online */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Customer Source</p>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-1 text-gray-700">
                                    <span>Walk-in</span>
                                    <span>{analytics.source.walk_ins}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(analytics.source.walk_ins / analytics.metrics.total_tokens) * 100 || 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-1 text-gray-700">
                                    <span>Online Booking</span>
                                    <span>{analytics.source.online}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(analytics.source.online / analytics.metrics.total_tokens) * 100 || 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2️⃣ STAFF & OPERATIONS STATUS */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Briefcase size={20} /> Operational Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Active Staff */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Staff Online</p>
                                <p className="text-2xl font-black text-[#3F0D12]">{analytics.staff_status.active} <span className="text-sm text-gray-400 font-normal">/ {analytics.staff_status.total}</span></p>
                            </div>
                            <div className="bg-green-100 p-2 rounded-lg text-green-700"><UserCheck size={24} /></div>
                        </div>

                        {/* Busy Staff */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Busy Staff</p>
                                <p className="text-2xl font-black text-orange-600">{analytics.staff_status.busy}</p>
                            </div>
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><ScissorsIcon /></div>
                        </div>

                        {/* Waiting Customers */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Waiting Area</p>
                                <p className="text-2xl font-black text-[#3F0D12]">{analytics.customer_flow.pending}</p>
                            </div>
                            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700"><Clock size={24} /></div>
                        </div>

                        {/* In Service */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">In Service</p>
                                <p className="text-2xl font-black text-blue-600">{analytics.customer_flow.in_progress}</p>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><ChairIcon /></div>
                        </div>
                    </div>
                </section>

                {/* 3️⃣ EMPLOYEE PERFORMANCE LEADERBOARD */}
                <section className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                        <h3 className="font-bold text-md md:text-lg text-[#3F0D12]">Employee Performance</h3>
                        <span className="bg-gray-100 text-gray-500 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Sorted by Revenue</span>
                    </div>

                    {analytics.leaderboard.length > 0 ? (
                        <div className="space-y-3">
                            {(() => {
                                const maxWork = Math.max(...analytics.leaderboard.map(e => e.total_work), 1);
                                return analytics.leaderboard.map((emp, i) => {
                                    const widthPct = (emp.total_work / maxWork) * 100;
                                    return (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className="w-7 h-7 bg-[#3F0D12] rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between text-sm font-bold mb-1">
                                                    <span className="text-gray-800 truncate">{emp.employee}</span>
                                                    <span className="text-[#3F0D12] font-black whitespace-nowrap">₹{emp.total_work.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full transition-all duration-700 ${i === 0 ? 'bg-gradient-to-r from-[#3F0D12] to-[#D72638]' :
                                                            i === 1 ? 'bg-gradient-to-r from-[#3F0D12] to-[#C19D6C]' :
                                                                'bg-[#3F0D12]/60'
                                                            }`}
                                                        style={{ width: `${widthPct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <Users size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="font-medium text-sm">No completed jobs for this date</p>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

// Simple Icons Components
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>;
const ScissorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>;
const ChairIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" /><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><line x1="5" y1="18" x2="5" y2="21" /><line x1="19" y1="18" x2="19" y2="21" /></svg>;

export default AdminDashboard;