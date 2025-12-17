import React, { useEffect } from 'react';
import { ClipboardCheckIcon } from './icons';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 bg-feedback-success text-white py-3 px-5 rounded-lg shadow-xl z-50 flex items-center animate-fade-in-down">
      <ClipboardCheckIcon className="h-6 w-6 mr-3" />
      <span className="font-semibold">{message}</span>
       <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
