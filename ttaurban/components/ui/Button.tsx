interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  label,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";

  const variantStyles = {
    primary:
      "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-indigo-500",
    secondary:
      "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500",
    danger:
      "bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500",
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
    >
      {label}
    </button>
  );
}
