import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { getCurrentUser, switchRole, getStoredNotifications } from '../utils/storage.ts';
import { UserRole, FarmerProfile } from '../types/index.ts';
import { Sprout, Bell, Settings, Wifi, WifiOff, Stethoscope, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenNotifications: () => void;
  currentUser: FarmerProfile;
  onRoleChanged: (newProfile: FarmerProfile) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenNotifications,
  currentUser,
  onRoleChanged,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateUnread = () => {
      const notifs = getStoredNotifications();
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
    };

    updateUnread();
    const interval = setInterval(updateUnread, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    const profile = switchRole(role);
    onRoleChanged(profile);
    setShowRoleMenu(false);
    if (role === 'expert') {
      onNavigate('expert');
    } else if (role === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <button
          onClick={() => onNavigate(currentUser.role === 'expert' ? 'expert' : currentUser.role === 'admin' ? 'admin' : 'dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-900 transition">
            <Sprout className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-emerald-950">
                {t('appName')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                AI
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block font-medium">
              {t('appTagline')}
            </p>
          </div>
        </button>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Online / Offline indicator */}
          <div
            title={isOnline ? t('onlineStatusBanner') : t('offlineStatusBanner')}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Bilingual Language Switcher (EN | हिन्दी) */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1.5 min-h-[38px] min-w-[40px] text-xs font-bold rounded-lg transition ${
                language === 'en'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1.5 min-h-[38px] min-w-[44px] text-xs font-bold rounded-lg transition ${
                language === 'hi'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative p-2.5 min-w-[42px] min-h-[42px] rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 min-h-[40px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold transition"
            >
              {currentUser.role === 'farmer' && <User className="w-3.5 h-3.5 text-emerald-700" />}
              {currentUser.role === 'expert' && <Stethoscope className="w-3.5 h-3.5 text-blue-700" />}
              {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />}
              <span className="capitalize">{currentUser.role}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-emerald-100 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                  Switch Active Role
                </div>
                <button
                  onClick={() => handleRoleSelect('farmer')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left font-medium ${
                    currentUser.role === 'farmer' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>Farmer (किसान)</div>
                    <div className="text-[10px] text-gray-500">Rameshwar Patel</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect('expert')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left font-medium ${
                    currentUser.role === 'expert' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <div>
                    <div>Expert Doctor (विशेषज्ञ)</div>
                    <div className="text-[10px] text-gray-500">Dr. Virendra Yadav</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect('admin')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left font-medium ${
                    currentUser.role === 'admin' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <div>
                    <div>Admin (प्रशासन)</div>
                    <div className="text-[10px] text-gray-500">KisanSeva Nodal</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Settings button */}
          <button
            onClick={() => onNavigate('settings')}
            aria-label="Settings"
            className={`p-2.5 min-w-[42px] min-h-[42px] rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition ${
              currentView === 'settings' ? 'bg-emerald-100 text-emerald-900' : ''
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
