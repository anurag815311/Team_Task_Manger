import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/projects', label: 'Projects', icon: HiOutlineFolder },
  { path: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Floating style */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          p-4 flex flex-col h-screen`}
      >
        <div className="glass-card flex-1 flex flex-col overflow-hidden h-full">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
                <span className="text-white font-black text-xl tracking-tighter">TF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">TaskFlow</h1>
                <p className="text-xs text-primary-300 font-medium tracking-wide">WORKSPACE</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500/20 to-transparent text-primary-300 border-l-2 border-primary-400'
                        : 'text-surface-400 hover:bg-surface-800/50 hover:text-white border-l-2 border-transparent'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 mt-auto">
            <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-700/50 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-primary-300 font-medium truncate">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-surface-300 bg-surface-800 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
              >
                <HiOutlineLogout className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-0">
        {/* Top bar (Mobile only mostly, or sleek header) */}
        <header className="sticky top-0 z-30 lg:hidden px-6 py-4 flex items-center justify-between bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
          <button
            className="p-2.5 rounded-xl bg-surface-800 text-surface-300 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">TF</span>
              </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
