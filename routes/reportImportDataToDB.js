const express = require("express");
const Report = require("../Models/reportSchema");
const Student = require("../Models/studentSchema");

const router = express.Router();

router.post("/:rollNumber", async (req, res) => {
    try {
        const { action } = req.body; // "IN" or "OUT"
        const rollNumber = req.params.rollNumber;

        // Find student
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        const OFFICIAL_CHECKIN = 9 * 60 + 10; // 9:10 AM in minutes
        const OFFICIAL_CHECKOUT = 16 * 60 + 20; // 4:20 PM in minutes

        // Find existing report for today
        let report = await Report.findOne({ rollNumber, date: todayStr });

        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes

        let lateEntry = 0, earlyExit = 0;

        if (action === "IN") {
            if (!report) {
                // Calculate late entry only if check-in is after 9:10 AM
                if (currentTimeInMinutes > OFFICIAL_CHECKIN) {
                    lateEntry = currentTimeInMinutes - OFFICIAL_CHECKIN;
                }

                report = new Report({
                    student: student._id,
                    rollNumber: student.rollNumber,
                    name: student.name,
                    branch: student.branch,
                    mail: student.mail,
                    checkInTime: currentTimeInMinutes,
                    checkOutTime: null,
                    lateEntryDuration: lateEntry,
                    earlyExitDuration: 0, // Will be updated at checkout
                    date: todayStr,
                });

                await report.save();
            } else {
                return res.status(400).json({ message: "Already checked in today." });
            }
        } 
        else if (action === "OUT") {
            // Allow check-out without prior check-in
            if (!report) {
                // Calculate early exit if before 4:20 PM
                if (currentTimeInMinutes < OFFICIAL_CHECKOUT) {
                    earlyExit = OFFICIAL_CHECKOUT - currentTimeInMinutes;
                }

                report = new Report({
                    student: student._id,
                    rollNumber: student.rollNumber,
                    name: student.name,
                    branch: student.branch,
                    mail: student.mail,
                    checkInTime: null, // No check-in
                    checkOutTime: currentTimeInMinutes,
                    lateEntryDuration: 0,
                    earlyExitDuration: earlyExit,
                    date: todayStr,
                });

                await report.save();
            } else if (!report.checkOutTime) {
                // If already checked in, update check-out time and early exit
                if (currentTimeInMinutes < OFFICIAL_CHECKOUT) {
                    earlyExit = OFFICIAL_CHECKOUT - currentTimeInMinutes;
                }

                await Report.findOneAndUpdate(
                    { rollNumber, date: todayStr },
                    {
                        checkOutTime: currentTimeInMinutes,
                        earlyExitDuration: earlyExit,
                    }
                );
            } else {
                return res.status(400).json({ message: "Already checked out today." });
            }
        }

        return res.json({ message: `Successfully marked ${action}`, lateEntry, earlyExit });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update report" });
    }
});

module.exports = router;
