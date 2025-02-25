const express = require("express");
const Report = require("../Models/reportSchema");
const Student = require("../Models/studentSchema");

const router = express.Router();


const OFFICIAL_CHECKIN = new Date();
OFFICIAL_CHECKIN.setHours(9, 0, 0, 0); // 9:00 AM

const OFFICIAL_CHECKOUT = new Date();
OFFICIAL_CHECKOUT.setHours(16, 30, 0, 0); // 4:30 PM

router.route("/:rollNumber")
    .post(async (req, res) => {
        try {
            const { rollNumber, action } = req.body; // Expect action as "IN" or "OUT"

            let student = await Student.findOne({ rollNumber });
            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }

            const today = new Date().toISOString().split("T")[0]; // Get current date (YYYY-MM-DD)
            let report = await Report.findOne({ rollNumber, date: today });

            const currentTime = new Date();
            let lateEntry = 0, earlyExit = 0;

            if (action === "IN") {
                if (!report) {
                    // Calculate late entry
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
                        date: today,
                    });

                } else {
                    return res.status(400).json({ message: "Already checked in today." });
                }
            } 
            else if (action === "OUT") {
                if (report && !report.checkOutTime) {
                    // Calculate early exit
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
