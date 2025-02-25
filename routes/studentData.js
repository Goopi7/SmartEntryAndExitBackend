const express = require("express");
const router = express.Router();
const Student = require("../Models/studentSchema");

// Fetch student by roll number
router.get("/:rollNumber", async (req, res) => {
    try {
        const rollNumber = req.params.rollNumber.trim(); // Remove unwanted spaces
        console.log("Requested Roll Number:", rollNumber);

        // Fetch student from database
        const student = await Student.findOne({ rollNumber });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.json(student);
    } catch (err) {
        console.error("Error fetching student:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Fetch all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find({});

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
