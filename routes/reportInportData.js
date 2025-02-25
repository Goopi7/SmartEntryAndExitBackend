const express = require("express");
const student = require("../../mini_backend/data/studentdata");
const Report = require("../../mini_backend/Models/reprtSchema");
const Student = require("../../mini_backend/Models/studentSchema");

const router = express.Router();


router.route("/:rollNumber")
    .get(async (req,res)=>{
        try{
            const rollNumber = req.params.rollNumber;
            
            let student=await Student.findOne({ rollNumber: rollNumber });
            
                
                if (!student) {
                    return res.status(404).json({ message: "Student not found" });
                }
            const excestinginReport = await Report.findOne({rollNumber});
            if(excestinginReport)
                {
                    return res.status(400).json({message:"alredy exist in the data"});
                } 
            const newReport = new Report({
                student:student._id,
                rollNumber:student.rollNumber,
                name:student.name,
                branch:student.branch,
                section:student.section,
                mail:student.mail,
            })

            await newReport.save();
        
        }
        catch(err)
        {
            console.log(err);
            res.status(500).json({message:"failed to insert the data in to report"})
        }
        
    })
   

module.exports = router;