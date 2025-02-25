const express =require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./configs/dbConfigs")
const studentDataAddedToDB = require("./routes/reportImportData")
const studentData = require("./routes/studentData");
const ReportDataAddedToDB = require("./routes/reportImportData");

const app=express();
const PORT = 3005;
dotenv.config();
// app.use(cors());
app.use(express.json())
connectDB();
app.get("/",(req,res)=>{
    res.send("hello");
})

app.use("/api/student",studentData);
app.use("/api/studentdata",studentDataAddedToDB);
app.use("/api/report",ReportDataAddedToDB);


mongoose.connection.once("open" , ()=>{
    app.listen(process.env.PORT || PORT , ()=>{
        console.log("connected to port");
    })
})
