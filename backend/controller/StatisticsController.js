// backend/controller/StatisticsController.js
import UserModel from "../models/UserModel.js";
import PostModel from "../models/PostModel.js";
import StoryModel from "../models/StoryModel.js";
import MessageModel from "../models/MessageModel.js";
import NotificationModel from "../models/NotificationModel.js";

/**
 * Funcție helper pentru a obține intervalul de date bazat pe perioada selectată
 */
const getDateRange = (timeframe) => {
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
    } else {
        // Implicit este o lună
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return { startDate, endDate: now };
};

/**
 * Helper pentru calcularea procentului de schimbare
 */
const calculateChange = (current, previous) => {
    if (previous === 0) return "0";
    return (((current - previous) / previous) * 100).toFixed(1);
};

/**
 * Obține toate statisticile pentru un utilizator
 */
export const getUserStatistics = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { timeframe = 'month' } = req.query;
        
        // Validează userId
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Utilizatorul nu a fost găsit",
                success: false
            });
        }
        
        console.log(`Obțin statistici pentru utilizatorul ${userId} pe perioada ${timeframe}`);
        
        // Obține intervalul de date
        const { startDate, endDate } = getDateRange(timeframe);
        
        try {
            // Obține date statistice în paralel pentru eficiență
            const [
                followersSummary,
                postsSummary,
                postEngagement,
                postsByDay,
                engagementByType,
                topPosts,
                recentActivity
            ] = await Promise.all([
                getFollowersSummaryData(userId, startDate, endDate),
                getPostsSummaryData(userId, startDate, endDate),
                getRecentPostEngagementData(userId, startDate, endDate),
                getPostsByDayData(userId),
                getEngagementByTypeData(userId),
                getTopPostsData(userId, 5),
                getRecentActivityData(userId, 10)
            ]);
            
            // Combină statisticile în obiectul de răspuns
            const stats = {
                followersSummary,
                postsSummary,
                postEngagement,
                postsByDay,
                engagementByType,
                topPosts,
                recentActivity
            };
            
            res.status(200).json({
                message: "Statistici obținute cu succes",
                success: true,
                stats
            });
        } catch (innerError) {
            console.error("Eroare la obținerea statisticilor (inner):", innerError);
            res.status(500).json({
                message: innerError.message || "Eroare la procesarea statisticilor",
                success: false
            });
        }
        
    } catch (error) {
        console.error("Eroare la obținerea statisticilor:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

/**
 * Obține sumar despre urmăritori
 */
export const getFollowersSummaryData = async (userId, startDate, endDate) => {
    try {
        const user = await UserModel.findById(userId);
        
        if (!user) {
            throw new Error("Utilizatorul nu a fost găsit");
        }
        
        // Numărul de urmăritori și urmăriți
        const followerCount = user.followers?.length || 0;
        const followingCount = user.following?.length || 0;
        
        // Calculează raportul
        const ratio = followingCount > 0 ? (followerCount / followingCount) : 0;
        
        // Obține utilizatorii care urmăresc
        const newFollowers = [];
        
        if (followerCount > 0 && user.followers) {
            // Limitează la 5 urmăritori pentru performanță
            const followerIds = user.followers.slice(0, 5);
            
            for (const followerId of followerIds) {
                try {
                    const follower = await UserModel.findById(followerId)
                        .select('username profilePicture createdAt');
                    
                    if (follower) {
                        newFollowers.push({
                            _id: followerId,
                            username: follower.username,
                            profilePicture: follower.profilePicture,
                            followedAt: follower.createdAt // Aproximare, deoarece nu avem data exactă când au început să urmărească
                        });
                    }
                } catch (err) {
                    console.error(`Eroare la obținerea detaliilor despre urmăritor ${followerId}:`, err);
                }
            }
        }
        
        return {
            totalFollowers: followerCount,
            totalFollowing: followingCount,
            followerRatio: ratio.toFixed(2),
            mostRecentFollowers: newFollowers
        };
        
    } catch (error) {
        console.error("Eroare la obținerea sumarului despre urmăritori:", error);
        throw error;
    }
};

/**
 * Obține sumar despre postări
 */
export const getPostsSummaryData = async (userId, startDate, endDate) => {
    try {
        // Obține toate postările utilizatorului
        const allPosts = await PostModel.find({ userId });
        
        // Obține postările din perioada selectată
        const recentPosts = await PostModel.find({
            userId,
            createdAt: { $gte: startDate, $lte: endDate }
        });
        
        // Calculează metrici
        let totalLikes = 0;
        let totalComments = 0;
        let totalSaves = 0;
        
        allPosts.forEach(post => {
            totalLikes += post.likes?.length || 0;
            totalComments += post.comments?.length || 0;
            totalSaves += post.savedBy?.length || 0;
        });
        
        // Calculează metrici recente
        let recentLikes = 0;
        let recentComments = 0;
        let recentSaves = 0;
        
        recentPosts.forEach(post => {
            recentLikes += post.likes?.length || 0;
            recentComments += post.comments?.length || 0;
            recentSaves += post.savedBy?.length || 0;
        });
        
        // Calculează medii
        const avgLikesPerPost = allPosts.length > 0 ? (totalLikes / allPosts.length).toFixed(1) : 0;
        const avgCommentsPerPost = allPosts.length > 0 ? (totalComments / allPosts.length).toFixed(1) : 0;
        const avgSavesPerPost = allPosts.length > 0 ? (totalSaves / allPosts.length).toFixed(1) : 0;
        
        return {
            totalPosts: allPosts.length,
            postsInPeriod: recentPosts.length,
            engagement: {
                total: {
                    likes: totalLikes,
                    comments: totalComments,
                    saves: totalSaves,
                    total: totalLikes + totalComments + totalSaves
                },
                recent: {
                    likes: recentLikes,
                    comments: recentComments,
                    saves: recentSaves,
                    total: recentLikes + recentComments + recentSaves
                },
                average: {
                    likesPerPost: avgLikesPerPost,
                    commentsPerPost: avgCommentsPerPost,
                    savesPerPost: avgSavesPerPost
                }
            }
        };
        
    } catch (error) {
        console.error("Eroare la obținerea sumarului despre postări:", error);
        throw error;
    }
};

/**
 * Obține date despre engagement-ul postărilor recente
 */
export const getRecentPostEngagementData = async (userId, startDate, endDate) => {
    try {
        // Obține postările din intervalul specificat
        const posts = await PostModel.find({
            userId: userId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 });
        
        // Dacă nu există postări, returnează un set de date gol
        if (posts.length === 0) {
            return [];
        }
        
        // Grupează postările după zi pentru a avea date consistente pentru grafic
        const postsByDate = {};
        
        posts.forEach(post => {
            const createdAt = new Date(post.createdAt);
            const dateStr = createdAt.toISOString().split('T')[0]; // Format YYYY-MM-DD
            
            if (!postsByDate[dateStr]) {
                postsByDate[dateStr] = {
                    date: dateStr,
                    likes: 0,
                    comments: 0,
                    saves: 0,
                    total: 0,
                    count: 0
                };
            }
            
            const likesCount = post.likes?.length || 0;
            const commentsCount = post.comments?.length || 0;
            const savesCount = post.savedBy?.length || 0;
            
            postsByDate[dateStr].likes += likesCount;
            postsByDate[dateStr].comments += commentsCount;
            postsByDate[dateStr].saves += savesCount;
            postsByDate[dateStr].total += likesCount + commentsCount + savesCount;
            postsByDate[dateStr].count += 1;
        });
        
        // Convertește în array și sortează după dată
        const engagementData = Object.values(postsByDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(item => {
                // Formatează data pentru afișare în interfață
                const date = new Date(item.date);
                const displayDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                
                return {
                    date: displayDate,
                    likes: item.likes,
                    comments: item.comments,
                    saves: item.saves,
                    total: item.total,
                    postCount: item.count
                };
            });
        
        return engagementData;
        
    } catch (error) {
        console.error("Eroare la obținerea datelor despre engagement-ul postărilor:", error);
        throw error;
    }
};

/**
 * Obține distribuția postărilor după ziua săptămânii
 */
export const getPostsByDayData = async (userId) => {
    try {
        // Obține toate postările utilizatorului
        const posts = await PostModel.find({ userId });
        
        // Inițializează contoare pentru fiecare zi
        const dayCounts = {
            'Dum': 0,
            'Lun': 0,
            'Mar': 0,
            'Mie': 0,
            'Joi': 0,
            'Vin': 0,
            'Sâm': 0
        };
        
        const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const daysRo = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
        
        // Numără postările după ziua săptămânii
        posts.forEach(post => {
            const createdAt = new Date(post.createdAt);
            const dayIndex = createdAt.getDay(); // 0 = Duminică, 1 = Luni, etc.
            const day = daysRo[dayIndex];
            
            dayCounts[day]++;
        });
        
        // Convertește în array pentru interfață
        return Object.keys(dayCounts).map(day => ({
            day,
            count: dayCounts[day]
        }));
        
    } catch (error) {
        console.error("Eroare la obținerea datelor despre postări după ziua săptămânii:", error);
        throw error;
    }
};

/**
 * Obține distribuția engagement-ului după tip
 */
export const getEngagementByTypeData = async (userId) => {
    try {
        // Obține toate postările utilizatorului
        const posts = await PostModel.find({ userId });
        
        // Calculează datele pentru grafic
        let likesCount = 0;
        let commentsCount = 0;
        let savesCount = 0;
        
        posts.forEach(post => {
            likesCount += post.likes?.length || 0;
            commentsCount += post.comments?.length || 0;
            savesCount += post.savedBy?.length || 0;
        });
        
        // Creează array-ul pentru graficul pie
        return [
            { name: "Aprecieri", value: likesCount, color: "#EC4899" },
            { name: "Comentarii", value: commentsCount, color: "#10B981" },
            { name: "Salvări", value: savesCount, color: "#3B82F6" }
        ];
        
    } catch (error) {
        console.error("Eroare la obținerea datelor despre tipuri de engagement:", error);
        throw error;
    }
};

/**
 * Obține cele mai performante postări
 */
export const getTopPostsData = async (userId, limit = 5) => {
    try {
        // Obține toate postările utilizatorului
        const posts = await PostModel.find({ userId });
        
        // Calculează engagement-ul pentru fiecare postare
        const postsWithEngagement = posts.map(post => {
            const createdAt = new Date(post.createdAt);
            const dateStr = `${createdAt.getDate()} ${createdAt.toLocaleString('default', { month: 'short' })}`;
            
            const likes = post.likes?.length || 0;
            const comments = post.comments?.length || 0;
            const saves = post.savedBy?.length || 0;
            const total = likes + comments + saves;
            
            return {
                postId: post._id.toString(),
                date: dateStr,
                desc: post.desc ? (post.desc.length > 30 ? post.desc.substring(0, 30) + '...' : post.desc) : '',
                image: post.image,
                likes,
                comments,
                saves,
                total
            };
        });
        
        // Sortează după engagement total și returnează primele N
        return postsWithEngagement
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
        
    } catch (error) {
        console.error("Eroare la obținerea celor mai performante postări:", error);
        throw error;
    }
};

/**
 * Obține activitatea recentă
 */
export const getRecentActivityData = async (userId, limit = 10) => {
    try {
        // Obține notificările recente
        const notifications = await NotificationModel.find({
            $or: [
                { recipientId: userId },
                { senderId: userId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(limit * 2); // Obține mai multe pentru a avea suficiente după filtrare
        
        // Obține comentariile recente
        const recentPosts = await PostModel.find({
            userId
        })
        .sort({ createdAt: -1 })
        .limit(10);
        
        const recentComments = [];
        
        // Extrage comentariile recente din postări
        recentPosts.forEach(post => {
            if (post.comments && post.comments.length > 0) {
                // Sortează comentariile după data creării (cele mai recente primul)
                const sortedComments = [...post.comments].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                // Adaugă cele mai recente comentarii
                sortedComments.slice(0, 3).forEach(comment => {
                    recentComments.push({
                        type: 'comment',
                        postId: post._id,
                        userId: comment.userId,
                        text: comment.text,
                        createdAt: comment.createdAt
                    });
                });
            }
        });
        
        // Combină și sortează activitățile
        const allActivities = [
            ...notifications.map(notif => ({
                type: 'notification',
                notifType: notif.type,
                userId: notif.senderId,
                targetId: notif.recipientId,
                message: notif.message,
                createdAt: notif.createdAt
            })),
            ...recentComments
        ];
        
        // Sortează după dată și limitează la numărul cerut
        return allActivities
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
        
    } catch (error) {
        console.error("Eroare la obținerea activității recente:", error);
        throw error;
    }
};

/**
 * Endpoint pentru a obține date despre urmăritori
 */
export const getFollowersData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { timeframe = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(timeframe);
        
        const followersSummary = await getFollowersSummaryData(userId, startDate, endDate);
        
        res.status(200).json({
            message: "Date despre urmăritori obținute cu succes",
            success: true,
            followersSummary
        });
        
    } catch (error) {
        console.error("Eroare la obținerea datelor despre urmăritori:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

/**
 * Endpoint pentru a obține date despre postări
 */
export const getPostsData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { timeframe = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(timeframe);
        
        const postsSummary = await getPostsSummaryData(userId, startDate, endDate);
        
        res.status(200).json({
            message: "Date despre postări obținute cu succes",
            success: true,
            postsSummary
        });
        
    } catch (error) {
        console.error("Eroare la obținerea datelor despre postări:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

/**
 * Endpoint pentru a obține cele mai performante postări
 */
export const getTopPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { limit = 5 } = req.query;
        
        const topPosts = await getTopPostsData(userId, parseInt(limit));
        
        res.status(200).json({
            message: "Cele mai performante postări obținute cu succes",
            success: true,
            topPosts
        });
        
    } catch (error) {
        console.error("Eroare la obținerea celor mai performante postări:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

/**
 * Endpoint pentru a obține distribuția postărilor după ziua săptămânii
 */
export const getPostsByDay = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const postsByDay = await getPostsByDayData(userId);
        
        res.status(200).json({
            message: "Distribuția postărilor după ziua săptămânii obținută cu succes",
            success: true,
            postsByDay
        });
        
    } catch (error) {
        console.error("Eroare la obținerea distribuției postărilor după ziua săptămânii:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

/**
 * Endpoint pentru a obține tipurile de engagement
 */
export const getEngagementByType = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const engagementByType = await getEngagementByTypeData(userId);
        
        res.status(200).json({
            message: "Tipurile de engagement obținute cu succes",
            success: true,
            engagementByType
        });
        
    } catch (error) {
        console.error("Eroare la obținerea tipurilor de engagement:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

/**
 * Endpoint pentru a obține activitatea recentă
 */
export const getRecentActivity = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { limit = 10 } = req.query;
        
        const recentActivity = await getRecentActivityData(userId, parseInt(limit));
        
        res.status(200).json({
            message: "Activitatea recentă obținută cu succes",
            success: true,
            recentActivity
        });
        
    } catch (error) {
        console.error("Eroare la obținerea activității recente:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};