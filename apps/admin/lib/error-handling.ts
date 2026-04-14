import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Handles API errors and returns a user-friendly error message
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message || error.message || 'Error desconocido';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Error inesperado';
};

/**
 * Wraps an async function and handles errors with toast notifications
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (message: string) => void
): Promise<T | null> => {
  try {
    const data = await fn();
    onSuccess?.(data);
    return data;
  } catch (error) {
    const message = handleApiError(error);
    onError?.(message);
    console.error('API Error:', error);
    return null;
  }
};

/**
 * Creates a safe API call that returns either data or error
 */
export const safeApiCall = async <T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const message = handleApiError(error);
    return { data: null, error: message };
  }
};
