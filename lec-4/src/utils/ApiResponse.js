//this class we get from express js by default
class ApiResponse{
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

// read about server status code
export default ApiResponse;