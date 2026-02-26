import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../../api';

const TYPE_ICONS = {
  DRAFT_SUBMITTED: '📄',
  APPROVED: '✅',
  REVISION_REQUESTED: '✏️',
  DELIVERED: '🎉',
  MESSAGE: '💬',
  BRIEF_ACCEPTED: '🤝',
  BRIEF_QUESTION: '❓',
  BRIEF_RECEIVED: '📨',
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchUnread = async () => {
    try {
      const res = await getUnreadCount();
      setUnread(res.data.count || 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      try {
        const res = await getNotifications();
        setNotifications(res.data.notifications || []);
      } catch { /* silent */ }
      setLoading(false);
    }
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      markNotificationRead(notif.id).catch(() => {});
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (notif.linkUrl) navigate(notif.linkUrl);
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-bgWarm transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-display text-sm font-semibold text-dark">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-accent font-medium hover:text-accent/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted font-body">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 hover:bg-bgWarm transition-colors border-b border-border/50 last:border-0 ${
                    !notif.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-body truncate ${!notif.read ? 'font-semibold text-dark' : 'text-mid'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted font-body truncate">{notif.body}</p>
                      <p className="text-[10px] text-muted/60 font-body mt-0.5">{relativeTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
