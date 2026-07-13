import type { ReactNode } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  children?: ReactNode;
}

const Toast = ({ message, type = 'info', onClose, children }: ToastProps) => (
  <div className={`toast toast-${type}`} role="status">
    <div className="toast-content">
      <strong>{message}</strong>
      {children}
    </div>
    <button type="button" className="button button-link toast-close" onClick={onClose}>
      ×
    </button>
  </div>
);

export default Toast;
