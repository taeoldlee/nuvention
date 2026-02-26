import { useState, useEffect, useRef } from 'react';
import { getProjectMessages, sendProjectMessage } from '../../api';

/**
 * MessageThread — works for both brand and creator views.
 *
 * Props:
 *   projectId   – required
 *   senderRole  – 'BRAND' (default) or 'CREATOR'
 *   fetchFn     – optional async (projectId, params) => res  (overrides default brand fetch)
 *   sendFn      – optional async (projectId, text) => res  (overrides default brand send)
 */
export default function MessageThread({ projectId, senderRole = 'BRAND', fetchFn, sendFn }) {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const intervalRef = useRef(null);
  const hasLoadedEarlier = useRef(false);

  const doFetch = fetchFn || getProjectMessages;
  const doSend = sendFn || sendProjectMessage;

  // Fetch messages — on initial load replaces state; on poll after loading earlier, merges new messages
  const fetchMessages = async () => {
    try {
      const res = await doFetch(projectId, { limit: 50 });
      const latest = res.data.messages || [];
      if (hasLoadedEarlier.current) {
        // Preserve earlier messages, only append genuinely new ones
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMsgs = latest.filter((m) => !existingIds.has(m.id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
      } else {
        setMessages(latest);
        setHasMore(res.data.hasMore || false);
      }
      setError('');
    } catch (err) {
      console.error('[MessageThread] fetch error:', err.response?.status, err.response?.data || err.message);
      setError('Could not load messages.');
    }
  };

  // Load older messages (prepend)
  const loadEarlier = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldestId = messages[0]?.id;
      const container = scrollContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;

      const res = await doFetch(projectId, { limit: 50, before: oldestId });
      const older = res.data.messages || [];
      setHasMore(res.data.hasMore || false);
      hasLoadedEarlier.current = true;
      setMessages((prev) => [...older, ...prev]);

      // Preserve scroll position after prepending
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error('[MessageThread] load earlier error:', err.response?.status, err.response?.data || err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 10000);
    return () => clearInterval(intervalRef.current);
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await doSend(projectId, text.trim());
      setText('');
      await fetchMessages();
    } catch (err) {
      console.error('[MessageThread] send error:', err.response?.status, err.response?.data || err.message);
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card">
      <h3 className="font-display text-lg font-semibold text-dark mb-4">Messages</h3>

      {error && (
        <p className="text-sm text-red-500 font-body mb-2">{error}</p>
      )}

      <div ref={scrollContainerRef} className="max-h-80 overflow-y-auto space-y-3 mb-4 pr-1">
        {/* Load Earlier Messages */}
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={loadEarlier}
              disabled={loadingMore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-body text-accent hover:bg-accentLight transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  Load earlier messages
                </>
              )}
            </button>
          </div>
        )}
        {messages.length === 0 && !error ? (
          <p className="text-sm text-muted font-body text-center py-6">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderType === senderRole;
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-bgWarm flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted border border-border">
                  {msg.senderName?.charAt(0) || '?'}
                </div>
                <div className={`max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                  <div className={`inline-block rounded-xl px-3 py-2 text-sm font-body ${
                    isMe
                      ? 'bg-accent text-white rounded-tr-sm'
                      : 'bg-bgWarm text-dark rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-muted mt-0.5 font-body">
                    {msg.senderName?.split(' ')[0]} · {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1 text-sm"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Send message"
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
