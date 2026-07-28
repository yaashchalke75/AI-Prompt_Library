/**
 * Mirrors the backend's consistent response envelope
 * ({ success, message, data, errors? }) so every API call can be typed
 * uniformly on the frontend.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string> | Array<{ index: number; error: string }>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Normalized error shape used internally once an API call fails. */
export interface AppError {
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}
