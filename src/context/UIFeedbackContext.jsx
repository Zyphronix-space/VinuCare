import { createContext, useCallback, useContext, useRef, useState } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal';
import ToastStack from '../components/ui/ToastStack';

const UIFeedbackContext = createContext(null);

let toastIdCounter = 0;

export function UIFeedbackProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const confirm = useCallback((opts) => {
    const config = typeof opts === 'string' ? { message: opts } : (opts || {});
    return new Promise((resolve) => {
      setConfirmState({
        title: config.title || 'Are you sure?',
        message: config.message || '',
        confirmLabel: config.confirmLabel || 'Confirm',
        cancelLabel: config.cancelLabel || 'Cancel',
        danger: config.danger !== false,
        resolve,
      });
    });
  }, []);

  const closeConfirm = useCallback((result) => {
    setConfirmState((prev) => {
      if (prev) prev.resolve(result);
      return null;
    });
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => dismissToast(id), duration);
    return id;
  }, [dismissToast]);

  const value = {
    confirm,
    toast,
    success: (msg, duration) => toast(msg, 'success', duration),
    error: (msg, duration) => toast(msg, 'error', duration),
    info: (msg, duration) => toast(msg, 'info', duration),
  };

  return (
    <UIFeedbackContext.Provider value={value}>
      {children}
      <ConfirmModal state={confirmState} onClose={closeConfirm} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </UIFeedbackContext.Provider>
  );
}

export function useUIFeedback() {
  const ctx = useContext(UIFeedbackContext);
  if (!ctx) {
    throw new Error('useUIFeedback must be used within a UIFeedbackProvider');
  }
  return ctx;
}