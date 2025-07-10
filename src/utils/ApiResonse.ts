class ApiResponse{
    public success:boolean;
    public statusCode:number;
    public data: any;
    public message: string;
    
    constructor(
        statusCode:number,
        data:any,
        message:string,
    ){  
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.success = statusCode < 400;
    }
}