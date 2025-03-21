import express from "express";
import { get } from "mongoose";
import { getUser, updateUser, deleteUser, followUser, unfollowUser, searchUsers } from "../controller/UserController.js";


const router = express.Router();

router.get('/search', searchUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/follow', followUser);
router.post('/:id/unfollow', unfollowUser);


export default router;