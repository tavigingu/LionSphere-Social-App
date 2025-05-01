import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";

//routes
import AuthRoute from "./routes/AuthRoute.js";
import UserRoute from "./routes/UserRoute.js";
import PostRoute from "./routes/PostRoute.js";
import NotificationRoute from "./routes/NotificationRoute.js";
import StoryRoute from "./routes/StoryRoute.js";
import ChatRoute from "./routes/ChatRoute.js"; 
import MessageRoute from "./routes/MessageRoute.js"; 
import ReportRoute from "./routes/ReportRoute.js";
import cron from 'node-cron';
import { cleanExpiredStories } from "./controller/StoryController.js";
import StatisticsRoute from "./routes/StatisticsRoute.js";

dotenv.config();

const app = express();
const httpServer = createServer(app); // Create HTTP server

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Pass io to global scope for use in controllers
app.set('io', io);

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const PORT = process.env.PORT;

// Socket.io connection handling
const onlineUsers = new Map(); // Store online users: userId -> socketId

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // User authentication/connection
  socket.on("user_connect", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is now online`);
    
    // Broadcast user online status to others
    io.emit("user_status", { userId, status: "online" });
    
    // Send current online users to the newly connected user
    const onlineUsersList = Array.from(onlineUsers.keys());
    socket.emit("online_users", onlineUsersList);
  });
  
  // Handle private messages
  socket.on("send_message", async (messageData) => {
    const { recipientId, senderId, text, chatId } = messageData;
    
    // Create a consistent chatId if not provided
    const generatedChatId = chatId || [senderId, recipientId].sort().join('_');
    
    // Emit message to recipient if online
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive_message", {
        senderId,
        text,
        chatId: generatedChatId,
        createdAt: new Date()
      });
    }
    
    // Emit to sender for confirmation
    socket.emit("message_sent", {
      success: true,
      messageData: {
        ...messageData,
        chatId: generatedChatId,
        createdAt: new Date()
      }
    });
  });
  
  // Handle typing indicators
  socket.on("typing", ({ chatId, userId }) => {
    // Find chat participants
    const participants = chatId.split('_');
    const recipientId = participants.find(id => id !== userId);
    
    // Send typing status to recipient if online
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_typing", { chatId, userId });
    }
  });
  
  // Handle stop typing indicators
  socket.on("stop_typing", ({ chatId, userId }) => {
    // Find chat participants
    const participants = chatId.split('_');
    const recipientId = participants.find(id => id !== userId);
    
    // Send stop typing status to recipient if online
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_stop_typing", { chatId, userId });
    }
  });
  
  // Handle user disconnect
  socket.on("disconnect", () => {
    // Find user by socket id and remove from online users
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      console.log(`User ${disconnectedUserId} disconnected`);
      
      // Broadcast user offline status
      io.emit("user_status", { userId: disconnectedUserId, status: "offline" });
    }
  });
});

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log("Server running on port:" + PORT);
    });
});

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
app.use('/chat', ChatRoute);
app.use('/message', MessageRoute); 
app.use('/report', ReportRoute);
app.use('/statistics', StatisticsRoute);