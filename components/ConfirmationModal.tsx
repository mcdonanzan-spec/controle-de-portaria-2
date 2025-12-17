import React from 'react';
import Modal from './Modal';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-brand-text mb-6">
        <p>{message}</p>
      </div>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="flex items-center justify-center bg-brand-steel hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          <XCircleIcon className="h-5 w-5 mr-2" />
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center justify-center bg-feedback-error hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
