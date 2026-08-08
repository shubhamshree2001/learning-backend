// this class Error we get from node js by default
class ApiError extends Error {

    // here in constructor we are passing the status code, message, errors, stack
    //then we are overriding the constructor of Error class
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message); // super is used to call the constructor of the parent class
        this.statusCode = statusCode; // 400, 401, 403, 404, 500
        this.data = null; // data is the data of the response
        this.message = message; // message is the message of the response
        this.success = false; // success is the success of the response
        this.errors = errors; // errors is the errors of the response
        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
            // here we are capturing the stack trace of the error
            //passing context of the class which is ApiError
        }
    }
}

// learn what is there in data field in error object ??


export default ApiError;