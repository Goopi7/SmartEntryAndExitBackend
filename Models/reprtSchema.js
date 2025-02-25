const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        rollNumber : {type:String , required:true,unique: true},
        name:{type:String , required:true},
        branch : {type:String , required:true},
        student:{type:String,required:true},
        mail:{type:String , required:true,unique: true},
},{ timestamps: true });
const Report = mongoose.model("Report",reportSchema);

module.exports=Report;