import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/connectDB.js"
import cookieParser from 'cookie-parser';


//routes
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";
import PostRoute from "./routes/PostRoute.js";
import NotificationRoute from "./routes/NotificationRoute.js";
import StoryRoute from "./routes/StoryRoute.js";
import cron from 'node-cron';
import { cleanExpiredStories } from "./controller/StoryController.js";

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

cron.schedule('0 * * * *', async () => {
    console.log('Running cleanup job for expired stories');
    try {
        const deletedCount = await cleanExpiredStories();
        console.log(`Cleanup completed: ${deletedCount} stories removed`);
    } catch (error) {
        console.error('Cleanup job failed:', error);
    }
});

app.use('/auth', AuthRoute);
app.use('/user', UserRoute);
app.use('/post', PostRoute);
app.use('/notification', NotificationRoute);
app.use('/story', StoryRoute);


