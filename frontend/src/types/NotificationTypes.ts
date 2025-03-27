
export interface INotification {
    _id: string;
    recipientId: string;
    senderId: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    postId?: string;
    commentId?: string;
    read: boolean;
    message: string;
    createdAt: string;
    updatedAt: string;
    sender?: {
      username: string;
      profilePicture?: string;
    };
  }
  
  export interface NotificationState {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
  }