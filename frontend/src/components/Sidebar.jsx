import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Book, 
  Library, 
  Clock, 
  CreditCard, 
  BookOpen, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Explore Books', path: '/books', icon: Library },
    { name: 'My Borrowed', path: '/student-dashboard', icon: Book },
    { name: 'Fines', path: '/fines', icon: CreditCard },
    { name: 'E-Books', path: '/ebooks', icon: BookOpen },
  ];

  const adminItems = [
    { name: 'Manage Books', path: '/admin-books', icon: Settings },
    { name: 'Transactions', path: '/admin-transactions', icon: Clock },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen sidebar-width bg-slate-900 text-slate-300 border-r border-slate-800 z-40 flex flex-col">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Library className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">NexLib</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">University LMS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="pb-4">
          <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Main Navigation</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-slate-800">
            <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Administration</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User Profile Mini */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 bg-rose-400/10 hover:bg-rose-400 hover:text-white transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
