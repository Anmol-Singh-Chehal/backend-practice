class ApiError extends Error {
    public statusCode: number;
    public errors: string[];
    public data: any;
    public success: boolean;
    public stack?: string;

    constructor(
        statusCode: number,
        message: string = "Something went wrong.",
        errors: string[] = [],
        data: any = null,
        success: boolean = false,
        stack: string = "",
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = data;
        this.success = success;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;