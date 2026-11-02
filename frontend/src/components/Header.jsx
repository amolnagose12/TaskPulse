import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  UserCheck, 
  Mail, 
  Calendar,
  Sparkles,
  ChevronDown,
  UserPlus
} from 'lucide-react';

export default function Header({ onOpenCreateTask, onOpenRegister }) {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    notifications, 
    unreadCount, 
    markNotificationRead,
    markAllNotificationsRead,
    triggerDeadlineCheck,
    activeTab,
    setActiveTab,
    outboxEmails
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'MANAGER':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">Manager</span>;
      case 'MENTOR':
        return <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">Mentor</span>;
      case 'MEMBER':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">Mentee</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tag */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">TaskPulse</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-200">
                  Team &amp; Mentorship
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Manager ↔ Mentor Oversight ↔ Mentee Workflow</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'board'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task Board
            </button>
            <button
              onClick={() => setActiveTab('outbox')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
                activeTab === 'outbox'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Outbox</span>
              {outboxEmails.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full">
                  {outboxEmails.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analytics
            </button>
          </nav>

          {/* Right Action Icons & Persona Switcher */}
          <div className="flex items-center space-x-3">
            {/* Cron simulation button */}
            <button
              onClick={triggerDeadlineCheck}
              title="Trigger simulated daily deadline cron check"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Scan Deadlines</span>
            </button>

            {/* In-App Notification Bell */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition"
                title="In-app notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications yet for this user.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-slate-800">{notif.title}</span>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1.5 pl-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser?.fullName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-xs leading-none text-slate-900">{currentUser?.fullName}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{currentUser?.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role View
                    </p>
                    <p className="text-xs text-slate-500">Test different perspectives &amp; permissions</p>
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition text-xs ${
                          currentUser?.id === u.id ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-slate-800">{u.fullName}</div>
                            <div className="text-[10px] text-slate-500">{u.department}</div>
                          </div>
                        </div>
                        {getRoleBadge(u.role)}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenRegister();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-blue-600 rounded-lg text-xs font-semibold shadow-2xs transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Register New User</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Create Task Button (Manager role preferred) */}
            {currentUser?.role === 'MANAGER' && (
              <button
                onClick={onOpenCreateTask}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Assign Task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

