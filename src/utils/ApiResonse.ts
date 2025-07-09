class ApiResponse{
    public success:boolean = false;
    constructor(
        public statusCode:number,
        public data: any,
        public message: string,
    ){  
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.success = statusCode < 400;
    }
}