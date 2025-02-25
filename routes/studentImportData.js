const express = require("express");
const students = require("../data/studentdata");
const Student = require("../Models/studentSchema");
const router =express.Router();
// console.log(students.data);

router.route("/")
    .post(async (req,res)=>{
        try{
            console.log(students.data);
            const studentInDB = await Student.insertMany(students.data);
        res.json(studentInDB);
        console.log(studentInDB);
        }
        catch(err)
        {
            console.log(err);
            res.status(500).json({message:"failed to insert the data"})
        }
        
    })
   

module.exports = router;