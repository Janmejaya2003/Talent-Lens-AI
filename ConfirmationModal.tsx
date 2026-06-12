import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header Accent */}
            <div className={cn(
              "h-1.5 w-full",
              type === 'danger' ? "bg-error" : "bg-warning"
            )} />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  type === 'danger' ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                )}>
                  {type === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-text-primary tracking-tight">{title}</h3>
                    <button 
                      onClick={onClose}
                      className="text-text-secondary hover:text-text-primary transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "px-6 py-2 rounded-lg text-xs font-bold text-white transition-all active:scale-[0.98] shadow-lg",
                    type === 'danger' 
                      ? "bg-error shadow-error/20 hover:bg-error/90" 
                      : "bg-warning shadow-warning/20 hover:bg-warning/90"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
