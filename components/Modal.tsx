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
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // A native dialog closes itself on Escape without telling React. Listening
  // for its own close event keeps `isOpen` honest, otherwise the dialog cannot
  // be reopened afterwards.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  /** Clicking the backdrop means clicking the dialog outside its own content. */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby="cg-modal-title"
      // `m-auto` restores the centring that Tailwind's preflight removes by
      // zeroing every margin — without it a modal dialog sits top-left.
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-ui-border bg-ui-surface p-0 text-ui-text-primary outline-none open:animate-in open:fade-in open:zoom-in-95 duration-200 ease-cg backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-ui-border bg-ui-bg-alt px-6 py-4">
          <h2 id="cg-modal-title" className="text-xl">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 text-sage transition-colors hover:bg-ui-surface hover:text-ui-text-primary focus:outline-none focus:ring-4 focus:ring-accent/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </dialog>
  );
}
