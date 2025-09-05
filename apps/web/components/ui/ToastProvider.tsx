'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: string; title?: string; description?: string; variant?: 'default'|'success'|'error' }; 

type ToastContextValue = {
  show: (t: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, ...t };
    setToasts((prev) => [...prev, toast]);
    // Auto-dismiss after 3.5s
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded shadow px-4 py-2 text-sm text-white ${t.variant === 'error' ? 'bg-red-600' : t.variant === 'success' ? 'bg-green-600' : 'bg-gray-900'}`}>
            {t.title ? <div className="font-medium">{t.title}</div> : null}
            {t.description ? <div>{t.description}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

