import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Scissors, LogOut, Package, LayoutDashboard, Receipt, Search, Bell, User } from 'lucide-react';
import AdminChatDrawer from './AdminChatDrawer';
import useWebSocketNotification from '../hooks/useWebSocketNotification';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for WebSocket notifications
  useWebSocketNotification(() => {
    console.log("WebSocket event received in AdminLayout. You could trigger a global state refresh here if needed.");
  });

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <Receipt size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <Scissors size={20} /> },
    { name: 'Employees', path: '/admin/employees', icon: <Users size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <Package size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar (Desktop) */}
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col shadow-2xl hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black text-white tracking-widest flex items-center gap-2">
            <Scissors size={24} className="text-[#D72638]" /> H.WAYS <span className="text-gray-500 font-normal text-sm ml-1">ADMIN</span>
          </h2>
        </div>

        <nav className="space-y-2 flex-1 mt-6 px-4">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 mb-4">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 font-medium ${isActive
                  ? 'bg-[#D72638] text-white shadow-lg shadow-red-900/20'
                  : 'hover:bg-gray-800 hover:text-white'
                  }`}
              >
                {React.cloneElement(item.icon, { size: 18, className: isActive ? 'text-white' : 'text-gray-400' })}
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">

        {/* Top Header (Desktop) */}
        <header className="bg-white h-16 border-b border-gray-200 hidden md:flex items-center justify-between px-8 shrink-0 z-10">
          {/* Search Bar - Visual Placeholder */}
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-96 border border-transparent focus-within:border-gray-300 transition-all">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search bookings, customers, staff..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D72638] rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3F0D12] to-[#D72638] flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-700 leading-tight">Admin User</span>
                <span className="text-[10px] text-gray-500 font-medium">Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 pb-24 md:pb-10">
          <Outlet /> {/* Child pages will appear here */}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#3F0D12] text-[#FBE4E3] z-50 border-t border-[#D72638]/20 flex justify-around items-center p-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition flex-1 ${location.pathname === item.path ? 'text-[#D72638]' : 'text-white/60 hover:text-white'}`}
          >
            {React.cloneElement(item.icon, { size: location.pathname === item.path ? 24 : 20 })}
            <span className="text-[10px] font-bold tracking-wider">{item.name}</span>
          </button>
        ))}
      </div>

      <AdminChatDrawer />
    </div>
  );
};

export default AdminLayout;