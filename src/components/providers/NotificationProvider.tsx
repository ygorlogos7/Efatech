"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { clsx } from "clsx";

type NotificationType = "success" | "error" | "warning";

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  title?: string;
}

interface NotificationContextProps {
  notify: (message: string, type: NotificationType, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (message: string, type: NotificationType = "success", title?: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type, title }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      remove(id);
    }, 5000);
  };

  const remove = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Container de Toasts */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 w-80 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={clsx(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right duration-300",
              n.type === "success" && "bg-green-50/90 border-green-200 text-green-800",
              n.type === "error" && "bg-red-50/90 border-red-200 text-red-800",
              n.type === "warning" && "bg-amber-50/90 border-amber-200 text-amber-800"
            )}
          >
            <div className="shrink-0 pt-0.5">
              {n.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {n.type === "error" && <XCircle className="w-5 h-5 text-red-600" />}
              {n.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
            </div>
            <div className="flex-1 min-w-0">
               {n.title && <h4 className="text-sm font-black uppercase tracking-tight mb-0.5 italic">{n.title}</h4>}
               <p className="text-xs font-bold leading-relaxed opacity-90">{n.message}</p>
            </div>
            <button
               onClick={() => remove(n.id)}
               className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
               <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
