export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
  timestamp?: string;
}

export class ResponseBuilder {
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(error: string, details?: string[]): ApiResponse {
    return {
      success: false,
      error,
      details: details || [],
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success'
  ): ApiResponse<{ items: T[]; pagination: { total: number; page: number; limit: number } }> {
    return {
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
        },
      },
      message,
      timestamp: new Date().toISOString(),
    };
  }
}

export default ResponseBuilder;
