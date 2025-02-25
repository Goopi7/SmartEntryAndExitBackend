const express =require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./configs/dbConfigs")
const studentDataAddedToDB = require("./routes/ReportData")
const studentData = require("./routes/studentData");
const  ReportData= require("./routes/ReportData");
const  ReportDataAddedToDB= require("./routes/reportImportDataToDB")

const app=express();
app.use(cors({
    origin: "*",  // Allows requests from any frontend (change this for security)
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));
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
app.use("/api/reportData",ReportDataAddedToDB);
app.use("/api/report",ReportData);


mongoose.connection.once("open" , ()=>{
    app.listen(process.env.PORT || PORT , ()=>{
        console.log("connected to port");
    })
})
