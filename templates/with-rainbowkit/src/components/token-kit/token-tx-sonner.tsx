"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast"

import { CrossCircledIcon, CheckCircledIcon, TimerIcon } from "@radix-ui/react-icons"

type ToastTypes = 'pending' | 'success' | 'error';

interface ToastDetail {
  description?: any;
  duration?: number;
}

interface Toast {
  id: string;
  message: string;
  description?: any;
  type: ToastTypes;
}

interface ToastContextProps {
  toasts: Toast[];
  toast: {
    pending: (message: string, { description, duration }: ToastDetail) => void;
    success: (message: string, { description, duration }: ToastDetail) => void;
    error: (message: string, { description, duration }: ToastDetail) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const handleShownDuration = (duration: number, id: string, removeToast: (id: string) => void) => {
  setTimeout(() => {
    removeToast(id);
  }, duration);
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const id = Date.now().toString();

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    pending: (message: string, { description, duration }: ToastDetail) => {
      setToasts((prev) => [...prev, { id, message, description, type: 'pending' }]);
      if(duration) handleShownDuration(duration, id, removeToast);
    },
    success: (message: string, { description, duration }: ToastDetail) => {
      setToasts((prev) => [...prev, { id, message, description, type: 'success' }]);
      if(duration) handleShownDuration(duration, id, removeToast);
    },
    error: (message: string, { description, duration }: ToastDetail) => {
      setToasts((prev) => [...prev, { id, message, description, type: 'error' }]);
      if(duration) handleShownDuration(duration, id, removeToast);
    },
    
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div>
      { toasts.map((toast) => (
        <div
          key={toast.id}
          className={`fixed bottom-4 flex right-4 toast toast-${toast.type} px-4 bg-white text-black rounded-lg shadow-md w-[420px] min-w-[320px] min-h-[90px]`}
        >
          <div className='w-7 flex items-center'>
            {toast.type === 'success' && <CheckCircledIcon className="w-4 h-4 text-text-black" />}
            {toast.type === 'pending' && <TimerIcon className="w-4 h-4 text-text-black" />}
            {toast.type === 'error' && <CrossCircledIcon className="w-4 h-4 text-text-black" />}
          </div>
          <div className='w-full'>
            <ToastTitle className='text-md mt-4'>{toast.message}</ToastTitle>
            {toast.description && (
              <ToastDescription className='text-md'>{toast.description}</ToastDescription>
            )}
          </div>
          <div className='w-6'>
            <button onClick={() => removeToast(toast.id)} className="absolute right-[10px] top-[10px] ml-4 text-red-400">
              <CrossCircledIcon className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const TokenTxSonnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
};

export { TokenTxSonnerProvider };

