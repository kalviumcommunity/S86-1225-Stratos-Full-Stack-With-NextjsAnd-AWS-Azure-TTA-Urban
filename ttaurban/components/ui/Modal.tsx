"use client";
import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
}

/**
 * Accessible Modal Component
 * Features:
 * - Focus trap
 * - ESC key to close
 * - Click outside to close
 * - ARIA attributes for accessibility
 * - Keyboard navigation
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Show modal
      dialog.showModal();

      // Focus first focusable element
      const focusableElements = dialog.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      dialog.close();

      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;

      if (!isInDialog) {
        onClose();
      }
    };

    dialog.addEventListener("keydown", handleEscape);
    dialog.addEventListener("click", handleClickOutside);

    return () => {
      dialog.removeEventListener("keydown", handleEscape);
      dialog.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      aria-modal="true"
      className="backdrop:bg-black backdrop:bg-opacity-50 rounded-lg shadow-2xl dark:shadow-gray-900/50 p-0 max-w-xs sm:max-w-md md:max-w-lg w-full"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="modal-title"
            className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h2>
        </div>

        {/* Content */}
        <div
          id="modal-description"
          className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 dark:text-gray-300"
        >
          {children}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
