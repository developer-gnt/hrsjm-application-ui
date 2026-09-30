export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors?: Record<string, string[]> | string[];
  public rawData?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string[]> | string[],
    rawData?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.rawData = rawData;

    // Set prototype explicitly for custom error in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromAxiosError(error: any): ApiError {
    if (error.response) {
      const { data, status } = error.response;
      const message =
        data?.message ||
        data?.error ||
        (typeof data === 'string' ? data : 'An unexpected server error occurred.');
      return new ApiError(message, status, data?.errors, data);
    } else if (error.request) {
      return new ApiError(
        'Unable to reach the server. Please check your internet connection.',
        0
      );
    }
    return new ApiError(error.message || 'An unknown error occurred.', 500);
  }
}
