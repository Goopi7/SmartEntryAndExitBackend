const nodemailer = require("nodemailer");
const express = require("express");
const Report = require("../Models/reportSchema");
const Student = require("../Models/studentSchema");
const moment = require("moment-timezone");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.USERID,
      pass: process.env.PASSWORD,
    },
  });
  
  async function forwardEmail(to, subject, text) {
    let info = await transporter.sendMail({
      from: process.env.USERID,
      to,
      subject,
      text,
    });
    console.log("Email forwarded: ", info.response);
  }
  

router.post("/:rollNumber", async (req, res) => {
    try {
        const { action } = req.body;
        const rollNumber = req.params.rollNumber.trim();
        const student = await Student.findOne({ rollNumber });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        const studentEmail = student.mail;
        const inputDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD"); // Current Date
        const currentTime = moment().tz("Asia/Kolkata"); // Current Time

        const OFFICIAL_CHECKIN = 9 * 60 + 10; // 9:10 AM
        const OFFICIAL_CHECKOUT = 16 * 60 + 20; // 4:20 PM
        const currentTimeInMinutes = currentTime.hours() * 60 + currentTime.minutes();

        let lateEntry = 0, earlyExit = 0;

        // Check if Report Exists for Current Date
        let report = await Report.findOne({ rollNumber, date: inputDate });

        // ✅ Late Entry Condition
        if (action === "IN") {
            if (currentTimeInMinutes > OFFICIAL_CHECKIN) {
                lateEntry = currentTimeInMinutes - OFFICIAL_CHECKIN;

                if (!report) {
                    report = new Report({
                        student: student._id,
                        rollNumber: student.rollNumber,
                        name: student.name,
                        branch: student.branch,
                        mail: student.mail,
                        checkInTime: currentTime,
                        lateEntryDuration: lateEntry,
                        date: inputDate,
                    });
                    await report.save();
                    const totalLateEntries = await Report.countDocuments({
                        rollNumber: student.rollNumber,
                        lateEntryDuration: { $gt: 0 }, // Only count late entries
                      });
                    await forwardEmail(studentEmail, "Late Entry Notification", `Dear ${student.name},

                        You were late by ${lateEntry} minutes on ${inputDate}. Your total number of late entries has now reached ${totalLateEntries} times.
                        `);
                        
                    return res.json({ message: "Late entry stored successfully", lateEntry, name: report.name, date: report.date, rollNumber: report.rollNumber, branch: report.branch,Intime:report.checkInTime });
                } else {
                    return res.status(400).json({ message: "Already checked in for today." });
                }
            } else {
                return res.status(400).json({ message: "On time entry, data not stored" });
            }
        }

        // ✅ Early Exit Condition
        else if (action === "OUT") {
            if (currentTimeInMinutes < OFFICIAL_CHECKOUT) {
                earlyExit = OFFICIAL_CHECKOUT - currentTimeInMinutes;

                if (!report) {
                    report = new Report({
                        student: student._id,
                        rollNumber: student.rollNumber,
                        name: student.name,
                        branch: student.branch,
                        mail: student.mail,
                        checkOutTime: currentTime,
                        earlyExitDuration: earlyExit,
                        date: inputDate,
                    });
                    await report.save();
                    return res.json({ message: "Early exit stored successfully", earlyExit  ,name: report.name, date: report.date, rollNumber: report.rollNumber, branch: report.branch,OutTime:report.checkOutTime,});
                } 
                else if (!report.checkOutTime) {
                    report.checkOutTime = currentTime;
                    report.earlyExitDuration = earlyExit;
                    await report.save();
                    return res.json({ message: "Early exit updated successfully", earlyExit, name: report.name, date: report.date, rollNumber: report.rollNumber, branch: report.branch,OutTime:report.checkOutTime, });
                }
                else {
                    return res.status(400).json({ message: "Already checked out today." });
                }
            } else {
                return res.status(400).json({ message: "On time exit, data not stored" });
            }
        }

        else {
            return res.status(400).json({ message: "Invalid Action" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update report" });
    }
});

router.get("/history/:rollNumber", async (req, res) => {
    try {
        const rollNumber = req.params.rollNumber;
        const reports = await Report.find({ rollNumber }).sort({ date: -1 });

        if (reports.length === 0) {
            return res.status(404).json({ message: "No reports found" });
        }

        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch report history" });
    }
});

module.exports = router;
