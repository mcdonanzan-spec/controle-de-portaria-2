import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start pt-10 z-50 overflow-y-auto">
      <div className="bg-brand-lead w-full max-w-lg mx-4 p-6 rounded-lg shadow-2xl relative border border-brand-steel">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-brand-steel">
          <h2 className="text-2xl font-bold text-brand-amber">{title}</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-brand-amber text-3xl font-bold">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;