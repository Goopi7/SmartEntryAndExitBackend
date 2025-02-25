const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    
        rollNumber : {type:String , required:true,unique: true},
        name:{type:String , required:true},
        branch : {type:String , required:true},
        mail:{type:String , required:true,unique: true},
},{ timestamps: true });
const Student = mongoose.model("Student",studentSchema);

module.exports=Student;