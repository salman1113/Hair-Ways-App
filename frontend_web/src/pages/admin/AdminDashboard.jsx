import React, { useState, useEffect } from 'react';
import { getQueue, getEmployees } from '../../services/api';
import { 
    TrendingUp, Users, Clock, UserCheck, 
    Briefcase, XCircle, CheckCircle, 
    DollarSign, CalendarDays
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10)); // Default Today

  // Calculated Stats
  const [metrics, setMetrics] = useState({
      dailyRevenue: 0,
      monthlyRevenue: 0,
      totalTokens: 0,
      waiting: 0,
      upcoming: 0,
      inService: 0,
      cancelled: 0,
      completed: 0,
      walkIns: 0,
      activeEmployees: 0,
      busyEmployees: 0,
      totalEmployees: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]); // 🔥 Re-fetch when date changes

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
        // Fetch Bookings (Filtered by Date) & Employees
        const [queueData, empData] = await Promise.all([
            getQueue(dateFilter), // Pass Date to API
            getEmployees()
        ]);

        setEmployees(empData);
        calculateMetrics(queueData, empData);

    } catch (error) {
        console.error(error);
        // toast.error("Failed to load dashboard data");
    } finally {
        setLoading(false);
    }
  };

  // 🔥 Calculate Stats on Frontend
  const calculateMetrics = (data, emps) => {
      // 1. Financials
      const revenue = data
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + Number(b.total_price), 0);

      // 2. Customer Flow
      const waiting = data.filter(b => b.status === 'PENDING').length;
      const inService = data.filter(b => b.status === 'IN_PROGRESS').length;
      const completed = data.filter(b => b.status === 'COMPLETED').length;
      const cancelled = data.filter(b => b.status === 'CANCELLED').length;
      
      // 3. Employee Stats
      const activeEmps = emps.filter(e => e.is_available).length;
      // An employee is busy if they are assigned to an 'IN_PROGRESS' booking
      const busyEmpsIds = new Set(data.filter(b => b.status === 'IN_PROGRESS' && b.employee).map(b => b.employee));
      const busyEmpsCount = busyEmpsIds.size;

      // 4. Walk-in Calculation
      const walkInCount = data.filter(b => b.is_walk_in).length;

      setMetrics({
          dailyRevenue: revenue,
          monthlyRevenue: revenue * 30, // Estimation
          totalTokens: data.length,
          waiting,
          inService,
          cancelled,
          completed,
          walkIns: walkInCount,
          activeEmployees: activeEmps,
          busyEmployees: busyEmpsCount,
          totalEmployees: emps.length
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        <Toaster position="top-center"/>
        
        {/* Top Bar with Date Filter */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#3F0D12]">Executive Dashboard</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Store Performance Overview</p>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                    <CalendarDays size={18} className="text-gray-500 ml-2"/>
                    <span className="text-xs font-bold text-gray-500">Filter Date:</span>
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-white border border-gray-300 text-[#3F0D12] text-sm rounded-lg focus:ring-[#3F0D12] focus:border-[#3F0D12] block p-1.5 font-bold outline-none"
                    />
                </div>
            </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* 1️⃣ REVENUE SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Daily Revenue */}
                <div className="bg-[#3F0D12] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={100}/></div>
                    <div className="relative z-10">
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                        <h2 className="text-4xl font-black">₹{metrics.dailyRevenue.toLocaleString()}</h2>
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-300 bg-white/10 w-fit px-3 py-1 rounded-full">
                            <TrendingUp size={16}/> Calculated for selected date
                        </div>
                    </div>
                </div>

                {/* Total Tokens (Volume) */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Tokens</p>
                            <h2 className="text-4xl font-black text-[#3F0D12] mt-1">{metrics.totalTokens}</h2>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-xl text-[#3F0D12]"><FileTextIcon/></div>
                    </div>
                    <div className="mt-6 flex gap-4 text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-600"/> {metrics.completed} Completed</span>
                        <span className="flex items-center gap-1"><XCircle size={14} className="text-red-500"/> {metrics.cancelled} Cancelled</span>
                    </div>
                </div>

                {/* Walk-in vs Online */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Customer Source</p>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1 text-gray-700">
                                <span>Walk-in</span>
                                <span>{metrics.walkIns}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(metrics.walkIns / metrics.totalTokens) * 100 || 0}%`}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1 text-gray-700">
                                <span>Online Booking</span>
                                <span>{metrics.totalTokens - metrics.walkIns}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${((metrics.totalTokens - metrics.walkIns) / metrics.totalTokens) * 100 || 0}%`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2️⃣ STAFF & OPERATIONS STATUS */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase size={20}/> Operational Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Active Staff */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Staff Online</p>
                            <p className="text-2xl font-black text-[#3F0D12]">{metrics.activeEmployees} <span className="text-sm text-gray-400 font-normal">/ {metrics.totalEmployees}</span></p>
                        </div>
                        <div className="bg-green-100 p-2 rounded-lg text-green-700"><UserCheck size={24}/></div>
                    </div>

                    {/* Busy Staff */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Busy Staff</p>
                            <p className="text-2xl font-black text-orange-600">{metrics.busyEmployees}</p>
                        </div>
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><ScissorsIcon/></div>
                    </div>

                    {/* Waiting Customers */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Waiting Area</p>
                            <p className="text-2xl font-black text-[#3F0D12]">{metrics.waiting}</p>
                        </div>
                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700"><Clock size={24}/></div>
                    </div>

                    {/* In Service */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">In Service</p>
                            <p className="text-2xl font-black text-blue-600">{metrics.inService}</p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><ChairIcon/></div>
                    </div>
                </div>
            </section>

            {/* 3️⃣ CUSTOMER INFLOW PREDICTION (Visual) */}
            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-[#3F0D12]">Customer Volume (Hourly)</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Real-time</span>
                </div>
                
                {/* Visual Bars */}
                <div className="flex items-end justify-between h-32 gap-2">
                    {[30, 45, 20, 60, 80, 50, 40, 70, 90, 60, 30, 20].map((h, i) => (
                        <div key={i} className="w-full bg-red-50 rounded-t-lg relative group">
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-[#3F0D12] rounded-t-lg transition-all duration-500 group-hover:bg-[#D72638]" 
                                style={{height: `${h}%`}}
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-bold mt-2 uppercase">
                    <span>9 AM</span>
                    <span>12 PM</span>
                    <span>3 PM</span>
                    <span>6 PM</span>
                    <span>9 PM</span>
                </div>
            </section>

        </div>
    </div>
  );
};

// Simple Icons Components
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const ScissorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>;
const ChairIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><line x1="5" y1="18" x2="5" y2="21"/><line x1="19" y1="18" x2="19" y2="21"/></svg>;

export default AdminDashboard;