import { API_BASE_URL } from "./constants.js";
import { ApiError } from "./apiErrors.js";

let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(
      `${API_BASE_URL}/users/refresh-token`,
      {
        method: "POST",
        credentials: "include",
      }
    )
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function apiClient(path, options = {}) {
  const headers = {
    ...options.headers,
  };

  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const body = await response.json().catch(() => null);

  // If access token expired, try to refresh it
  if (response.status === 401 && path !== "/users/refresh-token") {
    const refreshSucceeded = await refreshAccessToken();

    if (refreshSucceeded) {
      // Backend has set a new access-token cookie.
      // Retry the original request.
      const retryResponse = await fetch(
        `${API_BASE_URL}${path}`,
        {
          ...options,
          credentials: "include",
          headers,
        }
      );

      const retryBody = await retryResponse.json().catch(() => null);

      if (!retryResponse.ok) {
        throw new ApiError(
          retryBody?.message || "Request failed",
          retryResponse.status,
          retryBody
        );
      }

      return retryBody;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      body?.message || "Request failed",
      response.status,
      body
    );
  }

  return body;
}

export { apiClient };
