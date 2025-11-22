export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  try {
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    const res = await fetch(path, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      // User-friendly error messages
      const message = error.message || 
        (res.status === 401 ? "Please sign in to continue" :
         res.status === 403 ? "You don't have permission to do this" :
         res.status === 404 ? "Resource not found" :
         res.status === 500 ? "Something went wrong. Please try again later" :
         "Request failed. Please try again");
      throw new Error(message);
    }

    const data = await res.json();
    return data as T;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Network error. Please check your connection and try again");
  }
}
