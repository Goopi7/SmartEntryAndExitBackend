const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        rollNumber : {type:String , required:true},
        name:{type:String , required:true},
        branch : {type:String , required:true},
        mail:{type:String , required:true},
        checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    lateEntryDuration: { type: Number, default: 0 }, 
    earlyExitDuration: { type: Number, default: 0 }, 
    date: { type: String, required: true, default: () => new Date().toISOString().split("T")[0] },
});
const Report = mongoose.model("Report",reportSchema);

module.exports=Report;