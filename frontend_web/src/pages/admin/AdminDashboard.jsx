import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminAnalytics } from '../../services/api';
import useWebSocketNotification from '../../hooks/useWebSocketNotification';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
    TrendingUp, Users, Clock, UserCheck,
    Scissors, XCircle, CheckCircle, Activity,
    IndianRupee, CalendarDays, BarChart3, Armchair, Hash, Globe, Footprints
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

    // WebSocket Auto-Refresh
    const { user } = useAuth();
    useWebSocketNotification('admin', user?.id, () => {
        fetchDashboardData();
    });

    // Safe Percentage Helper to prevent NaN
    const getSafePercentage = (part, total) => total > 0 ? (part / total) * 100 : 0;

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
    }, [dateFilter]);

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

    // Helper: Format numbers with Indian locale
    const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

    return (
        <div className="min-h-screen bg-gray-50/80 pb-12">

            {/* ─── Page Header with Date Filter (NO sticky/fixed/z-index) ─── */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">Dashboard</h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Store performance overview</p>
                    </div>

                    <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <CalendarDays size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-transparent text-sm text-black font-medium outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto space-y-8">

                {/* ═══════════════════════════════════════════ */}
                {/* 1. KPI CARDS — Top Metrics Grid             */}
                {/* ═══════════════════════════════════════════ */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-32 animate-pulse flex flex-col justify-between">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))
                    ) : (
                        <>
                            {/* Daily Revenue */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</p>
                                        <h2 className="text-2xl md:text-3xl font-bold text-black mt-1.5">{formatCurrency(analytics.revenue.daily)}</h2>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <IndianRupee size={20} strokeWidth={2} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                    <TrendingUp size={14} />
                                    <span>For selected date</span>
                                </div>
                            </div>

                            {/* Total Tokens */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Tokens</p>
                                        <h2 className="text-2xl md:text-3xl font-bold text-black mt-1.5">{analytics.metrics.total_tokens}</h2>
                                    </div>
                                    <div className="bg-[#C19D6C]/10 p-2.5 rounded-lg text-[#C19D6C] group-hover:bg-[#C19D6C]/20 transition-colors">
                                        <Hash size={20} strokeWidth={2} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-3 text-xs font-medium">
                                    <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={13} /> {analytics.customer_flow.completed}</span>
                                    <span className="flex items-center gap-1 text-red-500"><XCircle size={13} /> {analytics.customer_flow.cancelled}</span>
                                </div>
                            </div>

                            {/* Staff Online */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Staff Online</p>
                                        <h2 className="text-2xl md:text-3xl font-bold text-black mt-1.5">
                                            {analytics.staff_status.active}
                                            <span className="text-base text-gray-300 font-normal ml-1">/ {analytics.staff_status.total}</span>
                                        </h2>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <UserCheck size={20} strokeWidth={2} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                    <Scissors size={13} />
                                    <span>{analytics.staff_status.busy} currently busy</span>
                                </div>
                            </div>

                            {/* Customer Flow — Waiting & In Service */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Queue</p>
                                        <h2 className="text-2xl md:text-3xl font-bold text-black mt-1.5">
                                            {analytics.customer_flow.pending + analytics.customer_flow.in_progress}
                                        </h2>
                                    </div>
                                    <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors">
                                        <Activity size={20} strokeWidth={2} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-3 text-xs font-medium">
                                    <span className="flex items-center gap-1 text-amber-600"><Clock size={13} /> {analytics.customer_flow.pending} waiting</span>
                                    <span className="flex items-center gap-1 text-blue-600"><Armchair size={13} /> {analytics.customer_flow.in_progress} in chair</span>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* 2. CUSTOMER SOURCE — Walk-in vs Online      */}
                {/* ═══════════════════════════════════════════ */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                            <BarChart3 size={16} className="text-gray-400" />
                            Customer Source
                        </h3>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                            {analytics.metrics.total_tokens} total
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Walk-in */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#C19D6C]"></div>
                                    <span className="text-sm font-medium text-gray-700">Walk-in</span>
                                </div>
                                <span className="text-sm font-bold text-black">{analytics.source.walk_ins}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                <div
                                    className="bg-[#C19D6C] h-2 rounded-full transition-all duration-700"
                                    style={{ width: `${getSafePercentage(analytics.source.walk_ins, analytics.metrics.total_tokens)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Online */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-medium text-gray-700">Online Booking</span>
                                </div>
                                <span className="text-sm font-bold text-black">{analytics.source.online}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                                    style={{ width: `${getSafePercentage(analytics.source.online, analytics.metrics.total_tokens)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* 3. EMPLOYEE PERFORMANCE LEADERBOARD         */}
                {/* ═══════════════════════════════════════════ */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                        <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            Employee Performance
                        </h3>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                            Sorted by Revenue
                        </span>
                    </div>

                    {analytics.leaderboard.length > 0 ? (
                        <div className="space-y-4">
                            {(() => {
                                const maxWork = Math.max(...analytics.leaderboard.map(e => e.total_work), 1);
                                return analytics.leaderboard.map((emp, i) => {
                                    const widthPct = (emp.total_work / maxWork) * 100;
                                    // Medal colors for top 3
                                    const rankStyles = i === 0
                                        ? 'bg-black text-white'
                                        : i === 1
                                            ? 'bg-gray-700 text-white'
                                            : i === 2
                                                ? 'bg-gray-400 text-white'
                                                : 'bg-gray-100 text-gray-500';
                                    // Bar colors — luxury
                                    const barColor = i === 0
                                        ? 'bg-[#C19D6C]'
                                        : i === 1
                                            ? 'bg-emerald-500'
                                            : 'bg-gray-300';

                                    return (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className={`w-7 h-7 min-w-[28px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${rankStyles}`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between text-sm mb-1.5">
                                                    <span className="font-medium text-gray-800 truncate">{emp.employee}</span>
                                                    <span className="font-bold text-black whitespace-nowrap ml-2">{formatCurrency(emp.total_work)}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all duration-700 ${barColor}`}
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
                        <div className="text-center py-16 text-gray-300">
                            <Users size={36} className="mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-400">No completed jobs for this date</p>
                        </div>
                    )}
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* 4. HOURLY VOLUME CHART (RECHARTS)           */}
                {/* ═══════════════════════════════════════════ */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6 mb-8 mt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                        <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                            <Activity size={16} className="text-gray-400" />
                            Hourly Volume
                        </h3>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                            Bookings per hour
                        </span>
                    </div>

                    <div className="w-full h-[250px] md:h-[300px]">
                        {analytics.hourly_volume.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.hourly_volume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C19D6C" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#C19D6C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="hour"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        labelStyle={{ color: '#000', fontWeight: 'bold', marginBottom: '4px' }}
                                        itemStyle={{ color: '#C19D6C', fontWeight: 600 }}
                                        formatter={(value) => [`${value} Bookings`, 'Volume']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#C19D6C"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVolume)"
                                        activeDot={{ r: 6, fill: '#C19D6C', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <Activity size={36} className="mb-3" />
                                <p className="text-sm font-medium text-gray-400">No volume data for this date</p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AdminDashboard;