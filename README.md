# LionSphere - Social Media Platform

LionSphere is a full-stack social media application built with the MERN stack (MongoDB, Express, React, and Node.js). It includes features like user authentication, post creation, real-time chat, stories, notifications, and more.

## Setup Instructions

### 1\. Clone the Repository

Clone the project repository from GitHub:

bash

```
git clone https://github.com/tavigingu/LionSphere-Social-App.git
```

### 2\. Restore the Database

I've sent you the database backup separately in an email attachment. Follow these steps to restore it:

1.  Extract the zip file you received by email to get the `db_backup` folder
2.  Place the `db_backup` folder in the root directory of the project
3.  Open a terminal and run:

bash

```
mongorestore --db=social-app ./db_backup/social-app
```

### 3\. Set Up the Backend

1.  Navigate to the backend directory:

bash

```
cd backend
```

1.  Install dependencies:

bash

```
npm install
```

1.  Create a `.env` file in the `backend` directory with the following content:

```
PORT=5001
MONGO_URL=mongodb://localhost:27017/social-app
JWT_SECRET_KEY=lionsphere_secret_key_2025
```

### 4\. Set Up the Frontend

1.  Open a new terminal and navigate to the frontend directory:

bash

```
cd frontend
```

1.  Install dependencies:

bash

```
npm install
```

### 5\. Run the Application

1.  Start the backend server (from the `backend` directory):

bash

```
node index.js
```

1.  Start the frontend development server (from the `frontend` directory in a new terminal):

bash

```
npm run dev
```

1.  Open your browser and navigate to:

```
http://localhost:5173
```

You should now be able to see the LionSphere application running.

## User Features

### Feed

- View personalized timeline with posts from people you follow
- Infinite scrolling for seamless browsing
- Like, comment, and save posts directly from your feed

### Profile

- Customize your profile with a profile picture, cover photo, and bio
- Display your followers and following counts
- View your posts, saved content, and tagged photos in a grid or list view
- Edit profile information at any time
- View engagement statistics for your posts

### Posts

- Create posts with images, descriptions, and hashtags
- Tag locations and other users in your posts
- Like, comment, and save posts
- View detailed insights on post engagement

### Stories (not finished)

- Create temporary stories that disappear after 24 hours
- View stories from followed users in a carousel
- See who has viewed your stories

### Chat (not finished)

- Real-time messaging with typing indicators
- See when messages are read with read receipts
- Share images in conversations
- Easily see who's online

### Social Interactions

- Follow/unfollow other users
- Get notifications for likes, comments, follows, and mentions
- Tag users in posts and comments
- Explore people you may know

### Search & Discover

- Search for users, hashtags, and locations
- Discover trending content and popular profiles
- Explore content based on your interests

## Admin Features

### Admin Dashboard

### Statistics Dashboard (just frontend)

From the admin panel, you can:

- View user growth metrics
- Track post engagement over time
- See daily active user counts
- Analyze user distribution by country
- Review comment trends
- Monitor report types
- View quick platform stats
- Export data in different formats

### User Management

In the User Management section, you can:

- Search for users by username
- View user profiles
- Delete user accounts if necessary
- Track user activity

### Reports Management

In the Reports section, you can:

- Review general reports from users
- Change report status (pending, reviewed, resolved, or dismissed)
- Reopen closed reports if needed
- Prioritize critical reports

### Reported Posts

In the Reported Posts section, you can:

- View posts that users have flagged
- See the reason for reports
- Review post content directly
- Delete posts that violate terms
- Dismiss false reports
- View reporter information

## Navigation Guide

### Regular User Navigation

```
Email: tg3@gmail.com
Password: pass123
```

1.  **Login**: Begin by logging in
2.  **Home Feed**: After logging in, you'll see your main feed with posts from people you follow. You can like post, comment, like comments, reply, mention users in comments, report the post or save the post
3.  **Explore**: Use the search icon to discover new content and users. Try to search in User section by usernames (try "ta" becauase all users are named "tavi") Tags section "puma" and in location section "London", you'll see all posts with that tag or in that location.
4.  **Post Creation**: Click the "+" button in the top navigation to create a new post, you can try also story but it is not finished
5.  **Profile**: Access your profile by clicking Profile section in dashboard or View Full Profile in the mini profile section in left side. You can edit your profile, see your followers and follwing, your post, saved posts and tagged posts.
6.  **Messages**: Open the chat section by clicking the message icon in the side navigation (can't send photos in present)
7.  **Notifications**: View your notifications by clicking the bell icon
8.  **Stories**: View and create stories from the circles at the top of your feed (photo resolution and display in story viewer isnt working in present)
9.  **Settings**: Access account settings from your profile page

### Admin Navigation

```
Email: tg9@gmail.com
Password: pass123
```

1.  **Access Admin Panel**: After logging in as admin, you'll see an "Admin" option in your dashboard
2.  **Statistics**: The default admin view shows platform statistics and metrics (just frontend)
3.  **User Management**: Click on "Users" in the admin sidebar to manage user accounts
4.  **Reports**: Click on "Reports" to review general user reports
5.  **Reported Posts**: Click on "Reported Posts" to moderate flagged content
6.  **Admin Actions**: Throughout the admin sections, you'll find action buttons to resolve issues

## Troubleshooting

If you encounter any issues with setup or running the application, please check:

1.  MongoDB is running on your system
2.  The correct ports (5001 for backend, 5173 for frontend) are available
3.  All environment variables are set correctly

Feel free to contact me if you need any assistance with the setup process.
