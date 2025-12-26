interface LoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullScreen?: boolean;
}

/**
 * Loader Component
 * Provides visual feedback during async operations
 * Accessible with ARIA attributes
 */
export default function Loader({
  size = "medium",
  text = "Loading...",
  fullScreen = false,
}: LoaderProps) {
  const sizeClasses = {
    small: "w-6 h-6 border-2",
    medium: "w-10 h-10 border-3",
    large: "w-16 h-16 border-4",
  };

  const spinner = (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div
        className={`${sizeClasses[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
      <span className="sr-only">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Inline Loader Component
 * Smaller loader for inline use (buttons, forms)
 */
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      {text && <span className="text-sm">{text}</span>}
      <span className="sr-only">{text || "Loading"}</span>
    </div>
  );
}

/**
 * Progress Bar Component
 * Shows progress for operations with known duration
 */
export function ProgressBar({
  progress,
  text,
}: {
  progress: number;
  text?: string;
}) {
  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {text && <p className="text-sm text-gray-600 mb-2">{text}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">{progress}%</p>
    </div>
  );
}
