const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
        rollNumber : {type:String , required:true,unique: true},
        name:{type:String , required:true},
        branch : {type:String , required:true},
        mail:{type:String , required:true,unique: true},
        totalLateEntries: { type: Number, default: 0 },
});
const Student = mongoose.model("Student",studentSchema);

module.exports=Student;