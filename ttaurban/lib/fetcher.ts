/**
 * Fetcher utility for SWR
 * Handles API requests with proper error handling
 */

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    // Attach extra info to the error object
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * Fetcher with authentication token
 * Use this for protected endpoints
 */
export const authenticatedFetcher = async (url: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * Generic fetcher with custom options
 */
export const fetcherWithOptions = async (
  url: string,
  options?: RequestInit
) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};
