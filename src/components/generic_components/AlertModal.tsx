import React from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'danger' | 'warning' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Certo! Tentarei novamente ➔',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-circle-fill';
      case 'info':
      default:
        return 'bi-info-circle-fill';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#28a745';
      case 'danger':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'info':
      default:
        return '#17a2b8';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          toggle={onClose}
          centered
          fade={false}
          contentClassName="custom-alert-modal-content"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '5px',
              color: '#fff',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
            }}
          >
            <ModalBody
              style={{
                textAlign: 'center',
                padding: '30px',
                background: 'transparent',
              }}
            >
              <div
                style={{
                  fontSize: '4rem',
                  color: getColor(),
                  marginBottom: '20px',
                }}
              >
                <i className={`bi ${getIcon()}`} />
              </div>

              {title && (
                <h4
                  style={{
                    color: '#fff',
                    marginBottom: '15px',
                    fontWeight: 'bold',
                  }}
                >
                  {title}
                </h4>
              )}

              <p
                style={{
                  color: '#ccc',
                  fontSize: '1.1rem',
                  lineHeight: '1.5',
                  marginBottom: 0,
                }}
              >
                {message}
              </p>
            </ModalBody>

            <ModalFooter
              style={{
                borderTop: 'none',
                justifyContent: 'center',
                padding: '20px',
                background: 'transparent',
              }}
            >
              {onConfirm && (
                <Button
                  onClick={onConfirm}
                  style={{
                    backgroundColor: getColor(),
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 30px',
                    fontWeight: 'bold',
                    marginRight: '10px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {confirmText}
                </Button>
              )}

              <Button
                onClick={onClose}
                style={{
                  backgroundColor: '#6c757d',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '10px 30px',
                  fontWeight: 'bold',
                }}
              >
                {cancelText}
              </Button>
            </ModalFooter>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;