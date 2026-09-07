'use client';

import { useState, useEffect } from 'react';
import { useToast, Toast } from '@/lib/useToast';

export default function ToastHost() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-md animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-white/80 hover:text-white font-bold text-lg leading-none p-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
