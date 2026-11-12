export class AppError extends Error{
    constructor(message,statosCode){
        super(message)
        this.statosCode=statosCode;
        this.type=statosCode>=400&&statosCode<500? 'fail':'error';
        Error.captureStackTrace(this,this.constructor)
    }
}