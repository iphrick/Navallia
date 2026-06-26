"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { ToastMessage } from "@/types";

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => addToast({ type: "success", title, description }),
    [addToast]
  );
  const error = useCallback(
    (title: string, description?: string) => addToast({ type: "error", title, description }),
    [addToast]
  );
  const warning = useCallback(
    (title: string, description?: string) => addToast({ type: "warning", title, description }),
    [addToast]
  );
  const info = useCallback(
    (title: string, description?: string) => addToast({ type: "info", title, description }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
