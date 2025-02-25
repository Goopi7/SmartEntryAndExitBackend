const express = require("express");
const Report = require("../Models/reportSchema");
const Student = require("../Models/studentSchema");

const router = express.Router();

router.route("/:rollNumber").get(async (req, res) => {
    try {
        const rollNumber = req.params.rollNumber;

        // Check if student exists
        let student = await Student.findOne({ rollNumber });
        console.log(student);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if a report already exists for this student
        const existingReport = await Report.findOne({ rollNumber });

        if (existingReport) {
            return res.status(200).json({
                message: "Report already exists",
                report: existingReport, 
            });
        } 

        // If no existing report, return student data
        return res.status(200).json({
            message: "Student found, no report exists",
            student
        });

    } catch (err) {
        console.error("Error fetching report:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
// Fetch all students
router.get("/", async (req, res) => {
    try {
        const students = await Report.find({});

        if (students.length === 0) {
            return res.status(404).json({ message: "No students available" });
        }

        return res.json(students);
    } catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;
