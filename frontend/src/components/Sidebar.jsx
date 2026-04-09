import React from 'react';
import { Home, Compass, Settings, LogOut, Hexagon, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-20 lg:w-64 border-r border-gray-200 flex flex-col bg-white shrink-0 transition-all duration-300 shadow-sm z-30 relative">
      <Link to="/dashboard" className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 hover:bg-gray-50 transition block">
        <Hexagon className="text-brand-primary w-8 h-8" />
        <span className="ml-3 font-extrabold text-xl tracking-tight hidden lg:block text-gray-900">
          Geo<span className="text-brand-primary">Vibe</span>
        </span>
      </Link>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        <NavItem icon={<Home size={20} />} label="Opportunities" active={location.pathname === '/dashboard'} to="/dashboard" />
        <NavItem icon={<ShieldAlert size={20} />} label="Host Mode" active={location.pathname === '/host-mode' || location.pathname === '/host'} to="/host-mode" />
        <NavItem icon={<Compass size={20} />} label="Discover" active={location.pathname === '/discover'} to="/discover" />
        <NavItem icon={<Settings size={20} />} label="Settings" active={location.pathname === '/settings'} to="/settings" />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center lg:justify-start px-3 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition duration-300 group font-bold">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="ml-3 hidden lg:block text-sm">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active, to }) => (
  <Link to={to} className={`w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-xl transition-all duration-200 relative group font-bold text-sm
    ${active ? 'text-brand-primary bg-blue-50 border border-blue-100 shadow-sm' : 'text-gray-500 hover:text-brand-primary hover:bg-gray-50 border border-transparent'}
  `}>
    <div className={`${active ? 'text-brand-primary' : 'text-gray-400'} transition-colors`}>{icon}</div>
    <span className="ml-3 hidden lg:block tracking-wide">{label}</span>
  </Link>
);

export default Sidebar;
