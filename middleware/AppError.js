export class AppError extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode=statusCode;
        this.type=statusCode>=400&&statusCode<500? 'fail':'error';
        Error.captureStackTrace(this,this.constructor)
    }
}