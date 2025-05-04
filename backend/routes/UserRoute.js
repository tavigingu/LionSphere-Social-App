
import express from "express";
import { verifyToken, allowGuest } from '../middleware/AuthMiddleware.js';
import { getUser, updateUser, deleteUser, followUser, unfollowUser, searchUsers, getSuggestedUsers } from "../controller/UserController.js";

const router = express.Router();

router.get('/suggestions', verifyToken, getSuggestedUsers);
// Guest-accessible routes
router.get('/search', allowGuest, searchUsers);
router.get('/:id', allowGuest, getUser);

// Protected routes

router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);
router.post('/:id/follow', verifyToken, followUser);
router.post('/:id/unfollow', verifyToken, unfollowUser);

export default router;