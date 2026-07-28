import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse, AppError } from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Normalizes any axios failure (server error response, network failure, or
 * timeout) into a single AppError shape the UI can render consistently.
 */
export const normalizeApiError = (error: unknown): AppError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    if (axiosError.response) {
      const body = axiosError.response.data;
      const fieldErrors =
        body?.errors && !Array.isArray(body.errors) ? (body.errors as Record<string, string>) : undefined;

      return {
        message: body?.message || 'Something went wrong. Please try again.',
        fieldErrors,
        statusCode: axiosError.response.status,
      };
    }

    if (axiosError.code === 'ECONNABORTED') {
      return { message: 'The request timed out. Please check your connection and try again.' };
    }

    return {
      message: 'Unable to reach the server. Please check your network connection.',
    };
  }

  return { message: 'An unexpected error occurred.' };
};
