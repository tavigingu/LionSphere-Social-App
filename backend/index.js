import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/connectDB.js"
import cookieParser from 'cookie-parser';


//routes
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";
import PostRoute from "./routes/PostRoute.js";


dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173", // URL-ul exact al frontend-ului tău
    credentials: true,               // Important pentru cookie-uri
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json());

const PORT = process.env.PORT;

connectDB().then(()=>{
    app.listen(PORT, () =>{
        console.log("Server running on port:" + PORT)
    })
})

app.use('/auth', AuthRoute);
app.use('/user', UserRoute);
app.use('/post', PostRoute);




