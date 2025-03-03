import { getTimelinePosts, likePost, createPost } from "../api/Post";
import { PostState } from "../types/PostTypes"
import { create } from 'zustand';
import { IPost } from "../types/PostTypes";

interface PostStore extends PostState {
    fetchTimelinePosts: (userId: string) => Promise<void>;
    //fetchUserPosts: (userId: string) => Promise<void>;
    likePost: (postId: string, userId: string) => Promise<void>
    createNewPost: (postData: Omit<IPost, '_id' | 'username' | 'likes' | 'createdAt' | 'updatedAt'>) => Promise<IPost>;
    //addComment: (postId: string, userId: string, text: string) => Promise<void>;
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

    clearError: () => set({ error: null }),
  
    resetState: () => set(initialState)
}));


export default usePostStore;