import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Scissors, LogOut, Package, LayoutDashboard, Receipt, Search, Bell, ChevronRight } from 'lucide-react';
import AdminChatDrawer from './AdminChatDrawer';
import useWebSocketNotification from '../hooks/useWebSocketNotification';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Listen for WebSocket notifications
  useWebSocketNotification(() => {
    console.log("WebSocket event received in AdminLayout. You could trigger a global state refresh here if needed.");
  });

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: Receipt },
    { name: 'Services', path: '/admin/services', icon: Scissors },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
  ];

  const isMenuItemActive = (path) => (
    location.pathname === path ||
    (path !== '/admin' && location.pathname.startsWith(`${path}/`))
  );

  return (
    <div className="flex h-screen bg-white font-sans">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Desktop Sidebar — Collapsed by default, expands on hover  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`hidden md:flex flex-col bg-[#1A1A1A] border-r border-gray-800 transition-all duration-300 ease-in-out shrink-0 ${sidebarExpanded ? 'w-64' : 'w-[72px]'
          }`}
      >
        {/* Logo / Brand */}
        <div className={`h-16 flex items-center border-b border-gray-800 transition-all duration-300 ${sidebarExpanded ? 'px-6' : 'px-0 justify-center'
          }`}>
          {sidebarExpanded ? (
            <h2 className="text-lg font-black text-white tracking-[0.2em] flex items-center gap-2 whitespace-nowrap">
              <Scissors size={20} className="text-[#C19D6C]" />
              H.WAYS
              <span className="text-[#C19D6C] font-medium text-[10px] uppercase tracking-widest ml-1">Admin</span>
            </h2>
          ) : (
            <Scissors size={22} className="text-[#C19D6C]" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
          {sidebarExpanded && (
            <p className="text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase px-3 mb-3">
              Menu
            </p>
          )}
          {menuItems.map((item) => {
            const isActive = isMenuItemActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!sidebarExpanded ? item.name : undefined}
                className={`flex items-center gap-3 w-full rounded-lg transition-all duration-200 font-medium text-sm ${sidebarExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                  } ${isActive
                    ? 'bg-[#C19D6C]/15 text-[#C19D6C]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                {sidebarExpanded && (
                  <span className="whitespace-nowrap">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`border-t border-gray-800 py-4 px-3`}>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title={!sidebarExpanded ? 'Logout' : undefined}
            className={`flex items-center gap-3 w-full rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-sm font-medium ${sidebarExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
              }`}
          >
            <LogOut size={20} strokeWidth={1.8} className="shrink-0" />
            {sidebarExpanded && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* Main Content Area                  */}
      {/* ═══════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">

        {/* Top Header (Desktop) */}
        <header className="bg-white h-16 border-b border-gray-200 hidden md:flex items-center justify-between px-8 shrink-0 z-10">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full w-96 border border-gray-200 focus-within:border-[#C19D6C] transition-all duration-200">
            <Search size={16} className="text-gray-400 mr-2.5" />
            <input
              type="text"
              placeholder="Search bookings, customers, staff..."
              className="bg-transparent border-none outline-none text-sm w-full text-black placeholder-gray-400"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-black transition-colors duration-200 rounded-lg hover:bg-gray-100">
              <Bell size={20} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#C19D6C] font-bold text-sm">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-black leading-tight">Admin</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">Owner</span>
              </div>
              <ChevronRight size={14} className="text-gray-300 ml-1" />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* Mobile Bottom Navigation                       */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 border-t border-gray-200 flex justify-around items-center px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {menuItems.map((item) => {
          const isActive = isMenuItemActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all duration-200 flex-1 ${isActive
                ? 'text-[#C19D6C]'
                : 'text-gray-400'
                }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-[#1A1A1A] text-[#C19D6C]' : ''
                }`}>
                <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.2 : 1.6} />
              </div>
              <span className={`text-[9px] font-semibold tracking-wider ${isActive ? 'text-[#C19D6C]' : 'text-gray-400'
                }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      <AdminChatDrawer />
    </div>
  );
};

export default AdminLayout;
