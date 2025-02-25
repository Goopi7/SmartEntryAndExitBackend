const express = require("express");
const router = express.Router();
const Student = require("../../mini_backend/Models/studentSchema")

router.route("/:rollnumber")
    .get(async(req , res) =>{
        try{
           
            const  rollNumber= req.params.rollnumber;
            console.log(rollNumber);
            let student
            if (rollNumber) {
                student = await Student.findOne({ rollNumber: rollNumber });
                if (!student) {
                    return res.status(404).json({ message: "Student not found" });
                }
            } else {
                student = await Student.find({});
                if (student.length === 0) {
                    return res.status(404).json({ message: "No students available" });
                }
            }

            res.json(student);
        } catch (err) {
            console.error("Error fetching student:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
         
    })

module.exports = router;
