import React from 'react';
import { Bell, CheckCheck, Clock, ExternalLink, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.js';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3 w-96 max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1 rounded hover:bg-teal-50 flex items-center gap-1 transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">We'll alert you when medicine becomes available or your reservation updates.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = notif.is_read === 0;
            return (
              <div
                key={notif.id}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.type === 'RESERVATION_UPDATE') {
                    navigate('/dashboard');
                    setIsOpen(false);
                  }
                }}
                className={`p-3.5 transition cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                  isUnread ? 'bg-teal-50/40' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {notif.type === 'STOCK_ALERT' ? (
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  ) : notif.type === 'RESERVATION_UPDATE' ? (
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          onClick={() => {
            navigate('/dashboard');
            setIsOpen(false);
          }}
          className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center justify-center gap-1 w-full py-1"
        >
          View user dashboard & reservations
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
