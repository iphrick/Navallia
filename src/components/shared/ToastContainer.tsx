"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-l-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300",
  error: "border-l-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300",
  warning: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300",
  info: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border-l-4 p-4 shadow-lg backdrop-blur-sm animate-fade-in",
              colors[toast.type]
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
