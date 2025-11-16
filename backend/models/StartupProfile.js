 import mongoose from 'mongoose';
 const StartupSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",unique:true,required:true},
    startupName:{type:String,required:true},
    founderName:{type:String,required:true},
    industry:{type:String,required:true},
    problemStatement:{type:String,required:true},
    solution:{type:String,required:true},
    stage:{type:String,enum:['idea','prototype','MVP','Scale'],required:true},
    fundingNeeded:{type:Number,required:true},
    location:{type:String,required:true}
 },{timestamps:true})
 const Startup=mongoose.model('StartupProfile',StartupSchema);
 export default Startup;
