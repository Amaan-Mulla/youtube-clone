class ApiError extends Error {
  constructor(message, statusCode = 500, data = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

export { ApiError };
