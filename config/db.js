import mongoose, { connect } from "mongoose";
export const connectToDB=async()=>{
    try{
        const mongoUri=process.env.MONGO_URI || 'mongodb://localhost:27017/test';
        await connect(mongoUri);
        console.log("mongo connected successfully");
    } catch(error){
        console.log(error.message);
        
    }
    
}