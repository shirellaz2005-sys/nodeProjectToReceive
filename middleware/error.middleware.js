export const middlewareHandler=(err,req,res,next)=>{
    const statusCode=err.statusCode||500;
    const message=err.message|| "שגיאה פנימית בשרת";
    const type=err.type || 'error';
     return res.status(statusCode).json({
        success:false,
        err:{
            msg:message,
            type:type
        }
     });
   
};