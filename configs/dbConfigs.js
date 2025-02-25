const mongoose = require("mongoose");

const connectDB = async ()=>
{
        try{

           await mongoose.connect(process.env.DATABASE_URI)
           .then(() => console.log('Connected to MongoDB'))
           .catch((error) => console.error('MongoDB connection error:', error));
        }
        catch(err){
            console.log(err);
        }
}

module.exports = connectDB;