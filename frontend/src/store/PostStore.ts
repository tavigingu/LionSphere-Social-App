import { getTimelinePosts, likePost as likePostApi, createPost as createPostApi, commentOnPost, deletePost as deletePostApi, savePost as savePostApi, getSavedPosts as getSavedPostsApi } from "../api/Post";
import { PostState, IPost } from "../types/PostTypes";
import { create } from 'zustand';

interface PostStore extends PostState {
    fetchTimelinePosts: (userId: string) => Promise<void>;
    fetchUserPosts: (userId: string) => Promise<void>;
    likePost: (postId: string, userId: string) => Promise<void>;
    savePost: (postId: string, userId: string) => Promise<void>;
    createNewPost: (postData: Omit<IPost, '_id' | 'username' | 'likes' | 'savedBy' | 'createdAt' | 'updatedAt'>) => Promise<IPost>;
    deletePost: (postId: string, userId: string) => Promise<void>;
    addComment: (postId: string, userId: string, text: string) => Promise<void>;
    fetchSavedPosts: (userId: string) => Promise<void>;
    clearError: () => void;
    resetState: () => void;
}

const initialState: PostState = {
    posts: [],
    timelinePosts: [],
    userPosts: [],
    savedPosts: [],
    currentPost: null,
    loading: false,
    error: null
}

const usePostStore = create<PostStore>((set, get) => ({
    ...initialState,

    fetchTimelinePosts: async (userId: string) => {
        set({loading: true, error: null});
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
        set({loading: true, error: null});
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

    likePost: async (postId: string, userId: string) => {
        try {
            await likePostApi(postId, userId);
          
            // Update ALL post collections in the state to maintain consistency
            const updatePostsWithLike = (posts: IPost[]) =>
                posts.map((post) => {
                    if (post._id === postId) {
                        const isLiked = post.likes.includes(userId);
                        return {
                            ...post,
                            likes: isLiked
                                ? post.likes.filter((id) => id !== userId) // unlike
                                : [...post.likes, userId], // like
                        };
                    }
                    return post;
                });
    
            set((state) => ({
                timelinePosts: updatePostsWithLike(state.timelinePosts),
                userPosts: updatePostsWithLike(state.userPosts),
                savedPosts: updatePostsWithLike(state.savedPosts),
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
            
            // Update ALL post collections in the state to maintain consistency
            const updatePostsWithSave = (posts: IPost[]) => {
                return posts.map((post) => {
                    if (post._id === postId) {
                        const savedBy = post.savedBy || [];
                        const isSaved = savedBy.includes(userId);
                        return {
                            ...post,
                            savedBy: isSaved
                                ? savedBy.filter((id) => id !== userId) // unsave
                                : [...savedBy, userId], // save
                        };
                    }
                    return post;
                });
            };
    
            set((state) => {
                // Update all post collections
                const updatedTimelinePosts = updatePostsWithSave(state.timelinePosts);
                const updatedUserPosts = updatePostsWithSave(state.userPosts);
                const updatedPosts = updatePostsWithSave(state.posts);
                
                // For saved posts, handle differently if unsaving
                const post = state.timelinePosts.find(p => p._id === postId) ||
                            state.userPosts.find(p => p._id === postId) ||
                            state.posts.find(p => p._id === postId) ||
                            state.savedPosts.find(p => p._id === postId);
                
                let updatedSavedPosts = [...state.savedPosts];
                
                if (post) {
                    const savedBy = post.savedBy || [];
                    const isSaved = savedBy.includes(userId);
                    
                    if (isSaved) {
                        // If already saved, unsaving - remove from saved posts
                        updatedSavedPosts = state.savedPosts.filter(p => p._id !== postId);
                    } else {
                        // If not saved, saving - add to saved posts if not already there
                        const postExists = state.savedPosts.some(p => p._id === postId);
                        if (!postExists) {
                            // Create a new object with updated savedBy array
                            const updatedPost = {
                                ...post,
                                savedBy: [...savedBy, userId]
                            };
                            updatedSavedPosts = [...state.savedPosts, updatedPost];
                        } else {
                            // Update existing post in savedPosts
                            updatedSavedPosts = updatePostsWithSave(state.savedPosts);
                        }
                    }
                }
                
                return {
                    timelinePosts: updatedTimelinePosts,
                    userPosts: updatedUserPosts,
                    posts: updatedPosts,
                    savedPosts: updatedSavedPosts,
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
        set({loading: true, error: null});
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
          
            // Add the new post to the beginning of the posts arrays
            set((state) => ({
                timelinePosts: [newPost, ...state.timelinePosts],
                userPosts: [newPost, ...state.userPosts],
                posts: [newPost, ...state.posts],
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
            
            // After successful comment, refresh timeline to get updated posts
            const currentUser = get().timelinePosts.find(post => post._id === postId)?.userId;
            if (currentUser) {
                // No need to set loading here as we want to keep the existing posts while fetching
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

    deletePost: async(postId: string, userId: string) => {
        try {
            set({ loading: true, error: null });
            await deletePostApi(postId, userId);
          
            // Remove the deleted post from all relevant state arrays
            set((state) => ({
                timelinePosts: state.timelinePosts.filter(post => post._id !== postId),
                userPosts: state.userPosts.filter(post => post._id !== postId),
                savedPosts: state.savedPosts.filter(post => post._id !== postId),
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