# LionSphere - Social Media Platform

LionSphere is a comprehensive social media platform with a modern and intuitive user interface built using React, TypeScript, and Tailwind CSS for the frontend, and Node.js, Express, and MongoDB for the backend.

## 🌟 Features

### Authentication
- Secure user registration and login system
- JWT-based authentication with HTTP-only cookies
- Password encryption using bcrypt

### Feed
- Personalized timeline displaying posts from followed users
- Interactive post cards with real-time like and save functionality
- Infinite scrolling for seamless content consumption

### Profiles
- Detailed user profiles with customizable information
- Profile statistics (posts, followers, following)
- Editable profile with social media links (Instagram, Facebook, LinkedIn, GitHub)
- Profile completeness indicator
- Cover and profile picture customization

### Posts
- Create posts with images
- Add location data to posts
- Tag other users in posts
- Add captions with automatic hashtag detection
- Comment on posts with mentions support
- Reply to comments
- Like/unlike posts and comments
- Save posts for later viewing

### Stories
- Create and share ephemeral stories that disappear after 24 hours
- Story viewer with navigation between users' stories
- View who has seen your stories
- Interactive story creation with image filters and adjustments
- Stories appear in a carousel at the top of the feed

### Social Interactions
- Follow/unfollow other users
- Like posts, comments, and stories
- Tag users in posts and comments
- Mention users in comments using @username
- View followers and following lists

### Realtime Chat
- Direct messaging between users
- Real-time message delivery
- Typing indicators
- Message read receipts
- Online/offline status indicators
- Unread message counters
- Support for image sharing in chats

### Notifications
- Real-time notifications for:
  - Likes on posts, comments, and stories
  - Comments on your posts
  - Replies to your comments
  - Mentions
  - New followers
- Notification center with read/unread status

### Search
- Search for users by username
- Search for posts by hashtags
- Search for posts by location
- Explore content by tags and locations

### Discovery
- "People You May Know" suggestions
- Explore trending hashtags
- View posts from specific locations

### Mobile Responsiveness
- Fully responsive design that works on mobile, tablet, and desktop

## 🛠️ Technical Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API communication
- Zustand for state management
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time features
- Bcrypt for password hashing
- Cloudinary for image storage

## 📦 Project Structure

The project is organized into two main directories:

- `frontend/`: Contains the React application
- `backend/`: Contains the Node.js/Express server

### Frontend Structure
- `src/components/`: Reusable UI components
- `src/pages/`: Page components
- `src/store/`: Zustand state management
- `src/api/`: API communication
- `src/types/`: TypeScript interfaces and types
- `src/helpers/`: Utility functions

### Backend Structure
- `config/`: Database connection and configuration
- `controller/`: Route controllers
- `models/`: Mongoose models
- `routes/`: API routes
- `index.js`: Server entry point

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Cloudinary account (for image storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lionsphere.git
   cd lionsphere
   ```
2. Install backend dependencies:
  ```bash
  cd backend
  npm install
  ```
3. Set up environment variables in .env:
  `MONGO_URL=your_mongodb_connection_string
  JWT_SECRET_KEY=your_jwt_secret
  PORT=5001
  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
  CLOUDINARY_API_KEY=your_cloudinary_api_key
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret`
4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
    ```
5. Start the backend server:
  ```bash
  cd ../backend
  node ./index.js
  ```
6. Start the frontend development server:
  ```bash
  cd ../frontend
  npm run dev
```
7. Open your browser and navigate to http://localhost:5173


