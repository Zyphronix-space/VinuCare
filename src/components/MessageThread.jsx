import { useState, useEffect, useRef } from 'react';
import { useUIFeedback } from '../context/UIFeedbackContext';
import { EditIcon, TrashIcon } from './ui/Icons';
import Skeleton from './ui/Skeleton';

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
}

// Reusable DM thread view — used by both the staff "Message Admin" tab
// and the Admin inbox's open-conversation panel. `currentUserId` decides
// which bubbles render as "mine" (right-aligned) vs "theirs" (left), and
// only "mine" bubbles get edit/delete controls since a message may only
// be changed by whoever sent it.
export default function MessageThread({ messages, currentUserId, onSend, onEdit, onDelete, loading, emptyLabel, placeholder = 'Type a message…' }) {
  const { confirm, error: notifyError } = useUIFeedback();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await onSend(body);
      setDraft('');
    } finally {
      setSending(false);
    }
  }

  function startEdit(m) {
    setEditingId(m.id);
    setEditDraft(m.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft('');
  }

  async function saveEdit(id) {
    const body = editDraft.trim();
    if (!body || savingEdit) return;
    setSavingEdit(true);
    try {
      await onEdit(id, body);
      setEditingId(null);
      setEditDraft('');
    } catch (err) {
      notifyError(err.message || 'Could not update message.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id) {
    const ok = await confirm({ title: 'Delete message?', message: 'This cannot be undone.', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await onDelete(id);
    } catch (err) {
      notifyError(err.message || 'Could not delete message.');
    }
  }

  return (
    <div className="dm-thread">
      <div className="dm-thread-list" ref={listRef}>
        {loading && [42, 68, 50].map((w, i) => (
          <div className={`dm-bubble-row ${i % 2 ? 'mine' : ''}`} key={i}>
            <div className={`dm-bubble ${i % 2 ? 'dm-bubble-mine' : 'dm-bubble-theirs'}`}>
              <Skeleton
                width={`${w}vw`}
                height="0.85rem"
                style={{ maxWidth: 220, background: i % 2 ? 'rgba(255,255,255,0.35)' : undefined }}
              />
            </div>
          </div>
        ))}
        {!loading && messages.length === 0 && <p className="dm-empty">{emptyLabel || 'No messages yet.'}</p>}
        {!loading && messages.map((m) => {
          const isMine = String(m.senderId) === String(currentUserId);
          const isEditing = editingId === m.id;
          return (
            <div key={m.id} className={`dm-bubble-row ${isMine ? 'mine' : ''}`}>
              <div className={`dm-bubble ${isMine ? 'dm-bubble-mine' : 'dm-bubble-theirs'}`}>
                {!isMine && <div className="dm-bubble-sender">{m.senderName} · {m.senderRole}</div>}

                {isEditing ? (
                  <div className="dm-edit-form">
                    <input
                      className="dm-edit-input"
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(m.id); if (e.key === 'Escape') cancelEdit(); }}
                      autoFocus
                      disabled={savingEdit}
                    />
                    <div className="dm-edit-actions">
                      <button type="button" onClick={() => saveEdit(m.id)} disabled={savingEdit || !editDraft.trim()}>Save</button>
                      <button type="button" onClick={cancelEdit} disabled={savingEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="dm-bubble-body">{m.body}</div>
                )}

                <div className="dm-bubble-time">
                  {formatTime(m.createdAt)}{m.editedAt && ' · edited'}
                </div>

                {isMine && !isEditing && (
                  <div className="dm-bubble-actions">
                    <button type="button" className="dm-bubble-action" onClick={() => startEdit(m)} aria-label="Edit message">
                      <EditIcon size={13} />
                    </button>
                    <button type="button" className="dm-bubble-action" onClick={() => handleDelete(m.id)} aria-label="Delete message">
                      <TrashIcon size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <form className="dm-input-row" onSubmit={handleSubmit}>
        <input
          className="dm-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          disabled={sending}
        />
        <button type="submit" className="dm-send" disabled={sending || !draft.trim()}>Send</button>
      </form>
    </div>
  );
}
