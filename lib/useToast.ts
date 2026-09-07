'use client';

import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const TOAST_EVENT = 'app:toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: CustomEvent<Toast>) => {
      setToasts((prev) => [...prev, e.detail]);
    };
    window.addEventListener(TOAST_EVENT, handler as EventListener);
    return () => window.removeEventListener(TOAST_EVENT, handler as EventListener);
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const toast: Toast = {
      id: Math.random().toString(36).slice(2),
      type,
      message,
    };
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

export function toast(type: ToastType, message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: Math.random().toString(36).slice(2),
        type,
        message,
      },
    })
  );
}

export const toastSuccess = (message: string) => toast('success', message);
export const toastError = (message: string) => toast('error', message);
export const toastInfo = (message: string) => toast('info', message);
