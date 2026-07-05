import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Trash2,
  BellRing
} from 'lucide-react';
import { AppTranslation, NotificationItem } from '../types';

interface PushNotificationsProps {
  t: AppTranslation;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function PushNotifications({
  t,
  notifications,
  onMarkAsRead,
  onClearAll
}: PushNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="notifications-dropdown-container" className="relative">
      
      {/* Trigger Bell Button */}
      <button
        id="notifications-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
        title="View Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellRing className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-swing" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white dark:border-[#09090b] animate-bounce">
              {unreadCount}
            </span>
          </>
        ) : (
          <Bell className="w-5 h-5" />
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div 
          id="notifications-list-card"
          className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all duration-200 scale-100"
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#16161a]/60 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-500" />
              {t.notifications}
            </span>

            {notifications.length > 0 && (
              <button
                id="clear-all-notifications"
                onClick={onClearAll}
                className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List content */}
          <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No active notifications or alerts.
              </div>
            ) : (
              notifications.map(item => {
                let icon = <Info className="w-4 h-4 text-indigo-500" />;
                if (item.type === 'success') {
                  icon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
                } else if (item.type === 'warning') {
                  icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                } else if (item.type === 'error') {
                  icon = <AlertTriangle className="w-4 h-4 text-rose-500" />;
                }

                return (
                  <div 
                    key={item.id}
                    className={`p-3 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-[#16161a]/80 transition-colors ${
                      !item.read ? 'bg-indigo-50/10 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{icon}</div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-normal text-slate-700 dark:text-slate-300 ${
                        !item.read ? 'font-semibold text-slate-900 dark:text-white' : ''
                       }`}>
                        {item.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                        {item.timestamp}
                      </span>
                    </div>

                    {!item.read && (
                      <button
                        onClick={() => onMarkAsRead(item.id)}
                        className="text-[10px] text-indigo-500 hover:text-indigo-400 font-semibold flex-shrink-0"
                        title="Mark as read"
                      >
                        Read
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer toggle */}
          <div className="p-2.5 bg-slate-50 dark:bg-[#16161a]/60 border-t border-slate-100 dark:border-white/10 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 uppercase tracking-wider block w-full"
            >
              Close Panel
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
