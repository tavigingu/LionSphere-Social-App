export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}  

export interface IUser {
  _id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  about: string;
  worksAt: string;
  occupation: string;
  city: string;
  followers: string[]; 
  following: string[]; 
  // Social media accounts
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  coverPicture?: string;
}

export interface AuthResponse {
  message: string;
  success: boolean;
  user: IUser;
  token: string;  
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}