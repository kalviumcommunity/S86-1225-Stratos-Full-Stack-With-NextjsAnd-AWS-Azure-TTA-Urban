import { UseFormRegister, FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  type?: string;
  register: UseFormRegister<any>;
  name: string;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
}

export default function FormInput({
  label,
  type = "text",
  register,
  name,
  error,
  placeholder,
  required = false,
}: FormInputProps) {
  return (
    <div className="mb-3 sm:mb-4">
      <label
        htmlFor={name}
        className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 dark:text-red-400 ml-1">*</span>
        )}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full text-sm sm:text-base border p-2 sm:p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
            : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        }`}
      />
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
