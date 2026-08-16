import '../../styles/ui-feedback.css';

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'i',
};

export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="uf-toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`uf-toast uf-toast-${t.type}`}>
          <span className="uf-toast-icon">{ICONS[t.type] || ICONS.info}</span>
          <span className="uf-toast-message">{t.message}</span>
          <button
            type="button"
            className="uf-toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}