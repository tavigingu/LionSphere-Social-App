export interface IPost {
  _id?: string;
  userId: string;
  username: string;
  desc: string;
  likes: string[];
  savedBy?: string[];
  image?: string;
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  tags?: string[]; // Hashtags extracted from description
  taggedUsers?: {
    userId: string;
    username: string;
    position: {
      x: number; // Percentage position (0-100) on the image
      y: number; // Percentage position (0-100) on the image
    }
  }[];
  createdAt?: string;
  updatedAt?: string;
  comments?: IComment[];
}

export interface IComment {
  _id?: string;
  userId: string;
  text: string;
  likes?: string[];
  createdAt?: string;
  replies?: IReply[];
}

export interface IReply {
  _id?: string;
  userId: string;
  text: string;
  likes?: string[];
  createdAt?: string;
}

export interface PostState {
  posts: IPost[];
  timelinePosts: IPost[];
  taggedPosts: IPost[];
  userPosts: IPost[];
  savedPosts: IPost[]; // Added savedPosts array
  tagPosts: IPost[];
  currentPost: IPost | null;
  loading: boolean;
  error: string | null;
}