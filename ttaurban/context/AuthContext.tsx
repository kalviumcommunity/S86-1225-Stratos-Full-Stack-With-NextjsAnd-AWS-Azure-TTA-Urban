"use client";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refresh access token using refresh token from cookie
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        // Don't throw error - no refresh token is expected on first load
        return false;
      }

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      // Silently fail - this is expected when no refresh token exists
      // Only log in development for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("No active session to restore");
      }
      // Clear auth state on refresh failure
      setAccessToken(null);
      setUser(null);
      return false;
    }
  };

  /**
   * Initialize auth state on mount
   * Try to refresh token if refresh token cookie exists
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshToken(); // Try to restore session
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract validation errors if present
        if (data.meta?.issues) {
          const errorMessages = data.meta.issues
            .map((issue: any) => issue.message)
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        toast.success("Login successful!");
        console.log("User logged in:", data.user);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  /**
   * Signup new user
   */
  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      if (data.success) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        toast.success("Signup successful!");
        console.log("User signed up:", data.user);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setAccessToken(null);
      setUser(null);
      toast.success("Logged out successfully");
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server request fails
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
}
