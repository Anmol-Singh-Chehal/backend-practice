class ApiError extends Error{
    constructor(
        public statusCode: number,
        public message: string,
        public stack: string,
        public errors: Array<string>,
        public data: string | null,
        public success: boolean,
    ){
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.data = null;
        this.success = false;

        if(stack){
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;