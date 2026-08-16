import { useState, useEffect } from 'react';
import MessageThread from './MessageThread';
import { getStaffSocket } from '../lib/staffSocket';
import { API_BASE_URL } from '../config/api';

const API_BASE = `${API_BASE_URL}/api/messages/mine`;
const MESSAGES_BASE = `${API_BASE_URL}/api/messages`;

// "Message Admin" tab shared by the Doctor and Nurse dashboards — one
// running thread per staff member with the Admin inbox on the other end.
export default function StaffMessages({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMessages();

    const socket = getStaffSocket();
    const handleNew = (message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    };
    const handleEdited = (payload) => {
      setMessages((prev) => prev.map((m) => (m.id === payload.id ? { ...m, body: payload.body, editedAt: payload.editedAt } : m)));
    };
    const handleDeleted = (payload) => {
      setMessages((prev) => prev.filter((m) => m.id !== payload.id));
    };
    socket.on('message:new', handleNew);
    socket.on('message:edited', handleEdited);
    socket.on('message:deleted', handleDeleted);
    return () => {
      socket.off('message:new', handleNew);
      socket.off('message:edited', handleEdited);
      socket.off('message:deleted', handleDeleted);
    };
  }, []);

  async function loadMessages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (res.status === 401) throw new Error('Your session has expired — please refresh the page and log in again.');
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setMessages(await res.json());
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(body) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error('Server responded ' + res.status);
    const message = await res.json();
    setMessages((prev) => [...prev, message]);
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
  }

  async function deleteMessage(id) {
    const res = await fetch(`${MESSAGES_BASE}/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Server responded ' + res.status);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Message Admin</h1>
          <p>Reach out directly with anything that needs Admin's attention.</p>
        </div>
      </div>
      {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}
      {!error && (
        <MessageThread
          messages={messages}
          currentUserId={user?.id}
          onSend={sendMessage}
          onEdit={editMessage}
          onDelete={deleteMessage}
          loading={loading}
          emptyLabel="No messages yet — send Admin a note to start the conversation."
          placeholder="Message Admin…"
        />
      )}
    </>
  );
}
