"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Loader, { InlineLoader, ProgressBar } from "@/components/ui/Loader";

/**
 * Feedback UI Demo Page
 * Demonstrates all feedback patterns: Toasts, Modals, and Loaders
 */
export default function FeedbackDemoPage() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Toast Examples
  const showSuccessToast = () => {
    toast.success("Operation completed successfully!");
  };

  const showErrorToast = () => {
    toast.error("Something went wrong!");
  };

  const showLoadingToast = () => {
    const toastId = toast.loading("Processing...");
    setTimeout(() => {
      toast.success("Done!", { id: toastId });
    }, 2000);
  };

  const showCustomToast = () => {
    toast("Custom message with emoji! 🎉", {
      icon: "👏",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  // Simulate API Call with Progress
  const simulateUpload = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success("Upload complete!");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Simulate Loading State
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Data loaded successfully!");
    }, 3000);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Feedback UI Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Interactive examples of toasts, modals, and loaders
        </p>

        {/* Toast Notifications Section */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🔔 Toast Notifications
          </h2>
          <p className="text-gray-600 mb-4">
            Instant feedback for quick actions and updates
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={showSuccessToast}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={showErrorToast}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={showLoadingToast}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Loading Toast
            </button>
            <button
              onClick={showCustomToast}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Custom Toast
            </button>
          </div>
        </section>

        {/* Modal Dialogs Section */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            💬 Modal Dialogs
          </h2>
          <p className="text-gray-600 mb-4">
            Blocking feedback for important decisions
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open Info Modal
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Open Delete Modal
            </button>
          </div>
        </section>

        {/* Loaders Section */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ⏳ Loading Indicators
          </h2>
          <p className="text-gray-600 mb-4">
            Visual feedback for ongoing processes
          </p>

          <div className="space-y-6">
            {/* Standard Loaders */}
            <div>
              <h3 className="font-medium mb-3">Loader Sizes:</h3>
              <div className="flex items-center gap-8">
                <Loader size="small" text="Small" />
                <Loader size="medium" text="Medium" />
                <Loader size="large" text="Large" />
              </div>
            </div>

            {/* Inline Loader */}
            <div>
              <h3 className="font-medium mb-3">Inline Loader (for buttons):</h3>
              <button
                disabled
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <InlineLoader text="Processing..." />
              </button>
            </div>

            {/* Progress Bar */}
            <div>
              <h3 className="font-medium mb-3">Progress Bar:</h3>
              <ProgressBar progress={progress} text="Uploading files..." />
              <button
                onClick={simulateUpload}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simulate Upload
              </button>
            </div>

            {/* Full Screen Loader */}
            <div>
              <h3 className="font-medium mb-3">Full Screen Loader:</h3>
              <button
                onClick={simulateLoading}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Trigger Full Screen Loader"}
              </button>
            </div>
          </div>
        </section>

        {/* User Flow Example */}
        <section className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border-2 border-indigo-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🔄 Complete User Flow Example
          </h2>
          <p className="text-gray-600 mb-4">
            Toast → Modal → Loader → Toast (Success/Failure)
          </p>
          <button
            onClick={() => {
              toast.loading("Preparing action...");
              setTimeout(() => {
                setShowModal(true);
              }, 1000);
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Start Complete Flow
          </button>
        </section>

        {/* Accessibility Notes */}
        <section className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ♿ Accessibility Features:
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>✅ ARIA live regions for screen readers</li>
            <li>✅ Keyboard navigation (ESC to close modals)</li>
            <li>✅ Focus management in modals</li>
            <li>✅ Color contrast for visibility</li>
            <li>✅ Loading state announcements</li>
          </ul>
        </section>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Information"
        onConfirm={() => {
          toast.success("Confirmed!");
        }}
        confirmText="Got it!"
      >
        <p className="text-gray-700">
          This is an informational modal. It helps communicate important
          messages to users without leaving the current page.
        </p>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Item?"
        variant="danger"
        onConfirm={() => {
          const toastId = toast.loading("Deleting...");
          setTimeout(() => {
            toast.success("Item deleted successfully!", { id: toastId });
          }, 1500);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      >
        <p className="text-gray-700">
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
      </Modal>

      {isLoading && <Loader fullScreen text="Loading data..." />}
    </main>
  );
}
