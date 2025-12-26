"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormInput from "@/components/FormInput";
import Modal from "@/components/ui/Modal";

// 1. Define validation schema
const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// 2. Derive TypeScript types
type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName, setUserName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const toastId = toast.loading("Creating your account...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real app, make API call here
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // eslint-disable-next-line no-console
      console.log("Form Submitted:", data);

      toast.success("Account created successfully!", { id: toastId });

      setUserName(data.name);
      setShowWelcomeModal(true);
      reset();
    } catch (error) {
      toast.error("Failed to create account. Please try again.", {
        id: toastId,
      });
      // eslint-disable-next-line no-console
      console.error("Signup error:", error);
    }
  };

  const handleModalConfirm = () => {
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
          Create Account
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Join us today and get started
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 border border-gray-200 rounded-lg shadow-lg"
        >
          <FormInput
            label="Full Name"
            name="name"
            register={register}
            error={errors.name}
            placeholder="John Doe"
            required
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            placeholder="john@example.com"
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Log in
            </a>
          </p>
        </form>

        <Modal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          title="Welcome to TTA-Urban! 🎉"
          onConfirm={handleModalConfirm}
          confirmText="Go to Login"
          cancelText="Stay Here"
        >
          <p className="text-gray-700">
            Hi <span className="font-semibold">{userName}</span>! Your account
            has been created successfully.
          </p>
          <p className="text-gray-600 mt-2">
            You can now log in and start managing urban complaints.
          </p>
        </Modal>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            📝 Form Features:
          </p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✅ Real-time validation with Zod</li>
            <li>✅ Password strength requirements</li>
            <li>✅ Accessible form controls</li>
            <li>✅ Toast notifications for feedback</li>
            <li>✅ Modal confirmation dialog</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
