import React, { useEffect } from 'react';
import { Icons } from '../Icons';
import { ToastState } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastState;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <Icons.Check size={16} className="text-green-400" />;
      case 'error': return <Icons.AlertTriangle size={16} className="text-red-400" />;
      case 'warning': return <Icons.AlertTriangle size={16} className="text-yellow-400" />;
      default: return <Icons.Info size={16} className="text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      default: return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg 
      animate-in slide-in-from-bottom-5 fade-in duration-300
      ${getBorderColor()}
    `}>
      {getIcon()}
      <span className="text-sm font-medium text-white/90">{toast.message}</span>
      <button 
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-white/40 hover:text-white transition-colors"
      >
        <Icons.X size={14} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastState[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};
