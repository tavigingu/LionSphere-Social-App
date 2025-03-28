export interface IPost {
  _id?: string;
  userId: string;
  username: string;
  desc: string;
  likes: string[];
  savedBy?: string[]; // Added savedBy array
  image?: string;
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
  userPosts: IPost[];
  savedPosts: IPost[]; // Added savedPosts array
  currentPost: IPost | null;
  loading: boolean;
  error: string | null;
}