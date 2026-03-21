import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Warning } from '@phosphor-icons/react';

/**
 * ConfirmModal — centered confirmation dialog.
 * Props:
 *   open       boolean
 *   title      string
 *   message    string
 *   confirmLabel  string (default "Delete")
 *   onConfirm  () => void
 *   onCancel   () => void
 *   danger     boolean (default true — red confirm button)
 */
const ConfirmModal = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  danger = true,
}) => {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-surface-98 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Warning size={24} weight="fill" className="text-red-400" />
                </div>
              </div>

              {/* Text */}
              <h3 className="text-white font-semibold text-base text-center mb-1">{title}</h3>
              {message && (
                <p className="text-white/40 text-sm text-center leading-relaxed">{message}</p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 bg-white/[0.07] hover:bg-white/[0.12] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all ${
                    danger
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'hover:opacity-90'
                  }`}
                  style={!danger ? { backgroundColor: 'var(--accent)' } : {}}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
