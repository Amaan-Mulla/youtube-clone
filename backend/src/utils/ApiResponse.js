class ApiResponse {
    constructor(statusCode, message = "Success", data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400; // success if status code is less than 400
    }
}

export { ApiResponse };