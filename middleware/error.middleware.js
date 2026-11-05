export const middlewareHandler=(err,req,res,next)=>{
    const {message="",status=500,type="server error"}=err
    return res.status(status).json({err:{msg:message,type}});
};