"use client";
import { Toaster } from "react-hot-toast";

/**
 * Toast Provider Component
 * Provides global toast notifications throughout the application
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: "#fff",
          color: "#333",
          fontSize: "14px",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        // Success toast
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
          style: {
            border: "1px solid #10b981",
          },
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        },
        // Error toast
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
          style: {
            border: "1px solid #ef4444",
          },
          ariaProps: {
            role: "alert",
            "aria-live": "assertive",
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#fff",
          },
          style: {
            border: "1px solid #3b82f6",
          },
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        },
      }}
    />
  );
}
