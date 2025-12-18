
import React, { useEffect } from 'react';
import { ClipboardCheckIcon, XCircleIcon } from './icons';

interface ToastProps {
  message: string;
  show: boolean;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, show, type = 'success', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-feedback-success' : 'bg-feedback-error';
  const Icon = type === 'success' ? ClipboardCheckIcon : XCircleIcon;

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-5 ${bgColor} text-brand-charcoal py-4 px-6 rounded-2xl shadow-2xl z-[100] flex items-center gap-4 animate-fade-in-down min-w-[300px]`}>
      <Icon className="h-6 w-6 shrink-0" />
      <span className="font-black text-xs uppercase tracking-wider">{message}</span>
       <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (min-width: 768px) {
          @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
