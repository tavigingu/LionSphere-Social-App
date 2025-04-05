import express from 'express';
import { createPost, getPost, updatePost, deletePost, likePost, getTimelinePosts, commentPost, getUserPosts, 
    savePost, getSavedPosts, replyToComment, likeComment, likeReply, 
    getTaggedPosts} from '../controller/PostController.js';

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
router.get('/:id/tagged', getTaggedPosts);
router.post('/:postId/comment/:commentId/reply', replyToComment);
router.put('/:postId/comment/:commentId/like', likeComment);
router.put('/:postId/comment/:commentId/reply/:replyId/like', likeReply);

export default router;