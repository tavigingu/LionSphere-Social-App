import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/connectDB.js"
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
  });

connectDB().then(()=>{
    app.listen(PORT, () =>{
        console.log("Server running on port:" + PORT)
    })
})

