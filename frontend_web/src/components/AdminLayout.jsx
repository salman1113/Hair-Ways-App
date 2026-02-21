import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Scissors, LogOut, Package, LayoutDashboard, Receipt  } from 'lucide-react';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <Receipt size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <Scissors size={20} /> },
    { name: 'Employees', path: '/admin/employees', icon: <Users size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <Package size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#FBE4E3]">
      {/* Sidebar */}
      <div className="w-64 bg-[#3F0D12] text-[#FBE4E3] flex flex-col p-6 shadow-2xl hidden md:flex">
        <h2 className="text-2xl font-serif font-bold mb-10 tracking-widest">ADMIN<span className="text-[#D72638]">PANEL</span></h2>

        <nav className="space-y-4 flex-1 mt-8">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${location.pathname === item.path ? 'bg-[#D72638] text-white' : 'hover:bg-white/10'}`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-3 p-3 text-white/70 hover:text-white mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <Outlet /> {/* Child pages will appear here */}
      </div>
    </div>
  );
};

export default AdminLayout;