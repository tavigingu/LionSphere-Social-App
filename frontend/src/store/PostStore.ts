import { getTimelinePosts, likePost, createPost, commentOnPost, deletePost } from "../api/Post";
import { PostState } from "../types/PostTypes"
import { create } from 'zustand';
import { IPost } from "../types/PostTypes";

interface PostStore extends PostState {
    fetchTimelinePosts: (userId: string) => Promise<void>;
    //fetchUserPosts: (userId: string) => Promise<void>;
    likePost: (postId: string, userId: string) => Promise<void>
    createNewPost: (postData: Omit<IPost, '_id' | 'username' | 'likes' | 'createdAt' | 'updatedAt'>) => Promise<IPost>;
    deletePost: (postId: string, userId: string) => Promise<void>;
    addComment: (postId: string, userId: string, text: string) => Promise<void>;
    clearError: () => void;
    resetState: () => void;
}

const initialState: PostState =  {
    posts: [],
    timelinePosts: [],
    userPosts: [],
    currentPost: null,
    loading: false,
    error: null
}

const usePostStore = create<PostStore>((set,get) => ({
    ...initialState,

    fetchTimelinePosts: async ( userId: string) => {
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

    likePost: async (postId: string, userId: string) => {
        try {
          await likePost(postId, userId);
          
          // Update the posts in the state
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

      createNewPost: async (postData) => {
        set({ loading: true, error: null });
        try {
          const newPost = await createPost(postData);
          
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
          console.log("Comentariu adaugat")
          await commentOnPost(postId, userId, text);
          console.log("a trecut si de api")
          
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
          set({ error: errorMessage });
        }
      },

      deletePost: async(postId: string, userId: string) => {
        try {
          set({ loading: true, error: null });
          await deletePost(postId, userId);
          
          // Remove the deleted post from all relevant state arrays
          set((state) => ({
            timelinePosts: state.timelinePosts.filter(post => post._id !== postId),
            userPosts: state.userPosts.filter(post => post._id !== postId),
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