import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PopupToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "warning" | "danger" | "info";
  onClose: () => void;
}

const typeColors: Record<NonNullable<PopupToastProps["type"]>, string> = {
  success: "#22c55e",
  warning: "#fbbf24",
  danger: "#ef4444",
  info: "#3b82f6",
};

export default function PopupToast({
  isOpen,
  message,
  type = "info",
  onClose,
}: PopupToastProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(onClose, 3600);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="popup-toast"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
          style={{ borderColor: typeColors[type] }}
        >
          <span className="popup-toast-dot" style={{ backgroundColor: typeColors[type] }} />
          <p>{message}</p>
          <button type="button" onClick={onClose} aria-label="Fechar alerta">
            <i className="bi bi-x-lg"></i>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
