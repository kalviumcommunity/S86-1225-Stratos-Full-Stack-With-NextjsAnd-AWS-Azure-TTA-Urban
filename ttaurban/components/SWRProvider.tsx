"use client";
import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { fetcher } from "@/lib/fetcher";

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher, // Default fetcher for all useSWR hooks
        revalidateOnFocus: true, // Refetch when window regains focus
        revalidateOnReconnect: true, // Refetch when network reconnects
        shouldRetryOnError: true, // Retry on error
        errorRetryCount: 3, // Maximum retry attempts
        errorRetryInterval: 2000, // 2 seconds between retries
        dedupingInterval: 2000, // Dedupe requests within 2 seconds
        focusThrottleInterval: 5000, // Throttle focus revalidation to 5 seconds
        loadingTimeout: 3000, // Show error if loading takes > 3 seconds

        // Global error handler
        onError: (error, key) => {
          // eslint-disable-next-line no-console
          console.error("SWR Error:", { error, key });

          // You can add custom error tracking here
          // e.g., send to error monitoring service
        },

        // Global success handler
        onSuccess: (data, key) => {
          // eslint-disable-next-line no-console
          console.log("SWR Success:", {
            key,
            dataSize: JSON.stringify(data).length,
          });
        },

        // Cache provider - using Map for better performance
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
