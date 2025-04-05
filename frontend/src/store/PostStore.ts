import { getTimelinePosts, likePost as likePostApi, createPost as createPostApi, commentOnPost, deletePost as deletePostApi, savePost as savePostApi, getSavedPosts as getSavedPostsApi, getTaggedPosts, replyToComment, likeComment, likeReply } from "../api/Post";
import { PostState, IPost } from "../types/PostTypes";
import { create } from 'zustand';

interface PostStore extends PostState {
    fetchTimelinePosts: (userId: string) => Promise<void>;
    fetchUserPosts: (userId: string) => Promise<void>;
    fetchTaggedPosts: (userId: string) => Promise<void>; // Adăugat
    likePost: (postId: string, userId: string) => Promise<void>;
    savePost: (postId: string, userId: string) => Promise<void>;
    createNewPost: (postData: Omit<IPost, '_id' | 'username' | 'likes' | 'savedBy' | 'createdAt' | 'updatedAt'>) => Promise<IPost>;
    deletePost: (postId: string, userId: string) => Promise<void>;
    addComment: (postId: string, userId: string, text: string) => Promise<void>;
    fetchSavedPosts: (userId: string) => Promise<void>;
    replyToComment: (postId: string, commentId: string, userId: string, text: string) => Promise<void>;
    likeComment: (postId: string, commentId: string, userId: string) => Promise<void>;
    likeReply: (postId: string, commentId: string, replyId: string, userId: string) => Promise<void>;
    clearError: () => void;
    resetState: () => void;
}

const initialState: PostState = {
    posts: [],
    timelinePosts: [],
    userPosts: [],
    savedPosts: [],
    taggedPosts: [], // Adăugat
    currentPost: null,
    loading: false,
    error: null
}

const usePostStore = create<PostStore>((set, get) => ({
    ...initialState,

    fetchTimelinePosts: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const posts = await getTimelinePosts(userId);
            set({
                timelinePosts: posts,
                posts: posts,
                loading: false  
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch timeline posts';
            set({ error: errorMessage, loading: false });
        }
    },

    fetchUserPosts: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const posts = await getTimelinePosts(userId);
            const userPosts = posts.filter(post => post.userId === userId);
            set({
                userPosts: userPosts,
                loading: false  
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user posts';
            set({ error: errorMessage, loading: false });
        }
    },

    fetchTaggedPosts: async (userId: string) => { // Adăugat
        set({ loading: true, error: null });
        try {
            const taggedPosts = await getTaggedPosts(userId);
            set({
                taggedPosts: taggedPosts,
                loading: false  
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tagged posts';
            set({ error: errorMessage, loading: false });
        }
    },

    likePost: async (postId: string, userId: string) => {
        try {
            await likePostApi(postId, userId);
          
            const updatePostsWithLike = (posts: IPost[]) =>
                posts.map((post) => {
                    if (post._id === postId) {
                        const isLiked = post.likes.includes(userId);
                        return {
                            ...post,
                            likes: isLiked
                                ? post.likes.filter((id) => id !== userId)
                                : [...post.likes, userId],
                        };
                    }
                    return post;
                });
    
            set((state) => ({
                timelinePosts: updatePostsWithLike(state.timelinePosts),
                userPosts: updatePostsWithLike(state.userPosts),
                savedPosts: updatePostsWithLike(state.savedPosts),
                taggedPosts: updatePostsWithLike(state.taggedPosts), // Adăugat
                posts: updatePostsWithLike(state.posts),
                currentPost: state.currentPost?._id === postId
                    ? {
                        ...state.currentPost,
                        likes: state.currentPost.likes.includes(userId)
                            ? state.currentPost.likes.filter((id) => id !== userId)
                            : [...state.currentPost.likes, userId],
                    }
                    : state.currentPost,
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to like post';
            set({ error: errorMessage });
        }
    },

    savePost: async (postId: string, userId: string) => {
        try {
            await savePostApi(postId, userId);
            
            const updatePostsWithSave = (posts: IPost[]) => {
                return posts.map((post) => {
                    if (post._id === postId) {
                        const savedBy = post.savedBy || [];
                        const isSaved = savedBy.includes(userId);
                        return {
                            ...post,
                            savedBy: isSaved
                                ? savedBy.filter((id) => id !== userId)
                                : [...savedBy, userId],
                        };
                    }
                    return post;
                });
            };
    
            set((state) => {
                const updatedTimelinePosts = updatePostsWithSave(state.timelinePosts);
                const updatedUserPosts = updatePostsWithSave(state.userPosts);
                const updatedPosts = updatePostsWithSave(state.posts);
                const updatedTaggedPosts = updatePostsWithSave(state.taggedPosts); // Adăugat
                
                let updatedSavedPosts = [...state.savedPosts];
                const post = state.timelinePosts.find(p => p._id === postId) ||
                            state.userPosts.find(p => p._id === postId) ||
                            state.posts.find(p => p._id === postId) ||
                            state.savedPosts.find(p => p._id === postId) ||
                            state.taggedPosts.find(p => p._id === postId); // Adăugat
                
                if (post) {
                    const savedBy = post.savedBy || [];
                    const isSaved = savedBy.includes(userId);
                    
                    if (isSaved) {
                        updatedSavedPosts = state.savedPosts.filter(p => p._id !== postId);
                    } else {
                        const postExists = state.savedPosts.some(p => p._id === postId);
                        if (!postExists) {
                            const updatedPost = {
                                ...post,
                                savedBy: [...savedBy, userId]
                            };
                            updatedSavedPosts = [...state.savedPosts, updatedPost];
                        } else {
                            updatedSavedPosts = updatePostsWithSave(state.savedPosts);
                        }
                    }
                }
                
                return {
                    timelinePosts: updatedTimelinePosts,
                    userPosts: updatedUserPosts,
                    posts: updatedPosts,
                    savedPosts: updatedSavedPosts,
                    taggedPosts: updatedTaggedPosts, // Adăugat
                    currentPost: state.currentPost?._id === postId
                        ? {
                            ...state.currentPost,
                            savedBy: (state.currentPost.savedBy || []).includes(userId)
                                ? (state.currentPost.savedBy || []).filter((id) => id !== userId)
                                : [...(state.currentPost.savedBy || []), userId]
                        }
                        : state.currentPost
                };
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save post';
            set({ error: errorMessage });
        }
    },

    fetchSavedPosts: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const savedPosts = await getSavedPostsApi(userId);
            set({
                savedPosts: savedPosts,
                loading: false  
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch saved posts';
            set({ error: errorMessage, loading: false });
        }
    },

    createNewPost: async (postData) => {
        set({ loading: true, error: null });
        try {
          const newPost = await createPostApi(postData);
          
          set((state) => ({
            timelinePosts: [newPost, ...state.timelinePosts],
            userPosts: [newPost, ...state.userPosts],
            posts: [newPost, ...state.posts],
            taggedPosts: newPost.taggedUsers?.some(tagged => tagged.userId === postData.userId) 
                ? [newPost, ...state.taggedPosts] 
                : state.taggedPosts, // Adăugat
            loading: false,
          }));
          
          return newPost;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
          set({ error: errorMessage, loading: false });
          throw error;
        }
    },

    addComment: async(postId: string, userId: string, text: string) => {
        try {
            await commentOnPost(postId, userId, text);
            
            const currentUser = get().timelinePosts.find(post => post._id === postId)?.userId;
            if (currentUser) {
                const posts = await getTimelinePosts(currentUser);
                set({
                    timelinePosts: posts,
                    posts: posts
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
            set({ error: errorMessage });
        }
    },

    replyToComment: async (postId, commentId, userId, text) => {
        try {
            await replyToComment(postId, commentId, userId, text);
            
            const currentUser = get().timelinePosts.find(post => post._id === postId)?.userId;
            if (currentUser) {
                const posts = await getTimelinePosts(userId);
                set({
                    timelinePosts: posts,
                    posts: posts
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reply to comment';
            set({ error: errorMessage });
        }
    },
    
    likeComment: async (postId, commentId, userId) => {
        try {
            const result = await likeComment(postId, commentId, userId);
            
            const updatePostsWithCommentLike = (posts: IPost[]) =>
                posts.map((post) => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            comments: post.comments?.map(comment => {
                                if (comment._id === commentId) {
                                    return {
                                        ...comment,
                                        likes: result.action === 'liked'
                                            ? [...(comment.likes || []), userId]
                                            : (comment.likes || []).filter(id => id !== userId)
                                    };
                                }
                                return comment;
                            })
                        };
                    }
                    return post;
                });
            
            set((state) => ({
                timelinePosts: updatePostsWithCommentLike(state.timelinePosts),
                userPosts: updatePostsWithCommentLike(state.userPosts),
                savedPosts: updatePostsWithCommentLike(state.savedPosts),
                taggedPosts: updatePostsWithCommentLike(state.taggedPosts), // Adăugat
                posts: updatePostsWithCommentLike(state.posts)
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to like comment';
            set({ error: errorMessage });
        }
    },
    
    likeReply: async (postId, commentId, replyId, userId) => {
        try {
            const result = await likeReply(postId, commentId, replyId, userId);
            
            const updatePostsWithReplyLike = (posts: IPost[]) =>
                posts.map((post) => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            comments: post.comments?.map(comment => {
                                if (comment._id === commentId) {
                                    return {
                                        ...comment,
                                        replies: comment.replies?.map(reply => {
                                            if (reply._id === replyId) {
                                                return {
                                                    ...reply,
                                                    likes: result.action === 'liked'
                                                        ? [...(reply.likes || []), userId]
                                                        : (reply.likes || []).filter(id => id !== userId)
                                                };
                                            }
                                            return reply;
                                        })
                                    };
                                }
                                return comment;
                            })
                        };
                    }
                    return post;
                });
            
            set((state) => ({
                timelinePosts: updatePostsWithReplyLike(state.timelinePosts),
                userPosts: updatePostsWithReplyLike(state.userPosts),
                savedPosts: updatePostsWithReplyLike(state.savedPosts),
                taggedPosts: updatePostsWithReplyLike(state.taggedPosts), // Adăugat
                posts: updatePostsWithReplyLike(state.posts)
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to like reply';
            set({ error: errorMessage });
        }
    },

    deletePost: async(postId: string, userId: string) => {
        try {
            set({ loading: true, error: null });
            await deletePostApi(postId, userId);
          
            set((state) => ({
                timelinePosts: state.timelinePosts.filter(post => post._id !== postId),
                userPosts: state.userPosts.filter(post => post._id !== postId),
                savedPosts: state.savedPosts.filter(post => post._id !== postId),
                taggedPosts: state.taggedPosts.filter(post => post._id !== postId), // Adăugat
                posts: state.posts.filter(post => post._id !== postId),
                loading: false
            }));
          
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
            set({ error: errorMessage, loading: false });
        }
    },

    clearError: () => set({ error: null }),
  
    resetState: () => set(initialState)
}));

export default usePostStore;