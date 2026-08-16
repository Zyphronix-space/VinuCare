import '../../styles/ui-feedback.css';

export default function ConfirmModal({ state, onClose }) {
  if (!state) return null;

  const { title, message, confirmLabel, cancelLabel, danger } = state;

  return (
    <div className="uf-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(false); }}>
      <div className="uf-confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="uf-confirm-title">
        <div className={`uf-confirm-icon ${danger ? 'uf-icon-danger' : 'uf-icon-neutral'}`}>
          {danger ? '!' : '?'}
        </div>
        <h3 id="uf-confirm-title" className="uf-confirm-title">{title}</h3>
        {message && <p className="uf-confirm-message">{message}</p>}
        <div className="uf-confirm-actions">
          <button type="button" className="uf-btn uf-btn-ghost" onClick={() => onClose(false)}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`uf-btn ${danger ? 'uf-btn-danger' : 'uf-btn-primary'}`}
            onClick={() => onClose(true)}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}