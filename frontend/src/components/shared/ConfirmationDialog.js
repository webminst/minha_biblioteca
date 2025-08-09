import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../Toast/ToastContainer';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger', 'warning', 'info', 'success'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleConfirm = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      addToast(error.message || 'Ocorreu um erro ao processar sua solicitação.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [onConfirm, onClose, addToast]);

  if (!isOpen) return null;

  return createPortal(
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <div className="confirmation-dialog-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose} disabled={isSubmitting}>
            {'×'}
          </button>
        </div>
        <div className="confirmation-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirmation-dialog-footer">
          <button
            className={`btn btn-${variant}`}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processando...' : confirmText}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmationDialog;
