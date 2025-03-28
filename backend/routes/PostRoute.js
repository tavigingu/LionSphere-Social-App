import express from 'express';
import { createPost, getPost, updatePost, deletePost, likePost, getTimelinePosts, commentPost, getUserPosts, savePost, getSavedPosts } from '../controller/PostController.js';

const router = express.Router();

router.post('/', createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost); 
router.delete('/:id', deletePost);
router.put('/:id/like', likePost);
router.put('/:id/comment', commentPost)
router.put('/:id/save', savePost);
router.get('/:id/timeline', getTimelinePosts);
router.get('/:id/posts', getUserPosts)
router.get('/:id/saved', getSavedPosts);

export default router;