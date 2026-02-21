import React, { useState, useEffect } from 'react';
import { getQueue, updateBookingStatus, getEmployees } from '../../services/api';
import { 
    Calendar, Search, Filter, X, CheckCircle, 
    PlayCircle, XCircle, FileText, User, Clock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 Date Filter (Default: Today)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate]); // Re-fetch when date changes

  // Frontend Filtering Logic
  useEffect(() => {
    let result = bookings;

    if (statusFilter !== 'ALL') {
        result = result.filter(b => b.status === statusFilter);
    }

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        result = result.filter(b => 
            b.token_number.toLowerCase().includes(lowerQ) ||
            (b.customer_name && b.customer_name.toLowerCase().includes(lowerQ))
        );
    }
    setFilteredBookings(result);
  }, [bookings, statusFilter, searchQuery]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
        // 🔥 Fetch bookings for the SPECIFIC DATE
        const data = await getQueue(selectedDate);
        setBookings(data);
        setFilteredBookings(data);
    } catch (error) {
        toast.error("Failed to load bookings");
    } finally {
        setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
      if(!window.confirm(`Mark this booking as ${newStatus}?`)) return;
      
      const toastId = toast.loading("Updating...");
      try {
          await updateBookingStatus(id, { status: newStatus });
          toast.success("Status Updated", { id: toastId });
          setSelectedBooking(null);
          fetchBookings(); // Refresh list
      } catch (error) {
          toast.error("Update Failed", { id: toastId });
      }
  };

  // Helper: Status Badge Color
  const getStatusColor = (status) => {
      switch(status) {
          case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
          case 'CANCELLED': return 'bg-gray-100 text-gray-500 border-gray-200';
          default: return 'bg-gray-50 text-gray-600';
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
        <Toaster position="top-center"/>

        {/* --- HEADER SECTION --- */}
        <div className="bg-white border-b px-6 py-5 sticky top-0 z-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-serif font-bold text-[#3F0D12]">Booking Management</h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage Tokens & Appointments</p>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-xl border border-gray-200">
                <Calendar size={18} className="text-gray-500 ml-2"/>
                <span className="text-xs font-bold text-gray-500">Select Date:</span>
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border border-gray-300 text-[#3F0D12] text-sm rounded-lg font-bold p-1.5 outline-none focus:ring-2 focus:ring-[#3F0D12]"
                />
                {selectedDate && (
                    <button 
                        onClick={() => setSelectedDate('')}
                        className="ml-2 text-xs font-bold text-red-500 hover:text-red-700 underline"
                    >
                        Show All
                    </button>
                )}
            </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
            
            {/* --- FILTERS --- */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Search Token (e.g., T-10)..." 
                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#3F0D12] bg-white shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border
                            ${statusFilter === status ? 'bg-[#3F0D12] text-white border-[#3F0D12]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- BOOKING TABLE --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b">
                            <tr>
                                <th className="p-4">Token</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Stylist</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.length === 0 ? (
                                <tr><td colSpan="7" className="p-10 text-center text-gray-400">No bookings found for this date.</td></tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedBooking(b)}>
                                        <td className="p-4">
                                            <span className="font-black text-[#3F0D12] bg-red-50 px-3 py-1 rounded-lg">{b.token_number}</span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-600">{b.booking_time}</td>
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">{b.customer_name || b.guest_name}</p>
                                            <p className="text-xs text-gray-400">{b.phone_number}</p>
                                        </td>
                                        <td className="p-4 text-gray-600">{b.employee_details?.user_details?.username || <span className="text-gray-400 italic">Unassigned</span>}</td>
                                        <td className="p-4">
                                            <p className="font-medium text-gray-800 truncate max-w-[150px]">
                                                {b.items.map(i => i.service_name).join(', ')}
                                            </p>
                                            <p className="text-xs text-green-600 font-bold">₹{b.total_price}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(b.status)}`}>
                                                {b.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="text-[#3F0D12] hover:bg-gray-100 p-2 rounded-full font-bold text-xs border border-gray-200">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        {/* --- 🔥 DETAILED MODAL --- */}
        {selectedBooking && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-fade-in-up">
                    
                    {/* Modal Header */}
                    <div className="bg-[#3F0D12] p-6 text-white flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Token Number</p>
                            <h2 className="text-4xl font-black mt-1">{selectedBooking.token_number}</h2>
                        </div>
                        <button onClick={() => setSelectedBooking(null)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                            <X size={20} className="text-white"/>
                        </button>
                    </div>

                    <div className="p-6 max-h-[75vh] overflow-y-auto">
                        
                        {/* Status Bar */}
                        <div className={`p-4 rounded-xl flex justify-between items-center mb-6 border ${getStatusColor(selectedBooking.status)}`}>
                            <span className="font-bold text-sm uppercase flex items-center gap-2">
                                <Clock size={16}/> Status
                            </span>
                            <span className="font-black text-sm">{selectedBooking.status.replace('_', ' ')}</span>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Details</h4>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg text-[#3F0D12]">{selectedBooking.customer_name || selectedBooking.guest_name}</p>
                                    <p className="text-sm text-gray-500">{selectedBooking.phone_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Date</p>
                                    <p className="font-bold text-[#3F0D12]">{selectedBooking.booking_date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Service List */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FileText size={14}/> Services</h4>
                            <div className="space-y-2">
                                {selectedBooking.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-700 font-medium">{item.service_name}</span>
                                        <span className="font-bold text-[#3F0D12]">₹{item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                                <span className="font-bold text-gray-500">Total Amount</span>
                                <span className="text-2xl font-black text-[#D72638]">₹{selectedBooking.total_price}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 gap-3">
                            {selectedBooking.status === 'PENDING' && (
                                <button 
                                    onClick={() => handleStatusChange(selectedBooking.id, 'IN_PROGRESS')}
                                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                                >
                                    <PlayCircle size={20}/> Start Service
                                </button>
                            )}
                            
                            {selectedBooking.status === 'IN_PROGRESS' && (
                                <button 
                                    onClick={() => handleStatusChange(selectedBooking.id, 'COMPLETED')}
                                    className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition"
                                >
                                    <CheckCircle size={20}/> Mark Completed
                                </button>
                            )}

                            {['PENDING', 'CONFIRMED'].includes(selectedBooking.status) && (
                                <button 
                                    onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED')}
                                    className="w-full py-3.5 bg-white border-2 border-red-100 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition"
                                >
                                    <XCircle size={20}/> Cancel Booking
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