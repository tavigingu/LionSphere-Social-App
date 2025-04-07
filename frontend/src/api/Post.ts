import { IPost }  from '../types/PostTypes'
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

interface getPostsResponse {
    message: string,
    success: boolean,
    posts: IPost[]
}

export const getTimelinePosts = async (userId: string ): Promise<IPost[]> => {
    try {
        const response = await axios.get<getPostsResponse>(`${BASE_URL}/post/${userId}/timeline`);
        return response.data.posts;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Get posts failed:', error.response?.data);
            throw new Error(`Get posts failed: ${error.response?.data?.message || 'Unknown error'}`);
          }
        throw error;
    }
}

export const getuserPosts = async( userId: string) : Promise<IPost[]> => {
  try{
    const response = await axios.get<getPostsResponse>(`${BASE_URL}/post/${userId}/posts`);
    return response.data.posts
  } catch (error) {
      if(axios.isAxiosError(error)){
        console.error('Get posts failed:', error.response?.data);
        throw new Error(`Get posts failed: ${error.response?.data?.message} || 'Unknown error'}`);
      }
      throw error;
  }
}

export const likePost = async (postId: string, userId: string) : Promise<void> => {
  try {
      const response = await axios.put<{ 
          message: string, 
          success: boolean, 
          action: 'liked' | 'unliked',
          post: {
              userId: string;
              _id: string;
          }
      }>(
          `${BASE_URL}/post/${postId}/like`,
          { userId }
      );
      
      if(!response.data.success) {
          throw new Error(response.data.message || 'Failed to like/unlike post');
      }
      
      // Aici se creează notificarea dacă postarea a fost apreciată (nu dezapreciată)
      // și dacă utilizatorul care apreciază nu este proprietarul postării
      if (response.data.action === 'liked' && response.data.post.userId !== userId) {
          try {
              // Aici se face apelul către API-ul de notificări pentru a crea notificarea
              await axios.post(`${BASE_URL}/notification`, {
                  recipientId: response.data.post.userId,  // Proprietarul postării
                  senderId: userId,                        // Utilizatorul care a dat like
                  type: 'like',                           // Tipul notificării
                  postId: postId,                         // ID-ul postării
                  message: 'liked your post'              // Mesajul notificării
              });
          } catch (err) {
              // Continuă chiar dacă crearea notificării eșuează
              console.error('Failed to create like notification:', err);
          }
      }
  } catch(error) {
      // Gestionează eroarea
      if (axios.isAxiosError(error)) {
          console.error('Failed to like/unlike post:', error.response?.data);
          throw new Error(error.response?.data?.message || 'Failed to like/unlike post');
      }
      throw error;
  }
}

// Actualizare funcție savePost pentru a evita slash-ul final
export const savePost = async (postId: string, userId: string): Promise<void> => {
  try {
    console.log(`Saving post with ID: ${postId} for user: ${userId}`);
    const response = await axios.put<{ 
        message: string, 
        success: boolean, 
        action: 'saved' | 'unsaved',
        post: {
            userId: string;
            _id: string;
        }
    }>(
        `${BASE_URL}/post/${postId}/save`, // Fără slash final
        { userId }
    );
    
    console.log('Save post response:', response.data);
    
    if(!response.data.success) {
        throw new Error(response.data.message || 'Failed to save/unsave post');
    }
  } catch(error) {
    if (axios.isAxiosError(error)) {
        console.error('Failed to save/unsave post:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to save/unsave post');
    }
    throw error;
  }
};

// Funcție pentru a obține postările salvate
export const getSavedPosts = async (userId: string): Promise<IPost[]> => {
  try {
    const response = await axios.get<{
      message: string,
      success: boolean,
      posts: IPost[]
    }>(`${BASE_URL}/post/${userId}/saved`);
    
    if(response.data.success) {
      return response.data.posts;
    } else {
      throw new Error(response.data.message || 'Failed to fetch saved posts');
    }
  } catch(error) {
    if (axios.isAxiosError(error)) {
        console.error('Failed to fetch saved posts:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to fetch saved posts');
    }
    throw error;
  }
};

export const getTaggedPosts = async (userId: string): Promise<IPost[]> => {
  try {
    const response = await axios.get<{
      message: string,
      success: boolean,
      posts: IPost[]
    }>(`${BASE_URL}/post/${userId}/tagged`);
    
    if (response.data.success) {
      return response.data.posts;
    } else {
      throw new Error(response.data.message || 'Failed to fetch tagged posts');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch tagged posts:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch tagged posts');
    }
    throw error;
  }
};

// export const createPost = async (postData: {
//     userId: string;
//     desc: string;
//     image?: string;
//   }): Promise<IPost> => {
//     console.log("API: Creating post with data:", postData);
    
//     try {
//       console.log("API: Using BASE_URL:", BASE_URL);
      
//       const response = await axios.post<{ message: string; success: boolean; post: IPost }>(
//         `${BASE_URL}/post`,
//         postData,
//         { withCredentials: true }
//       );
      
//       console.log("API: Response from server:", response.data);
      
//       if (response.data.success) {
//         return response.data.post;
//       } else {
//         console.error("API: Server returned success=false:", response.data.message);
//         throw new Error(response.data.message || 'Failed to create post');
//       }
//     } catch (error) {
//       console.error("API: Error creating post:", error);
      
//       if (axios.isAxiosError(error)) {
//         console.error('API: Axios error details:', {
//           status: error.response?.status,
//           data: error.response?.data,
//           headers: error.response?.headers
//         });
//         throw new Error(error.response?.data?.message || 'Failed to create post');
//       }
      
//       throw error;
//     }
// };

export const createPost = async (postData: {
  userId: string;
  desc: string;
  image: string;
  location?: {
    name: string;
    coordinates?: { lat: number; lng: number }
  };
  taggedUsers?: {
    userId: string;
    username: string;
    position: { x: number; y: number }
  }[];
}): Promise<IPost> => {
  console.log("API: Creating post with data:", {
    userId: postData.userId,
    desc: postData.desc,
    imagePresent: !!postData.image,
    locationName: postData.location?.name,
    taggedUsersCount: postData.taggedUsers?.length || 0
  });
  
  try {
    console.log("API: Using BASE_URL:", BASE_URL);
    
    const response = await axios.post<{ message: string; success: boolean; post: IPost }>(
      `${BASE_URL}/post`,
      postData,
      { withCredentials: true }
    );
    
    console.log("API: Response from server:", response.data);
    
    if (response.data.success) {
      return response.data.post;
    } else {
      console.error("API: Server returned success=false:", response.data.message);
      throw new Error(response.data.message || 'Failed to create post');
    }
  } catch (error) {
    console.error("API: Error creating post:", error);
    
    if (axios.isAxiosError(error)) {
      console.error('API: Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
    
    throw error;
  }
};

export const commentOnPost = async (postId: string, userId: string, text: string): Promise<void> => {
  try {
    const response = await axios.put<{
      message: string, 
      success: boolean,
      post: {
        userId: string;
        _id: string;
      },
      comment: {
        _id: string;
        text: string;
      }
    }>(
      `${BASE_URL}/post/${postId}/comment`,
      { userId, text }
    );

    if(!response.data.success) {
      throw new Error(response.data.message || 'Failed to comment on post');
    }
    
    // Create notification if the commenter is not the post owner
    if (response.data.post.userId !== userId) {
      try {
        // Create notification for comment
        await axios.post(`${BASE_URL}/notification`, {
          recipientId: response.data.post.userId,  // Post owner
          senderId: userId,                        // Commenter
          type: 'comment',                         // Notification type
          postId: postId,                          // Post ID
          commentId: response.data.comment._id,    // Comment ID
          message: `commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"` // Include comment text in notification
        });
      } catch (err) {
        // Continue even if notification creation fails
        console.error('Failed to create comment notification:', err);
      }
    }
  } catch(error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to comment on post:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to comment on post');
    }
    throw error;
  }
}

export const deletePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const response = await axios.delete(`${BASE_URL}/post/${postId}`, {
      data: { userId } 
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete post');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to delete post:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete post');
    }
    throw error;
  }
};

export const replyToComment = async (
  postId: string,
  commentId: string,
  userId: string,
  text: string
): Promise<void> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/post/${postId}/comment/${commentId}/reply`,
      { userId, text }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reply to comment');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to reply to comment:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to reply to comment');
    }
    throw error;
  }
};

// Like/unlike a comment
export const likeComment = async (
  postId: string,
  commentId: string,
  userId: string
): Promise<{ action: 'liked' | 'unliked', likes: string[] }> => {
  try {
    const response = await axios.put<{
      message: string;
      success: boolean;
      action: 'liked' | 'unliked';
      comment: {
        _id: string;
        likes: string[];
      };
    }>(
      `${BASE_URL}/post/${postId}/comment/${commentId}/like`,
      { userId }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to like/unlike comment');
    }

    return {
      action: response.data.action,
      likes: response.data.comment.likes
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to like/unlike comment:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to like/unlike comment');
    }
    throw error;
  }
};

// Like/unlike a reply
export const likeReply = async (
  postId: string,
  commentId: string,
  replyId: string,
  userId: string
): Promise<{ action: 'liked' | 'unliked', likes: string[] }> => {
  try {
    const response = await axios.put<{
      message: string;
      success: boolean;
      action: 'liked' | 'unliked';
      reply: {
        _id: string;
        likes: string[];
      };
    }>(
      `${BASE_URL}/post/${postId}/comment/${commentId}/reply/${replyId}/like`,
      { userId }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to like/unlike reply');
    }

    return {
      action: response.data.action,
      likes: response.data.reply.likes
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to like/unlike reply:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to like/unlike reply');
    }
    throw error;
  }
};

export const deleteComment = async (
  postId: string, 
  commentId: string,
  userId: string
): Promise<void> => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/post/${postId}/comment/${commentId}`,
      { data: { userId } }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete comment');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to delete comment:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete comment');
    }
    throw error;
  }
};

export const deleteReply = async (
  postId: string,
  commentId: string,
  replyId: string,
  userId: string
): Promise<void> => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/post/${postId}/comment/${commentId}/reply/${replyId}`,
      { data: { userId } }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete reply');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to delete reply:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete reply');
    }
    throw error;
  }
};

export const searchTags = async (query: string): Promise<string[]> => {
  try {
    console.log(`Searching for tags with query: "${query}"`);
    
    const response = await axios.get<{
      message: string,
      success: boolean,
      tags: string[]
    }>(`${BASE_URL}/post/tags/search?query=${encodeURIComponent(query)}`);
    
    if (response.data.success) {
      // Check if tags is an array of strings or objects with _id
      const tags = response.data.tags;
      console.log('Raw tags response:', tags);
      
      // Ensure we're working with an array of strings
      let processedTags: string[] = [];
      
      if (tags && Array.isArray(tags)) {
        processedTags = tags.map(tag => {
          // If tag is an object with _id (from MongoDB aggregation)
          if (typeof tag === 'object' && tag !== null && '_id' in tag) {
            return tag._id;
          }
          // If tag is already a string
          return String(tag);
        });
      }
      
      console.log(`Found ${processedTags.length} tags:`, processedTags);
      return processedTags;
    } else {
      console.error('Tag search failed:', response.data.message);
      throw new Error(response.data.message || 'Failed to search tags');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to search tags:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to search tags');
    }
    console.error('Unexpected error during tag search:', error);
    throw error;
  }
};

// Get posts by tag name
export const getPostsByTag = async (tagName: string): Promise<IPost[]> => {
  try {
    // Normalize the tag (remove # if present)
    const normalizedTag = tagName.startsWith('#') ? tagName.substring(1) : tagName;
    
    console.log(`Fetching posts for tag: "${normalizedTag}"`);
    
    const response = await axios.get<{
      message: string,
      success: boolean,
      posts: IPost[]
    }>(`${BASE_URL}/post/tag/${encodeURIComponent(normalizedTag)}`);
    
    if (response.data.success) {
      console.log(`Found ${response.data.posts.length} posts with tag ${normalizedTag}`);
      return response.data.posts;
    } else {
      console.error('Failed to fetch posts by tag:', response.data.message);
      throw new Error(response.data.message || 'Failed to fetch posts by tag');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch posts by tag:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch posts by tag');
    }
    console.error('Unexpected error fetching posts by tag:', error);
    throw error;
  }
};



