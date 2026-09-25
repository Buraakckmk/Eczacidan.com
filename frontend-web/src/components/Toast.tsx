import { CheckCircle2, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, durationMs = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [message, onClose, durationMs]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-gray-900/95 backdrop-blur-md px-4 py-3 text-white shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-4 border border-gray-800">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition"
        title="Kapat"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
