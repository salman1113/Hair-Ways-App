import React, { useState, useEffect, useMemo } from 'react';
import { getQueue, updateBookingStatus, getEmployees } from '../../services/api';
import {
    Calendar, Search, X, CheckCircle,
    PlayCircle, XCircle, FileText, User, Clock, ChevronRight, UserCheck, Loader2,
    Hash, AlertCircle, IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';
import useWebSocketNotification from '../../hooks/useWebSocketNotification';
import { SkeletonTable } from '../../components/SkeletonRow';


const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date Filter (Default: Today)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Assign Stylist State
    const [employees, setEmployees] = useState([]);
    const [assignEmployeeId, setAssignEmployeeId] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchBookings();
        fetchEmployees();
    }, [selectedDate]);

    // WEBSOCKET AUTO-REFRESH
    useWebSocketNotification(() => {
        fetchBookings();
    });

    // Frontend Filtering Logic
    useEffect(() => {
        let result = bookings;

        if (statusFilter !== 'ALL') {
            result = result.filter(b => b.status === statusFilter);
        }

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase().trim();
            result = result.filter(b => {
                const customerName = b.is_walk_in
                    ? (b.guest_name || '')
                    : (b.customer_details?.username || '');
                const employeeName = b.employee_details?.user_details?.username || '';
                const serviceNames = b.items?.map(i => i.service_name).join(' ') || '';
                const phone = b.phone_number || b.guest_phone || '';
                const bookingType = b.is_walk_in ? 'walk-in walkin walk in' : 'online';
                const token = b.token_number || '';
                const time = b.booking_time || '';

                const searchableText = [
                    token, customerName, employeeName,
                    serviceNames, phone, bookingType, time
                ].join(' ').toLowerCase();

                return searchableText.includes(lowerQ);
            });
        }
        setFilteredBookings(result);
    }, [bookings, statusFilter, searchQuery]);

    // ═══════════════════════════════════════════════════════
    // 3. QUICK STATS — Computed from filtered bookings
    // ═══════════════════════════════════════════════════════
    const stats = useMemo(() => ({
        total: filteredBookings.length,
        pending: filteredBookings.filter(b => b.status === 'PENDING').length,
        revenue: filteredBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0),
    }), [filteredBookings]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await getQueue(selectedDate);
            setBookings(data);
            setFilteredBookings(data);
        } catch (error) {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (!window.confirm(`Mark this booking as ${newStatus}?`)) return;

        const toastId = toast.loading("Updating...");
        try {
            await updateBookingStatus(id, { status: newStatus });
            toast.success("Status Updated", { id: toastId });
            setSelectedBooking(null);
            fetchBookings();
        } catch (error) {
            toast.error("Update Failed", { id: toastId });
        }
    };

    // ASSIGN STYLIST
    const handleAssignStylist = async () => {
        if (!assignEmployeeId || !selectedBooking) return;
        setAssigning(true);
        const toastId = toast.loading("Assigning stylist...");
        try {
            await updateBookingStatus(selectedBooking.id, { employee: parseInt(assignEmployeeId) });
            toast.success("Stylist Assigned!", { id: toastId });
            setAssignEmployeeId('');
            fetchBookings();
            const updatedBookings = await getQueue(selectedDate);
            const updated = updatedBookings.find(b => b.id === selectedBooking.id);
            if (updated) setSelectedBooking(updated);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to assign stylist", { id: toastId });
        } finally {
            setAssigning(false);
        }
    };

    // STATUS COLORS — Including CONFIRMED
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CONFIRMED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-200 line-through';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    // 2. CUSTOMER AVATAR — Gold initials
    const getCustomerName = (b) => b.is_walk_in ? (b.guest_name || 'Walk-in') : (b.customer_details?.username || 'Online');
    const getInitial = (name) => (name || '?')[0].toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50/80 pb-10">

            {/* ─── Header ─── */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">Bookings</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Manage tokens & appointments</p>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full md:w-auto">
                    <Calendar size={16} className="text-gray-400" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-sm text-black font-medium outline-none cursor-pointer flex-1"
                    />
                    {selectedDate && (
                        <button
                            onClick={() => setSelectedDate('')}
                            className="text-[10px] font-semibold text-gray-400 hover:text-black underline whitespace-nowrap"
                        >
                            Show All
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6 space-y-6">

                {/* ═══════════════════════════════════════════ */}
                {/* 3. QUICK STATS RIBBON                      */}
                {/* ═══════════════════════════════════════════ */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-[#C19D6C]/10 text-[#C19D6C] rounded-lg flex items-center justify-center shrink-0">
                            <Hash size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-black leading-none">{stats.total}</p>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Total Bookings</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                            <AlertCircle size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600 leading-none">{stats.pending}</p>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Pending Action</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                            <IndianRupee size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600 leading-none">₹{stats.revenue.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Revenue Today</p>
                        </div>
                    </div>
                </div>

                {/* ─── Filters ─── */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by token, customer, stylist, service, phone..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#C19D6C] bg-white text-sm transition-colors"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                        {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border snap-start shrink-0
                            ${statusFilter === status ? 'bg-[#C19D6C] text-white border-[#C19D6C]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-black'}`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Booking Table ─── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
                    <div className="overflow-x-auto max-w-full pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                        <table className="w-full text-left text-sm min-w-[800px]">
                            <thead className="bg-gray-50 text-[10px] md:text-xs tracking-wider text-gray-400 uppercase border-b border-gray-100">
                                <tr>
                                    <th className="p-4 md:p-5 font-semibold">Token</th>
                                    <th className="p-4 md:p-5 font-semibold">Time</th>
                                    <th className="p-4 md:p-5 font-semibold">Customer</th>
                                    <th className="p-4 md:p-5 font-semibold">Stylist</th>
                                    <th className="p-4 md:p-5 font-semibold">Service</th>
                                    <th className="p-4 md:p-5 font-semibold">Status</th>
                                    <th className="p-4 md:p-5 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {/* Skeleton Loaders while loading */}
                                {loading ? (
                                    <SkeletonTable rows={5} cols={7} />
                                ) : filteredBookings.length === 0 ? (
                                    <tr><td colSpan="7" className="p-10 text-center text-gray-400 text-sm">No bookings found for this date.</td></tr>
                                ) : (
                                    filteredBookings.map((b) => {
                                        const name = getCustomerName(b);
                                        return (
                                            <tr key={b.id} className="hover:bg-gray-50/80 transition cursor-pointer" onClick={() => { setSelectedBooking(b); setAssignEmployeeId(b.employee || ''); }}>
                                                <td className="p-4 md:p-5">
                                                    <span className="font-bold text-black bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-sm">{b.token_number}</span>
                                                </td>
                                                <td className="p-4 md:p-5 font-medium text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={13} className="text-gray-400" /> {b.booking_time}
                                                    </div>
                                                </td>
                                                {/* 2. CUSTOMER AVATAR + Name */}
                                                <td className="p-4 md:p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-[#C19D6C]/20 text-[#C19D6C] rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                                            {getInitial(name)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold text-black">{name}</p>
                                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${b.is_walk_in ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {b.is_walk_in ? 'Walk-in' : 'Online'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-0.5">{b.phone_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 md:p-5 text-gray-600 font-medium">{b.employee_details?.user_details?.username || <span className="text-gray-300 italic">Unassigned</span>}</td>
                                                <td className="p-4 md:p-5">
                                                    <p className="font-medium text-gray-700 truncate max-w-[150px]">
                                                        {b.items.map(i => i.service_name).join(', ')}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-semibold tracking-wider mt-0.5">₹{b.total_price}</p>
                                                </td>
                                                <td className="p-4 md:p-5">
                                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${getStatusColor(b.status)}`}>
                                                        {b.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 md:p-5 text-center">
                                                    <button className="text-[#C19D6C] hover:bg-[#C19D6C]/10 p-2.5 rounded-lg transition border border-[#C19D6C]/30 hover:border-[#C19D6C]">
                                                        <ChevronRight size={16} strokeWidth={2.5} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* 4. GLASSMORPHISM MODAL                         */}
            {/* ═══════════════════════════════════════════════ */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-end md:items-center justify-center z-[100] p-0 md:p-4">
                    <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col max-h-[90vh] relative animate-fade-in-up">

                        {/* Modal Header */}
                        <div className="bg-[#1A1A1A] p-5 md:p-6 text-white flex justify-between items-start shrink-0 rounded-t-2xl">
                            <div>
                                <p className="text-[10px] font-medium text-[#C19D6C] uppercase tracking-widest">Token Number</p>
                                <h2 className="text-3xl md:text-4xl font-bold mt-1">{selectedBooking.token_number}</h2>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        <div className="p-5 md:p-6 overflow-y-auto w-full">

                            {/* Status Bar */}
                            <div className={`p-4 rounded-xl flex justify-between items-center mb-6 border ${getStatusColor(selectedBooking.status)}`}>
                                <span className="font-semibold text-sm uppercase flex items-center gap-2">
                                    <Clock size={16} /> Status
                                </span>
                                <span className="font-bold text-sm">{selectedBooking.status.replace('_', ' ')}</span>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2"><User size={14} /> Customer Details</h4>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-[#C19D6C]/20 text-[#C19D6C] rounded-full flex items-center justify-center text-base font-bold shrink-0">
                                            {getInitial(getCustomerName(selectedBooking))}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-lg text-black">{getCustomerName(selectedBooking)}</p>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${selectedBooking.is_walk_in ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {selectedBooking.is_walk_in ? 'Walk-in' : 'Online'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{selectedBooking.phone_number}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Date</p>
                                        <p className="font-bold text-black">{selectedBooking.booking_date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ASSIGN STYLIST */}
                            {['PENDING', 'CONFIRMED'].includes(selectedBooking.status) && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                        <UserCheck size={14} /> Assign Stylist
                                    </h4>
                                    <div className="flex gap-2">
                                        <select
                                            value={assignEmployeeId}
                                            onChange={(e) => setAssignEmployeeId(e.target.value)}
                                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-[#C19D6C] bg-white"
                                        >
                                            <option value="">Select Stylist...</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.user_details?.username || emp.username} {emp.is_available ? '● Online' : '○ Offline'}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAssignStylist}
                                            disabled={!assignEmployeeId || assigning}
                                            className="px-4 py-2.5 bg-[#C19D6C] text-white rounded-lg font-semibold text-sm hover:bg-[#a6865c] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                                        >
                                            {assigning ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                            Assign
                                        </button>
                                    </div>
                                    {selectedBooking.employee_details?.user_details?.username && (
                                        <p className="text-xs text-gray-400 mt-2 font-medium">
                                            Currently assigned: <span className="text-black font-semibold">{selectedBooking.employee_details.user_details.username}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Service List */}
                            <div className="mb-6">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2"><FileText size={14} /> Services</h4>
                                <div className="space-y-2">
                                    {selectedBooking.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm border-b border-dashed border-gray-200 pb-2">
                                            <span className="text-gray-700 font-medium">{item.service_name}</span>
                                            <span className="font-bold text-black">₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                                    <span className="font-semibold text-gray-500">Total Amount</span>
                                    <span className="text-2xl font-bold text-black">₹{selectedBooking.total_price}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-1 gap-3">
                                {['PENDING', 'CONFIRMED'].includes(selectedBooking.status) && (
                                    <button
                                        onClick={() => handleStatusChange(selectedBooking.id, 'IN_PROGRESS')}
                                        className="w-full py-3.5 bg-[#C19D6C] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#a6865c] transition"
                                    >
                                        <PlayCircle size={20} /> Start Service
                                    </button>
                                )}

                                {selectedBooking.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => handleStatusChange(selectedBooking.id, 'COMPLETED')}
                                        className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
                                    >
                                        <CheckCircle size={20} /> Mark Completed
                                    </button>
                                )}

                                {['PENDING', 'CONFIRMED'].includes(selectedBooking.status) && (
                                    <button
                                        onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED')}
                                        className="w-full py-3.5 bg-white border-2 border-red-200 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition"
                                    >
                                        <XCircle size={20} /> Cancel Booking
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminBookings;
