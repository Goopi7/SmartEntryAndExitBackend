const express = require("express");
const Report = require("../Models/reportSchema");
const Student = require("../Models/studentSchema");
const moment = require("moment-timezone");

const router = express.Router();

router.post("/:rollNumber", async (req, res) => {
    try {
        const { action, date } = req.body; // Accept date from request
        const rollNumber = req.params.rollNumber;

        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const inputDate = date || moment().tz("Asia/Kolkata").format("YYYY-MM-DD"); // If no date, use today's date
        const currentTime = moment().tz("Asia/Kolkata");

        const OFFICIAL_CHECKIN = 9 * 60 + 10; // 9:10 AM
        const OFFICIAL_CHECKOUT = 16 * 60 + 20; // 4:20 PM
        const currentTimeInMinutes = currentTime.hours() * 60 + currentTime.minutes();

        let lateEntry = 0, earlyExit = 0;
        let report = await Report.findOne({ rollNumber, date: inputDate });

        if (action === "IN") {
            if (!report) {
                if (currentTimeInMinutes > OFFICIAL_CHECKIN) {
                    lateEntry = currentTimeInMinutes - OFFICIAL_CHECKIN;
                }

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
                    date: inputDate, // ✅ Assigning Date
                });

                await report.save();
                return res.json({ message: "Check-in marked successfully", lateEntry });
            } else {
                return res.status(400).json({ message: "Already checked in for this date." });
            }
        }
        else if (action === "OUT") {
            if (report && !report.checkOutTime) {
                if (currentTimeInMinutes < OFFICIAL_CHECKOUT) {
                    earlyExit = OFFICIAL_CHECKOUT - currentTimeInMinutes;
                }

                report.checkOutTime = currentTime;
                report.earlyExitDuration = earlyExit;
                await report.save();
                return res.json({ message: "Check-out marked successfully", earlyExit });
            } else if (!report) {
                if (currentTimeInMinutes < OFFICIAL_CHECKOUT) {
                    earlyExit = OFFICIAL_CHECKOUT - currentTimeInMinutes;
                }

                report = new Report({
                    student: student._id,
                    rollNumber: student.rollNumber,
                    name: student.name,
                    branch: student.branch,
                    mail: student.mail,
                    checkInTime: null,
                    checkOutTime: currentTime,
                    lateEntryDuration: 0,
                    earlyExitDuration: earlyExit,
                    date: inputDate, // ✅ Assigning Date
                });

                await report.save();
                return res.json({ message: "Early exit marked successfully", earlyExit });
            } else {
                return res.status(400).json({ message: "Already checked out today." });
            }
        } else {
            return res.status(400).json({ message: "Invalid Action" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update report" });
    }
});

module.exports = router;
