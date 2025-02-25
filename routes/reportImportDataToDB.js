const express = require("express");
const Report = require("../Models/reportSchema");
const Student = require("../Models/studentSchema");

const router = express.Router();

router.post("/:rollNumber", async (req, res) => {
    try {
        const { action } = req.body; // Expect action as "IN" or "OUT"
        const rollNumber = req.params.rollNumber; // Get roll number from params

        let student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Ensure OFFICIAL_CHECKIN and CHECKOUT are for today
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format for comparison

        const OFFICIAL_CHECKIN = new Date(today);
        OFFICIAL_CHECKIN.setHours(9, 0, 0, 0); // 9:00 AM today

        const OFFICIAL_CHECKOUT = new Date(today);
        OFFICIAL_CHECKOUT.setHours(16, 30, 0, 0); // 4:30 PM today

        let report = await Report.findOne({ rollNumber, date: todayStr });

        const currentTime = new Date();
        let lateEntry = 0, earlyExit = 0;

        if (action === "IN") {
            if (!report) {
                // Calculate late entry (only if after 9 AM)
                lateEntry = Math.max(0, (currentTime - OFFICIAL_CHECKIN) / (1000 * 60));

                report = new Report({
                    student: student._id,
                    rollNumber: student.rollNumber,
                    name: student.name,
                    branch: student.branch,
                    mail: student.mail,
                    checkInTime: currentTime,
                    checkOutTime: null,
                    lateEntryDuration: lateEntry,
                    earlyExitDuration: 0,
                    date: todayStr, // Ensure the date format matches MongoDB
                });

            } else {
                return res.status(400).json({ message: "Already checked in today." });
            }
        } 
        else if (action === "OUT") {
            if (report && !report.checkOutTime) {
                // Calculate early exit (only if before 4:30 PM)
                earlyExit = Math.max(0, (OFFICIAL_CHECKOUT - currentTime) / (1000 * 60));

                report.checkOutTime = currentTime;
                report.earlyExitDuration = earlyExit;
            } else {
                return res.status(400).json({ message: "Check-in required before checkout." });
            }
        }

        await report.save();
        return res.json({ message: `Successfully marked ${action}`, lateEntry, earlyExit });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update report" });
    }
});

module.exports = router;
