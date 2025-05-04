// import express from 'express';
// import { createPost, getPost, updatePost, deletePost, likePost, getTimelinePosts, commentPost, getUserPosts, 
//     savePost, getSavedPosts, replyToComment, likeComment, likeReply, 
//     getTaggedPosts, getPostsByLocation, searchTags, getPostsByTag} from '../controller/PostController.js';

// const router = express.Router();

// router.post('/', createPost);
// router.get('/:id', getPost);
// router.put('/:id', updatePost); 
// router.delete('/:id', deletePost);
// router.put('/:id/like', likePost);
// router.put('/:id/comment', commentPost)
// router.put('/:id/save', savePost);
// router.get('/:id/timeline', getTimelinePosts);
// router.get('/:id/posts', getUserPosts)
// router.get('/:id/saved', getSavedPosts);
// router.get('/:id/tagged', getTaggedPosts);
// router.post('/:postId/comment/:commentId/reply', replyToComment);
// router.put('/:postId/comment/:commentId/like', likeComment);
// router.put('/:postId/comment/:commentId/reply/:replyId/like', likeReply);

// //router.get('/locations/search', searchLocations);
// router.get('/tags/search', searchTags);
// router.get('/tag/:tagName', getPostsByTag);
// router.get('/location/:locationName', getPostsByLocation);


// export default router;

// Modify backend/routes/PostRoute.js
import express from 'express';
import { verifyToken, authorize, allowGuest } from '../middleware/AuthMiddleware.js';
import { 
  createPost, getPost, updatePost, deletePost, likePost, 
  getTimelinePosts, commentPost, getUserPosts, 
  savePost, getSavedPosts, replyToComment, likeComment, likeReply, 
  getTaggedPosts, getPostsByLocation, searchTags, getPostsByTag, getPopularPosts
} from '../controller/PostController.js';

const router = express.Router();

// Public routes - accessible to everyone including guests
router.get('/popular', allowGuest, getPopularPosts);
router.get('/tags/search', allowGuest, searchTags);
router.get('/tag/:tagName', allowGuest, getPostsByTag);
router.get('/location/:locationName', allowGuest, getPostsByLocation);

// Semi-protected routes - guests can view but not interact
router.get('/:id', allowGuest, getPost);
router.get('/:id/posts', allowGuest, getUserPosts);
router.get('/:id/tagged', allowGuest, getTaggedPosts);

// Protected routes - require authentication
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost); 
router.delete('/:id', verifyToken, deletePost);
router.put('/:id/like', verifyToken, likePost);
router.put('/:id/comment', verifyToken, commentPost);
router.put('/:id/save', verifyToken, savePost);
router.get('/:id/timeline', verifyToken, getTimelinePosts);
router.get('/:id/saved', verifyToken, getSavedPosts);
router.post('/:postId/comment/:commentId/reply', verifyToken, replyToComment);
router.put('/:postId/comment/:commentId/like', verifyToken, likeComment);
router.put('/:postId/comment/:commentId/reply/:replyId/like', verifyToken, likeReply);

export default router;