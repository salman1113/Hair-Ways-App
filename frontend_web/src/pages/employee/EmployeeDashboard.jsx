import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FBE4E3] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-lg border border-[#EACCCC]">
            <div>
                <h1 className="text-3xl font-serif font-bold text-[#3F0D12]">My Workstation</h1>
                <p className="text-[#785A5D] mt-1">Ready to style? Let's go!</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="font-bold text-[#3F0D12]">{user?.username}</p>
                    <p className="text-xs text-[#D72638] font-bold uppercase">Stylist</p>
                </div>
                <button onClick={() => {logout(); navigate('/login')}} className="p-3 bg-[#FBE4E3] text-[#D72638] rounded-xl hover:bg-[#D72638] hover:text-white transition">
                    <LogOut size={20}/>
                </button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#3F0D12] text-white p-6 rounded-3xl shadow-xl">
                <h3 className="text-4xl font-bold mb-1">0</h3>
                <p className="text-white/70 text-sm uppercase tracking-wider">Active Queue</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-md border border-[#EACCCC]">
                <h3 className="text-4xl font-bold text-[#3F0D12] mb-1">0</h3>
                <p className="text-[#785A5D] text-sm uppercase tracking-wider">Completed Today</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-md border border-[#EACCCC]">
                <h3 className="text-4xl font-bold text-[#D72638] mb-1">₹0</h3>
                <p className="text-[#785A5D] text-sm uppercase tracking-wider">Today's Earnings</p>
            </div>
        </div>

        {/* Queue Section */}
        <div className="bg-white p-10 rounded-[2rem] shadow-sm text-center border border-[#EACCCC] min-h-[300px] flex flex-col justify-center items-center">
            <div className="w-20 h-20 bg-[#FBE4E3] rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-[#D72638]" size={32}/>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#3F0D12] mb-2">No Active Bookings</h2>
            <p className="text-[#785A5D]">Your assigned customers will appear here automatically.</p>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;