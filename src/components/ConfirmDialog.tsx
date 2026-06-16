import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white dark:bg-secondary-500 rounded-2xl shadow-2xl p-5 max-w-sm border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-bold mb-1 text-secondary-500 dark:text-white">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost text-sm">Cancelar</button>
          <button onClick={onConfirm} className="btn-danger text-sm">Excluir</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
