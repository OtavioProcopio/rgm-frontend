type ApiErrorParams = {
  status: number;
  message: string;
  body?: unknown;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor({ status, message, body }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
