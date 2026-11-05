export const validateSchema=(schema)=>{
    const mdl=(req,res,next)=>{
        const {error,value}=schema.validate(req.body)
        if(error){
        return res.status(409).json(error)
        }
        else{
             return req.body=value;
             next();

        }
        
           

       
    };
    return mdl;
};