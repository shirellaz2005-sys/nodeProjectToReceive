import mongoose, { connect } from "mongoose";
export const connectToDB=async()=>{
    try{
        const mongo_uri=process.env.mongo_uri?? 'mongodb://localhost:27017/test';
        await connect(mongo_uri);
        console.log("mongo connected successfully");
    } catch(error){
        console.log(error.message);
        
    }
    
}