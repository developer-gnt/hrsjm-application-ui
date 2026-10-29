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

      // Extract specific validation details if available
      let validationDetails: string | undefined;
      if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
        validationDetails = data.error.details.filter(Boolean).join('\n');
      } else if (typeof data?.error?.details === 'string') {
        validationDetails = data.error.details;
      } else if (Array.isArray(data?.details) && data.details.length > 0) {
        validationDetails = data.details.filter(Boolean).join('\n');
      } else if (Array.isArray(data?.message) && data.message.length > 0) {
        validationDetails = data.message.filter(Boolean).join('\n');
      }

      let message =
        validationDetails ||
        data?.message ||
        data?.error ||
        (typeof data === 'string' ? data : 'An unexpected server error occurred.');

      if (typeof message === 'string') {
        const lower = message.toLowerCase();
        if (
          lower.includes('localhost') ||
          lower.includes('proxy error') ||
          lower.includes('econnrefused') ||
          lower.includes('axioserror') ||
          lower.includes('<html') ||
          lower.includes('fetch failed')
        ) {
          message = 'Unable to reach the server. Please check your connection and try again.';
        }
      }
      return new ApiError(
        message,
        status,
        data?.error?.details || data?.errors || data?.details,
        data
      );
    } else if (error.request) {
      return new ApiError(
        'Unable to reach the server. Please check your internet connection.',
        0
      );
    }
    const cleanMsg =
      error.message && !error.message.toLowerCase().includes('axios')
        ? error.message
        : 'Unable to reach the server. Please check your connection.';
    return new ApiError(cleanMsg, 500);
  }
}
