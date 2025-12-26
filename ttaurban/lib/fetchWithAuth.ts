/**
 * API Fetcher with Automatic Token Refresh
 * Handles authentication tokens and automatic retry on 401 errors
 *
 * Usage:
 * ```typescript
 * const data = await fetchWithAuth('/api/users');
 * const result = await fetchWithAuth('/api/complaints', {
 *   method: 'POST',
 *   body: JSON.stringify(complaintData),
 * });
 * ```
 */

/**
 * Refresh access token
 * Returns new access token or null if refresh fails
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // Include refresh token cookie
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.accessToken || null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

/**
 * Get current access token from memory
 * In a real app, this would be managed by AuthContext
 */
let currentAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}

/**
 * Fetch with automatic authentication and token refresh
 *
 * @param url API endpoint URL
 * @param options Fetch options
 * @returns Response from the API
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Add access token to headers
  const headers = new Headers(options.headers);

  if (currentAccessToken) {
    headers.set("Authorization", `Bearer ${currentAccessToken}`);
  }

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Always include cookies
  });

  // If 401 Unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log("Access token expired, attempting refresh...");

    const newToken = await refreshAccessToken();

    if (newToken) {
      currentAccessToken = newToken;
      console.log("Token refreshed successfully, retrying request...");

      // Retry the original request with new token
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      console.error("Token refresh failed, user needs to login again");
      // Redirect to login or show error
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return response;
}

/**
 * Fetch with auth and auto-parse JSON
 *
 * @param url API endpoint URL
 * @param options Fetch options
 * @returns Parsed JSON response
 */
export async function fetchJSON<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}
