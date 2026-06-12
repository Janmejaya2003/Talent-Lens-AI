import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', isOpen, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
        >
          <div className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-md",
            type === 'success' 
              ? "bg-emerald-50/90 border-emerald-100 text-emerald-900" 
              : "bg-red-50/90 border-red-100 text-red-900"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              type === 'success' ? "bg-emerald-100" : "bg-red-100"
            )}>
              {type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold tracking-tight">{message}</p>
            </div>

            <button 
              onClick={onClose}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 opacity-40" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
