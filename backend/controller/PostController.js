import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";

export const createPost = async (req, res) => {
    const newPost = new PostModel(req.body);

    try {
        const savedPost = await newPost.save();
        res.status(201).json({
            message: "Post created successfully",
            success: true,
            post: savedPost
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

export const getPost = async (req, res) => {
    try {
        const id= req.params.id;
        const post = await PostModel.findById(id);

        res.status(200).json({
            message: "Post fetched successfully",
            success: true,
            post: post
        });


    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }    
}

export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId, role: userRole } = req.body;
        
        const post = await PostModel.findById(postId);

        if(post.userId === userId || userRole === 'admin') {
            const updatedPost = await PostModel.findByIdAndUpdate
            (postId, {
                $set: req.body
            }, { new: true });

            res.status(200).json({
                message: "Post updated successfully",
                success: true,
                post: updatedPost
            });
            
        } else {
            return res.status(403).json({
                message: "You can update only your post",
                success: false
        });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        //const { userId, role: userRole } = req.body;
        const { userId }= req.body;
    
        const post = await PostModel.findById(postId);
        //if(post.userId === userId || userRole === 'admin') {
        if(post.userId === userId ){
            console.log("intainte de delete");
            await PostModel.findByIdAndDelete(postId);
            console.log("a intrat");
            res.status(200).json({
                message: "Post deleted successfully",
                success: true
            });
            
        } else {
            console.log("e pe else");
            return res.status(403).json({
                message: "You can delete only your post",
                success: false
        });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

// like/dislike a post
// export const likePost = async (req, res) => {  
//     try {
//         const postId = req.params.id;
//         const { userId } = req.body;
        
//         const post = await PostModel.findById(postId);
//         if(!post.likes.includes(userId)) {
//             await post.updateOne({ $push: { likes: userId } });
//             res.status(200).json({
//                 message: "Post liked successfully",
//                 success: true
//             });
//         } else {
//             await post.updateOne({ $pull: { likes: userId } });
//             res.status(200).json({
//                 message: "Post unliked successfully",
//                 success: true });
//         }

//     } catch (error) {
//         res.status(500).json({
//             message: error.message || error,
//             success: false
//         });
//     }
// }
export const likePost = async (req, res) => {  
    try {
        const postId = req.params.id;
        const { userId } = req.body;
        
        const post = await PostModel.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }
        
        let action;
        
        if(!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } });
            action = 'liked';
            res.status(200).json({
                message: "Post liked successfully",
                success: true,
                action,
                post: {
                    _id: post._id,
                    userId: post.userId
                }
            });
        } else {
            await post.updateOne({ $pull: { likes: userId } });
            action = 'unliked';
            res.status(200).json({
                message: "Post unliked successfully",
                success: true,
                action,
                post: {
                    _id: post._id,
                    userId: post.userId
                }
            });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}


// export const commentPost = async (req, res) => {
//     try {
//         const postId = req.params.id;
//         const { userId, text } = req.body;
        
//         const post = await PostModel.findById(postId);
//         await post.updateOne({ $push: { comments: { userId, text } } });

//         res.status(200).json({
//             message: "Comment added successfully",
//             success: true
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: error.message || error,
//             success: false
//         });
//     }
// }

export const commentPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId, text } = req.body;
        
        const post = await PostModel.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }
        
        // Create comment object with a unique ID
        const newComment = {
            userId,
            text,
            _id: new mongoose.Types.ObjectId(),
            createdAt: new Date()
        };
        
        // Add the comment to the post
        await post.updateOne({ $push: { comments: newComment } });

        res.status(200).json({
            message: "Comment added successfully",
            success: true,
            post: {
                _id: post._id,
                userId: post.userId
            },
            comment: {
                _id: newComment._id,
                text: newComment.text
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId, commentId } = req.body;
        
        const post = await PostModel.findById(postId);
        await post.updateOne({ $pull: { comments: { _id: commentId, userId } } });

        res.status(200).json({
            message: "Comment deleted successfully",
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

export const getTimelinePosts = async (req, res) => {
    try {
        const userId = req.params.id;

        // Găsește utilizatorul curent pentru a lua lista de utilizatori urmăriți
        const currentUser = await UserModel.findById(userId);
        
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Preia postările utilizatorului curent
        const currentUserPosts = await PostModel.find({ userId: userId });

        // Preia postările de la utilizatorii urmăriți 
        const friendPosts = await PostModel.find({ 
            userId: { $in: currentUser.following } 
        });

        // Sortează postările cronologic, cele mai recente primele
        const timelinePosts = currentUserPosts.concat(friendPosts).sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // console.log("Searching posts for userId:", userId);
        // console.log(`User posts found: ${currentUserPosts.length}`);
        // console.log(`Friend posts found: ${friendPosts.length}`);
        // console.log(`Total timeline posts: ${timelinePosts.length}`);

        res.status(200).json({
            message: "Timeline posts fetched successfully",
            success: true,
            posts: timelinePosts // Trimite toate postările, nu doar ale utilizatorului curent
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id;

        const currentUser = await UserModel.findById(userId);
        
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Preia postările utilizatorului curent
        const currentUserPosts = await PostModel.find({ userId: userId });

        // Sortează postările cronologic, cele mai recente primele
        const timelinePosts = currentUserPosts.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).json({
            message: "User posts fetched successfully",
            success: true,
            posts: timelinePosts 
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};
