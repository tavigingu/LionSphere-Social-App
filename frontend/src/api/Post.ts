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

export const createPost = async (postData: {
    userId: string;
    desc: string;
    image?: string;
  }): Promise<IPost> => {
    console.log("API: Creating post with data:", postData);
    
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