import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    // Default titles based on type if not provided
    const defaultTitles = {
      success: 'Operation Successful',
      error: 'Action Failed',
      warning: 'Attention Required',
      info: 'Notification'
    };

    const finalTitle = title || defaultTitles[type] || 'Notice';

    setToasts((prev) => [
      ...prev,
      { id, type, title: finalTitle, message, duration }
    ]);

    return id;
  }, []);

  const showSuccess = useCallback((message, title) => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((message, title) => {
    return addToast({ type: 'error', title, message, duration: 5000 });
  }, [addToast]);

  const showWarning = useCallback((message, title) => {
    return addToast({ type: 'warning', title, message, duration: 4500 });
  }, [addToast]);

  const showInfo = useCallback((message, title) => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  // Expose global helper window.trbToast so non-hook scripts or callbacks can also trigger it
  useEffect(() => {
    window.trbToast = {
      show: addToast,
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    };
    return () => {
      delete window.trbToast;
    };
  }, [addToast, showSuccess, showError, showWarning, showInfo]);

  return (
    <ToastContext.Provider value={{ showToast: addToast, showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return safe fallback in case useToast is used outside provider
    return {
      showToast: () => {},
      showSuccess: (msg) => console.log('[Toast Success]:', msg),
      showError: (msg) => console.error('[Toast Error]:', msg),
      showWarning: (msg) => console.warn('[Toast Warning]:', msg),
      showInfo: (msg) => console.info('[Toast Info]:', msg),
      removeToast: () => {}
    };
  }
  return context;
}

// =========================================================================
// TOAST CONTAINER & INDIVIDUAL TOAST CARD
// =========================================================================
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="trb-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    startTimeRef.current = Date.now();
    const totalDuration = toast.duration;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const newProgress = (currentRemaining / totalDuration) * 100;
      setProgress(newProgress);

      if (currentRemaining <= 0) {
        onRemove();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, toast.duration, onRemove]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    // calculate remaining time accurately
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Config mapping for styling & icons
  const typeConfig = {
    success: {
      border: '#10b981',
      bgIcon: '#ecfdf5',
      iconColor: '#10b981',
      progressBg: '#10b981',
      Icon: CheckCircle2
    },
    error: {
      border: '#ef4444',
      bgIcon: '#fef2f2',
      iconColor: '#ef4444',
      progressBg: '#ef4444',
      Icon: AlertCircle
    },
    warning: {
      border: '#f59e0b',
      bgIcon: '#fffbeb',
      iconColor: '#f59e0b',
      progressBg: '#f59e0b',
      Icon: AlertTriangle
    },
    info: {
      border: '#0284c7',
      bgIcon: '#f0f9ff',
      iconColor: '#0284c7',
      progressBg: '#0284c7',
      Icon: Info
    }
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const { Icon } = config;

  return (
    <div 
      className={`trb-toast-card trb-toast-${toast.type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      style={{ borderLeftColor: config.border }}
    >
      <div className="trb-toast-body">
        {/* Left Icon Pill */}
        <div 
          className="trb-toast-icon-box"
          style={{ backgroundColor: config.bgIcon, color: config.iconColor }}
        >
          <Icon size={18} strokeWidth={2.4} />
        </div>

        {/* Content */}
        <div className="trb-toast-content">
          <div className="trb-toast-title">{toast.title}</div>
          <div className="trb-toast-message">{toast.message}</div>
        </div>

        {/* Close Button */}
        <button 
          type="button"
          onClick={onRemove}
          className="trb-toast-close-btn"
          aria-label="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>

      {/* Auto-Dismiss Countdown Progress Bar */}
      <div className="trb-toast-progress-track">
        <div 
          className="trb-toast-progress-bar"
          style={{ 
            width: `${progress}%`,
            backgroundColor: config.progressBg 
          }}
        />
      </div>
    </div>
  );
}
