// backend/controller/StoryController.js
import StoryModel from "../models/StoryModel.js";
import UserModel from "../models/UserModel.js";
import NotificationModel from "../models/NotificationModel.js";

// Creează un nou story
export const createStory = async (req, res) => {
    try {
        const { userId, image, caption } = req.body;
        
        if (!userId || !image) {
            return res.status(400).json({
                message: "User ID and image are required",
                success: false
            });
        }
        
        const newStory = new StoryModel({
            userId,
            image,
            caption,
            viewers: [],
            likes: [] // Initialize empty likes array
        });
        
        const savedStory = await newStory.save();
        
        res.status(201).json({
            message: "Story created successfully",
            success: true,
            story: savedStory
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Obține stories pentru timeline (stories ale utilizatorului și ale prietenilor săi)
export const getTimelineStories = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Obține utilizatorul pentru a lua lista de following
        const currentUser = await UserModel.findById(userId);
        
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // Obține story-urile utilizatorului curent și ale utilizatorilor pe care îi urmărește
        // care nu au expirat
        const currentTime = new Date();
        const stories = await StoryModel.find({
            $and: [
                { $or: [
                    { userId },
                    { userId: { $in: currentUser.following } }
                ]},
                { expiresAt: { $gt: currentTime } }
            ]
        }).sort({ createdAt: -1 });
        
        // Grupează story-urile după userId
        const storyGroups = {};
        
        for (const story of stories) {
            if (!storyGroups[story.userId]) {
                storyGroups[story.userId] = [];
            }
            storyGroups[story.userId].push(story);
        }
        
        // Obține informații de utilizator pentru fiecare grup
        const userIds = Object.keys(storyGroups);
        const users = await UserModel.find({ _id: { $in: userIds } })
                                     .select('username profilePicture');
        
        const userMap = {};
        users.forEach(user => {
            userMap[user._id] = {
                username: user.username,
                profilePicture: user.profilePicture
            };
        });
        
        // Formatul de răspuns: { userId, username, profilePicture, stories: [] }
        const timelineStories = userIds.map(uId => ({
            userId: uId,
            username: userMap[uId]?.username || 'Unknown User',
            profilePicture: userMap[uId]?.profilePicture || null,
            stories: storyGroups[uId]
        }));
        
        res.status(200).json({
            message: "Stories fetched successfully",
            success: true,
            storyGroups: timelineStories
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Like or unlike a story
export const likeStory = async (req, res) => {
    try {
        const storyId = req.params.storyId;
        const { userId } = req.body;
        
        const story = await StoryModel.findById(storyId);
        
        if (!story) {
            return res.status(404).json({
                message: "Story not found",
                success: false
            });
        }
        
        let action;
        
        if (!story.likes.includes(userId)) {
            // Like the story
            await story.updateOne({ $push: { likes: userId } });
            action = 'liked';
            
            // Create notification if the user who liked is not the story owner
            if (story.userId !== userId) {
                try {
                    await NotificationModel.create({
                        recipientId: story.userId,
                        senderId: userId,
                        type: 'like',
                        message: 'liked your story',
                        read: false
                    });
                } catch (err) {
                    console.error('Failed to create like notification:', err);
                    // Continue even if notification creation fails
                }
            }
        } else {
            // Unlike the story
            await story.updateOne({ $pull: { likes: userId } });
            action = 'unliked';
        }
        
        // Get updated story
        const updatedStory = await StoryModel.findById(storyId);
        
        res.status(200).json({
            message: `Story ${action} successfully`,
            success: true,
            action,
            story: updatedStory
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Marchează un story ca vizualizat de un utilizator
export const viewStory = async (req, res) => {
    try {
        const storyId = req.params.storyId;
        const { userId } = req.body;
        
        const story = await StoryModel.findById(storyId);
        
        if (!story) {
            return res.status(404).json({
                message: "Story not found",
                success: false
            });
        }
        
        // Verifică dacă utilizatorul a văzut deja story-ul
        if (!story.viewers.includes(userId)) {
            await story.updateOne({ $push: { viewers: userId } });
        }
        
        res.status(200).json({
            message: "Story marked as viewed",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Șterge un story
export const deleteStory = async (req, res) => {
    try {
        const storyId = req.params.storyId;
        const { userId } = req.body;
        
        const story = await StoryModel.findById(storyId);
        
        if (!story) {
            return res.status(404).json({
                message: "Story not found",
                success: false
            });
        }
        
        // Verifică dacă utilizatorul este proprietarul story-ului
        if (story.userId !== userId) {
            return res.status(403).json({
                message: "You can delete only your stories",
                success: false
            });
        }
        
        await StoryModel.findByIdAndDelete(storyId);
        
        res.status(200).json({
            message: "Story deleted successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Get story likes
export const getStoryLikes = async (req, res) => {
    try {
        const storyId = req.params.storyId;
        
        const story = await StoryModel.findById(storyId);
        
        if (!story) {
            return res.status(404).json({
                message: "Story not found",
                success: false
            });
        }
        
        // Get user details for each like
        const likes = [];
        for (const userId of story.likes) {
            try {
                const user = await UserModel.findById(userId)
                    .select('username profilePicture');
                
                if (user) {
                    likes.push({
                        _id: userId,
                        username: user.username,
                        profilePicture: user.profilePicture
                    });
                }
            } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
            }
        }
        
        res.status(200).json({
            message: "Story likes fetched successfully",
            success: true,
            likes
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Funcție pentru ștergerea automată a stories expirate
// Aceasta ar trebui rulată periodic printr-un job scheduler sau task
export const cleanExpiredStories = async () => {
    try {
        const currentTime = new Date();
        const result = await StoryModel.deleteMany({
            expiresAt: { $lt: currentTime }
        });
        
        console.log(`Cleaned ${result.deletedCount} expired stories`);
        return result.deletedCount;
    } catch (error) {
        console.error("Error cleaning expired stories:", error);
        throw error;
    }
};