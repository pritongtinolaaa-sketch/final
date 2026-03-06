import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, LogOut, KeyRound, ScrollText, Cookie, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isMaster, isPremium } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user || location.pathname === '/auth') return null;

  const isActive = (path) => location.pathname === path;

  const TierBadge = () => {
    if (isMaster) return (
      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 text-amber-950 border border-yellow-100/90 ring-1 ring-amber-200/60 shadow-[0_0_14px_rgba(251,191,36,0.9),0_0_26px_rgba(245,158,11,0.55),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(146,64,14,0.35)]">
        MASTER
      </span>
    );
    if (isPremium) return (
      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/35 via-violet-500/30 to-purple-600/35 text-purple-200 border border-purple-300/40 ring-1 ring-purple-400/25 shadow-[0_0_8px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(46,16,101,0.3)]">
        PREMIUM
      </span>
    );
    return (
      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-white/10 text-white/40 border border-white/10">
        FREE
      </span>
    );
  };

  const NavLink = ({ to, icon: Icon, label, testId, activeClass, inactiveClass }) => (
    <Link
      to={to}
      data-testid={testId}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-sm text-sm transition-colors ${
        isActive(to) ? `text-white bg-white/10 ${activeClass || ''}` : `${inactiveClass || 'text-white/50 hover:text-white'} hover:bg-white/5`
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );

  return (
    <nav data-testid="navbar" className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="nav-logo" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="Schiro" className="w-9 h-9 object-contain" />
          <span className="font-bebas text-xl tracking-wider text-white">SCHIRO</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" icon={LayoutDashboard} label="Cookie Checker" testId="nav-dashboard-link" />
          <NavLink to="/free-cookies" icon={Cookie} label="Free Cookies" testId="nav-free-cookies-link" inactiveClass="text-green-400/70 hover:text-green-400" />

          {(isMaster || isPremium) && (
            <NavLink to="/admin/cookies" icon={ShieldCheck} label="Admin Cookies" testId="nav-admin-cookies-link" inactiveClass="text-purple-400/70 hover:text-purple-400" />
          )}

          {isMaster && (
            <>
              <NavLink to="/admin" icon={KeyRound} label="Keys" testId="nav-admin-link" inactiveClass="text-primary/70 hover:text-primary" />
              <NavLink to="/admin/logs" icon={ScrollText} label="Logs" testId="nav-logs-link" inactiveClass="text-white/50 hover:text-white" />
            </>
          )}

          <div className="w-px h-6 bg-white/10 mx-2" />

          {/* Username + badge */}
          <div className="flex flex-col items-center mr-2">
            <span className="text-sm text-white/40 leading-tight" data-testid="nav-username">{user.label}</span>
            <TierBadge />
          </div>

          <button onClick={logout} data-testid="nav-logout-btn" className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl" data-testid="nav-mobile-menu">
          <div className="px-4 py-3 space-y-1">
            <NavLink to="/" icon={LayoutDashboard} label="Cookie Checker" testId="nav-dashboard-link-mobile" />
            <NavLink to="/free-cookies" icon={Cookie} label="Free Cookies" testId="nav-free-cookies-link-mobile" inactiveClass="text-green-400/70 hover:text-green-400" />

            {(isMaster || isPremium) && (
              <NavLink to="/admin/cookies" icon={ShieldCheck} label="Admin Cookies" testId="nav-admin-cookies-link-mobile" inactiveClass="text-purple-400/70 hover:text-purple-400" />
            )}

            {isMaster && (
              <>
                <NavLink to="/admin" icon={KeyRound} label="Keys" testId="nav-admin-link-mobile" inactiveClass="text-primary/70 hover:text-primary" />
                <NavLink to="/admin/logs" icon={ScrollText} label="Logs" testId="nav-logs-link-mobile" inactiveClass="text-white/50 hover:text-white" />
              </>
            )}

            <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between">
              {/* Username + badge for mobile */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-white/40 leading-tight" data-testid="nav-username-mobile">{user.label}</span>
                <TierBadge />
              </div>
              <button onClick={() => { logout(); setOpen(false); }} data-testid="nav-logout-btn-mobile" className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-red-400/60 hover:text-red-400 hover:bg-white/5 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
