const express = require("express");
const Report = require("../Models/reportSchema");
const Student = require("../Models/studentSchema");

const router = express.Router();
router.post("/:rollNumber", async (req, res) => {
    try {
        const { action } = req.body; // "IN" or "OUT"
        const rollNumber = req.params.rollNumber;

        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        const OFFICIAL_CHECKIN = 9 * 60 + 10; // 9:10 AM in minutes
        const OFFICIAL_CHECKOUT = 16 * 60 + 20; // 4:20 PM in minutes

        let report = await Report.findOne({ rollNumber, date: todayStr });

        const now = new Date();
        const IST_OFFSET = 5.5 * 60 * 60 * 1000; // Convert UTC to IST
        const localTime = new Date(now.getTime() + IST_OFFSET); 

        const currentTimeInMinutes = localTime.getHours() * 60 + localTime.getMinutes();
        let lateEntry = 0, earlyExit = 0;
        
        if (action === "IN") {
            if (!report || report.date !== todayStr) {
                if (currentTimeInMinutes > OFFICIAL_CHECKIN) {
                    lateEntry = currentTimeInMinutes - OFFICIAL_CHECKIN;
                }

                report = new Report({
                    student: student._id,
                    rollNumber: student.rollNumber,
                    name: student.name,
                    branch: student.branch,
                    mail: student.mail,
                    checkInTime: localTime,  // ✅ Store correct local time
                    checkOutTime: null,
                    lateEntryDuration: lateEntry,
                    earlyExitDuration: 0,
                    date: todayStr,
                });

                await report.save();
            } else {
                return res.status(400).json({ message: "Already checked in today." });
            }
        } 
        else if (action === "OUT") {
            if (!report || report.date !== todayStr) {
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
                    checkOutTime: localTime,  // ✅ Store correct local time
                    lateEntryDuration: 0,
                    earlyExitDuration: earlyExit,
                    date: todayStr,
                });

                await report.save();
            } else if (!report.checkOutTime) {
                if (currentTimeInMinutes < OFFICIAL_CHECKOUT) {
                    earlyExit = OFFICIAL_CHECKOUT - currentTimeInMinutes;
                }

                await Report.findOneAndUpdate(
                    { rollNumber, date: todayStr },
                    {
                        checkOutTime: localTime,  // ✅ Store correct local time
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