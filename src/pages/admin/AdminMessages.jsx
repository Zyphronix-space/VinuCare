import { useState, useEffect } from 'react';
import MessageThread from '../../components/MessageThread';
import { getAdminSocket } from '../../lib/adminSocket';
import { API_BASE_URL } from '../../config/api';
import Skeleton from '../../components/ui/Skeleton';

const API_BASE = `${API_BASE_URL}/api/messages/admin/threads`;
const MESSAGES_BASE = `${API_BASE_URL}/api/messages`;

function formatPreviewTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
}

export default function AdminMessages({ user, onRead }) {
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    loadThreads();

    const socket = getAdminSocket();
    const handleNew = (message) => {
      loadThreads();
      if (String(message.staffId) === String(selectedId)) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }
    };
    const handleEdited = (payload) => {
      if (String(payload.staffId) === String(selectedId)) {
        setMessages((prev) => prev.map((m) => (m.id === payload.id ? { ...m, body: payload.body, editedAt: payload.editedAt } : m)));
      }
      loadThreads();
    };
    const handleDeleted = (payload) => {
      if (String(payload.staffId) === String(selectedId)) {
        setMessages((prev) => prev.filter((m) => m.id !== payload.id));
      }
      loadThreads();
    };
    socket.on('message:new', handleNew);
    socket.on('message:edited', handleEdited);
    socket.on('message:deleted', handleDeleted);
    return () => {
      socket.off('message:new', handleNew);
      socket.off('message:edited', handleEdited);
      socket.off('message:deleted', handleDeleted);
    };
  }, [selectedId]);

  async function loadThreads() {
    setThreadsLoading(true);
    setThreadsError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (res.status === 401) throw new Error('Your session has expired — please refresh the page and log in again.');
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setThreads(await res.json());
    } catch (err) {
      console.error('Failed to load message threads:', err);
      setThreadsError(err.message);
    } finally {
      setThreadsLoading(false);
    }
  }

  async function openThread(staffId) {
    setSelectedId(staffId);
    setMessagesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${staffId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setMessages(await res.json());
      setThreads((prev) => prev.map((t) => (t.id === staffId ? { ...t, unreadCount: 0 } : t)));
      onRead?.();
    } catch (err) {
      console.error('Failed to load thread:', err);
    } finally {
      setMessagesLoading(false);
    }
  }

  async function sendMessage(body) {
    const res = await fetch(`${API_BASE}/${selectedId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error('Server responded ' + res.status);
    const message = await res.json();
    setMessages((prev) => [...prev, message]);
    loadThreads();
  }

  async function editMessage(id, body) {
    const res = await fetch(`${MESSAGES_BASE}/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error('Server responded ' + res.status);
    const updated = await res.json();
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, body: updated.body, editedAt: updated.editedAt } : m)));
    loadThreads();
  }

  async function deleteMessage(id) {
    const res = await fetch(`${MESSAGES_BASE}/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Server responded ' + res.status);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    loadThreads();
  }

  const selectedThread = threads.find((t) => t.id === selectedId);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Messages</h1>
          <p>Direct messages from doctors and nurses.</p>
        </div>
      </div>

      <div className="dm-inbox">
        <div className="dm-thread-list-panel">
          {threadsLoading && Array.from({ length: 5 }).map((_, i) => (
            <div className="dm-thread-item" key={i} style={{ cursor: 'default' }}>
              <div style={{ flex: 1 }}>
                <Skeleton width="70%" height="0.88rem" style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height="0.74rem" />
              </div>
              <Skeleton width="36px" height="0.74rem" />
            </div>
          ))}
          {threadsError && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{threadsError}</div>}
          {!threadsLoading && !threadsError && threads.length === 0 && <div className="admin-empty">No staff accounts yet.</div>}
          {!threadsLoading && !threadsError && threads.map((t) => (
            <div
              key={t.id}
              className={`dm-thread-item ${selectedId === t.id ? 'active' : ''}`}
              onClick={() => openThread(t.id)}
            >
              <div>
                <div className="dm-thread-item-name">{t.name}</div>
                <div className="dm-thread-item-role">{t.role}</div>
                {t.lastMessage && <div className="dm-thread-item-preview">{t.lastMessage}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                {t.unreadCount > 0 && <div className="dm-unread-badge">{t.unreadCount}</div>}
                <div className="dm-thread-item-role">{formatPreviewTime(t.lastMessageAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedId ? (
          <MessageThread
            messages={messages}
            currentUserId={user?.id}
            onSend={sendMessage}
            onEdit={editMessage}
            onDelete={deleteMessage}
            loading={messagesLoading}
            emptyLabel={`No messages with ${selectedThread?.name || 'this person'} yet — say hello.`}
            placeholder={`Message ${selectedThread?.name || ''}…`}
          />
        ) : (
          <div className="dm-thread" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <p className="dm-empty">Select someone on the left to view or start a conversation.</p>
          </div>
        )}
      </div>
    </>
  );
}
