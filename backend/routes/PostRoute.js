import express from 'express';
import { createPost, getPost, updatePost, deletePost, likePost, getTimelinePosts, commentPost } from '../controller/PostController.js';

const router = express.Router();

router.post('/', createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost); 
router.delete('/:id', deletePost);
router.put('/:id/like', likePost);
router.put('/:id/comment', commentPost)
router.get('/:id/timeline', getTimelinePosts);

export default router;