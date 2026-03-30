"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm p-0 rounded-2xl shadow-2xl border-0 overflow-hidden outline-none bg-white w-full max-w-lg open:animate-in open:fade-in open:zoom-in-95"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-brand-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </dialog>
  );
}
