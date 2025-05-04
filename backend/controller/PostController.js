import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";
import NotificationModel from "../models/NotificationModel.js";

export const createPost = async (req, res) => {
    try {
        const { userId, desc, image, location, taggedUsers } = req.body;
        
        // Validate required fields
        if (!userId || !image) {
            return res.status(400).json({
                message: "User ID and image are required for creating a post",
                success: false
            });
        }
        
        // Extract hashtags from description
        const tags = [];
        if (desc) {
            const hashtagRegex = /#(\w+)/g;
            let match;
            while ((match = hashtagRegex.exec(desc)) !== null) {
                tags.push(match[1].toLowerCase());
            }
        }
        
        // Create new post object with all fields
        const newPost = new PostModel({
            userId,
            desc,
            image,
            location,
            taggedUsers,
            tags,
            likes: [],
            savedBy: [],
            comments: []
        });

        const savedPost = await newPost.save();
        
        // Send notifications to tagged users
        if (taggedUsers && taggedUsers.length > 0) {
            for (const taggedUser of taggedUsers) {
                // Skip if user is tagging themselves
                if (taggedUser.userId === userId) continue;
                
                try {
                    await NotificationModel.create({
                        recipientId: taggedUser.userId,
                        senderId: userId,
                        type: 'mention',
                        postId: savedPost._id,
                        message: 'tagged you in a post',
                        read: false
                    });
                } catch (err) {
                    console.error('Failed to create tag notification:', err);
                    // Continue even if notification creation fails
                }
            }
        }
        
        res.status(201).json({
            message: "Post created successfully",
            success: true,
            post: savedPost
        });
    } catch (error) {
        console.error("Error creating post:", error);
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
        
        // Create a simple comment object without mongoose ObjectId
        const newComment = {
            userId,
            text,
            createdAt: new Date()
        };
        
        // Add the comment to the post
        await post.updateOne({ $push: { comments: newComment } });

        // Get the updated post to see the added comment
        const updatedPost = await PostModel.findById(postId);
        const addedComment = updatedPost.comments[updatedPost.comments.length - 1];
        
        // Create a notification for post owner (only if commenter isn't the post owner)
        if (post.userId !== userId) {
            try {
                await NotificationModel.create({
                    recipientId: post.userId,
                    senderId: userId,
                    type: 'comment',
                    postId: post._id,
                    commentId: addedComment._id,
                    message: `commented on your post: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
                    read: false
                });
            } catch (err) {
                console.error('Failed to create comment notification:', err);
                // Continue even if notification creation fails
            }
        }
        
        // Process mentions in comment text and create notifications
        const mentionRegex = /@(\w+)/g;
        let mentionMatch;
        const processedMentions = new Set(); // To avoid duplicate notifications
        
        while ((mentionMatch = mentionRegex.exec(text)) !== null) {
            const mentionedUsername = mentionMatch[1];
            
            // Skip if already processed this mention
            if (processedMentions.has(mentionedUsername)) continue;
            processedMentions.add(mentionedUsername);
            
            try {
                // Find the mentioned user
                const mentionedUser = await UserModel.findOne({
                    username: new RegExp(`^${mentionedUsername}$`, 'i')
                });
                
                if (mentionedUser && mentionedUser._id.toString() !== userId) {
                    // Create mention notification
                    await NotificationModel.create({
                        recipientId: mentionedUser._id,
                        senderId: userId,
                        type: 'mention',
                        postId: post._id,
                        commentId: addedComment._id,
                        message: `mentioned you in a comment: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
                        read: false
                    });
                }
            } catch (err) {
                console.error('Failed to process mention in comment:', err);
                // Continue with the next mention
            }
        }
        
        res.status(200).json({
            message: "Comment added successfully",
            success: true,
            post: {
                _id: post._id,
                userId: post.userId
            },
            comment: {
                _id: addedComment._id,
                text: addedComment.text
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

export const savePost = async (req, res) => {  
    try {
        console.log("a intrat in savePost");

        const postId = req.params.id;
        const { userId } = req.body;
        
        const post = await PostModel.findById(postId);
        
        console.log("post", post);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }
        console.log("a trecut de post");
        
        // Check if the post is already saved by the user
        if (!post.savedBy) {
            post.savedBy = [];  // Initialize if it doesn't exist yet
        }
        
        let action;
        
        if (!post.savedBy.includes(userId)) {
            // Save the post
            await post.updateOne({ $push: { savedBy: userId } });
            action = 'saved';
            res.status(200).json({
                message: "Post saved successfully",
                success: true,
                action,
                post: {
                    _id: post._id,
                    userId: post.userId
                }
            });
        } else {
            // Unsave the post
            await post.updateOne({ $pull: { savedBy: userId } });
            action = 'unsaved';
            res.status(200).json({
                message: "Post removed from saved",
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
};

// Get saved posts for a user
export const getSavedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find all posts that have this userId in their savedBy array
        const savedPosts = await PostModel.find({
            savedBy: { $in: [userId] }
        }).sort({ createdAt: -1 });  // Newest first
        
        res.status(200).json({
            message: "Saved posts fetched successfully",
            success: true,
            posts: savedPosts
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

export const getTaggedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Găsește toate postările unde utilizatorul este în array-ul taggedUsers
        const taggedPosts = await PostModel.find({
            "taggedUsers.userId": userId
        }).sort({ createdAt: -1 }); // Cele mai recente primele
        
        res.status(200).json({
            message: "Tagged posts fetched successfully",
            success: true,
            posts: taggedPosts
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

export const replyToComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const { userId, text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({
                message: "Reply text is required",
                success: false
            });
        }
        
        const post = await PostModel.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }
        
        // Find the comment to reply to
        const commentIndex = post.comments.findIndex(
            comment => comment._id.toString() === commentId
        );
        
        if (commentIndex === -1) {
            return res.status(404).json({
                message: "Comment not found",
                success: false
            });
        }
        
        // Create the reply
        const newReply = {
            userId,
            text,
            createdAt: new Date(),
            likes: []
        };
        
        // Add the reply to the comment
        post.comments[commentIndex].replies.push(newReply);
        await post.save();
        
        // Get the updated post to see the added reply
        const updatedPost = await PostModel.findById(postId);
        const addedReply = updatedPost.comments[commentIndex].replies[
            updatedPost.comments[commentIndex].replies.length - 1
        ];
        
        // Create notification for the comment owner if the reply author is different
        if (post.comments[commentIndex].userId !== userId) {
            try {
                await NotificationModel.create({
                    recipientId: post.comments[commentIndex].userId,
                    senderId: userId,
                    type: 'comment',
                    postId,
                    commentId,
                    message: `replied to your comment: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
                    read: false
                });
            } catch (err) {
                console.error('Failed to create reply notification:', err);
                // Continue even if notification creation fails
            }
        }
        
        // Process mentions in reply text and create notifications
        const mentionRegex = /@(\w+)/g;
        let mentionMatch;
        const processedMentions = new Set(); // To avoid duplicate notifications
        
        while ((mentionMatch = mentionRegex.exec(text)) !== null) {
            const mentionedUsername = mentionMatch[1];
            
            // Skip if already processed this mention
            if (processedMentions.has(mentionedUsername)) continue;
            processedMentions.add(mentionedUsername);
            
            try {
                // Find the mentioned user
                const mentionedUser = await UserModel.findOne({
                    username: new RegExp(`^${mentionedUsername}$`, 'i')
                });
                
                if (mentionedUser && mentionedUser._id.toString() !== userId) {
                    // Create mention notification
                    await NotificationModel.create({
                        recipientId: mentionedUser._id,
                        senderId: userId,
                        type: 'mention',
                        postId,
                        commentId,
                        message: `mentioned you in a reply: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
                        read: false
                    });
                }
            } catch (err) {
                console.error('Failed to process mention in reply:', err);
                // Continue with the next mention
            }
        }
        
        res.status(200).json({
            message: "Reply added successfully",
            success: true,
            reply: addedReply
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

// Like/unlike a comment
export const likeComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const { userId } = req.body;
        
        const post = await PostModel.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }
        
        // Find the comment to like
        const commentIndex = post.comments.findIndex(
            comment => comment._id.toString() === commentId
        );
        
        if (commentIndex === -1) {
            return res.status(404).json({
                message: "Comment not found",
                success: false
            });
        }
        
        // Get the comment likes array (initialize if not existing)
        if (!post.comments[commentIndex].likes) {
            post.comments[commentIndex].likes = [];
        }
        
        // Check if the user already liked the comment
        const likedIndex = post.comments[commentIndex].likes.indexOf(userId);
        let action;
        
        if (likedIndex === -1) {
            // Like the comment
            post.comments[commentIndex].likes.push(userId);
            action = 'liked';
        } else {
            // Unlike the comment
            post.comments[commentIndex].likes.splice(likedIndex, 1);
            action = 'unliked';
        }
        
        await post.save();
        
        // Create notification if the comment is liked (not unliked)
        if (action === 'liked' && post.comments[commentIndex].userId !== userId) {
            try {
              // Get a truncated version of the comment text for the notification
              const commentText = post.comments[commentIndex].text;
              const truncatedText = commentText.length > 40 
                ? `${commentText.substring(0, 40)}...` 
                : commentText;
                
              await NotificationModel.create({
                recipientId: post.comments[commentIndex].userId,
                senderId: userId,
                type: 'like',
                postId,
                commentId,
                message: `liked your comment: "${truncatedText}"`,
                read: false
              });
            } catch (err) {
              console.error('Failed to create comment like notification:', err);
              // Continue even if notification creation fails
            }
          }
        
        res.status(200).json({
            message: `Comment ${action} successfully`,
            success: true,
            action,
            comment: {
                _id: commentId,
                likes: post.comments[commentIndex].likes
            }
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Like/unlike a reply
export const likeReply = async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const replyId = req.params.replyId;
        const { userId } = req.body;
        
        const post = await PostModel.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }
        
        // Find the comment containing the reply
        const commentIndex = post.comments.findIndex(
            comment => comment._id.toString() === commentId
        );
        
        if (commentIndex === -1) {
            return res.status(404).json({
                message: "Comment not found",
                success: false
            });
        }
        
        // Find the reply to like
        const replyIndex = post.comments[commentIndex].replies.findIndex(
            reply => reply._id.toString() === replyId
        );
        
        if (replyIndex === -1) {
            return res.status(404).json({
                message: "Reply not found",
                success: false
            });
        }
        
        // Get the reply likes array (initialize if not existing)
        if (!post.comments[commentIndex].replies[replyIndex].likes) {
            post.comments[commentIndex].replies[replyIndex].likes = [];
        }
        
        // Check if the user already liked the reply
        const likedIndex = post.comments[commentIndex].replies[replyIndex].likes.indexOf(userId);
        let action;
        
        if (likedIndex === -1) {
            // Like the reply
            post.comments[commentIndex].replies[replyIndex].likes.push(userId);
            action = 'liked';
        } else {
            // Unlike the reply
            post.comments[commentIndex].replies[replyIndex].likes.splice(likedIndex, 1);
            action = 'unliked';
        }
        
        await post.save();
        
        // Create notification if the reply is liked (not unliked)
        if (action === 'liked' && post.comments[commentIndex].replies[replyIndex].userId !== userId) {
            try {
              // Get a truncated version of the reply text for the notification
              const replyText = post.comments[commentIndex].replies[replyIndex].text;
              const truncatedText = replyText.length > 40 
                ? `${replyText.substring(0, 40)}...` 
                : replyText;
                
              await NotificationModel.create({
                recipientId: post.comments[commentIndex].replies[replyIndex].userId,
                senderId: userId,
                type: 'like',
                postId,
                commentId,
                message: `liked your reply: "${truncatedText}"`,
                read: false
              });
            } catch (err) {
              console.error('Failed to create reply like notification:', err);
              // Continue even if notification creation fails
            }
          }
        
        res.status(200).json({
            message: `Reply ${action} successfully`,
            success: true,
            action,
            reply: {
                _id: replyId,
                likes: post.comments[commentIndex].replies[replyIndex].likes
            }
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

export const getPostsByLocation = async (req, res) => {
    try {
      const locationName = req.params.locationName;
  
      // Caută postările care au location.name egal cu locationName
      const posts = await PostModel.find({
        "location.name": locationName,
      }).sort({ createdAt: -1 }); // Sortează postările, cele mai recente primele
  
      if (!posts || posts.length === 0) {
        return res.status(404).json({
          message: "No posts found for this location",
          success: false,
        });
      }
  
      res.status(200).json({
        message: "Posts fetched successfully",
        success: true,
        posts,
      });
    } catch (error) {
      console.error("Error fetching posts by location:", error);
      res.status(500).json({
        message: error.message || "An error occurred while fetching posts",
        success: false,
      });
    }
  };


export const searchTags = async (req, res) => {
    try {
      console.log("Request received for searchTags");
      console.log("Query parameters:", req.query);
      console.log("Full URL:", req.originalUrl);
  
      // Acceptă ambele tipuri de parametri pentru flexibilitate
      const searchTerm = req.query.query || req.query.tag;
  
      console.log("Extracted search term:", searchTerm);
  
      if (!searchTerm) {
        console.error("Search term is missing in request");
        return res.status(400).json({
          message: "Search term is required (use 'query' or 'tag' parameter)",
          success: false,
        });
      }
  
      console.log(`Searching for tags matching: "${searchTerm}"`);
  
      // Căutăm postările care conțin tag-uri ce se potrivesc cu searchTerm
      const posts = await PostModel.find({
        tags: { $regex: searchTerm, $options: "i" }, // Căutare case-insensitive
      });
  
      // Construim un obiect pentru a număra postările pentru fiecare tag
      const tagCounts = {};
      posts.forEach((post) => {
        post.tags.forEach((tag) => {
          // Verificăm dacă tag-ul conține searchTerm (case-insensitive)
          if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      });
  
      // Transformăm tagCounts într-o listă de obiecte cu name și postCount
      const tagsWithCount = Object.keys(tagCounts).map((tag) => ({
        name: tag,
        postCount: tagCounts[tag],
      }));
  
      console.log(`Returning tags with counts:`, tagsWithCount);
  
      res.status(200).json({
        message: "Tags fetched successfully",
        success: true,
        tags: tagsWithCount,
      });
    } catch (error) {
      console.error("Error in searchTags:", error);
      res.status(500).json({
        message: error.message || String(error),
        success: false,
      });
    }
  };
  
  // Get posts by tag name
  export const getPostsByTag = async (req, res) => {
    try {
      const { tagName } = req.params;
      
      if (!tagName) {
        return res.status(400).json({
          message: "Tag name is required",
          success: false
        });
      }
      
      console.log(`Fetching posts for tag: "${tagName}"`);
      
      // Normalize the tag name (remove # if present and convert to lowercase)
      const normalizedTag = tagName.startsWith('#') ? tagName.substring(1).toLowerCase() : tagName.toLowerCase();
      
      // Find posts with the specified tag
      const posts = await PostModel.find({
        tags: { $in: [normalizedTag] }
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${posts.length} posts with tag "${normalizedTag}"`);
      
      res.status(200).json({
        message: "Posts fetched successfully",
        success: true,
        posts
      });
      
    } catch (error) {
      console.error("Error fetching posts by tag:", error);
      res.status(500).json({
        message: error.message || error,
        success: false
      });
    }
  };

  export const getPopularPosts = async (req, res) => {
    try {
      // Get posts with the most interactions (likes + comments)
      const popularPosts = await PostModel.aggregate([
        { 
          $addFields: {
            likeCount: { $size: { $ifNull: ["$likes", []] } },
            commentCount: { $size: { $ifNull: ["$comments", []] } },
            totalInteractions: { 
              $add: [
                { $size: { $ifNull: ["$likes", []] } },
                { $size: { $ifNull: ["$comments", []] } }
              ]
            }
          }
        },
        { $sort: { totalInteractions: -1 } },
        { $limit: 10 }
      ]);
      
      res.status(200).json({
        message: "Popular posts fetched successfully",
        success: true,
        posts: popularPosts
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || error,
        success: false
      });
    }
  };