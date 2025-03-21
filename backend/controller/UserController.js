import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//get an user
export const getUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        const { password, ...userWithoutPassword } = user._doc;

        if(user)
        {
            res.status(200).json({
                message: "User found",
                success: true,
                user: userWithoutPassword
            });
        } else {
            res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

//update user
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { _id, password, role: userRole, ...updateData } = req.body;

        
        if(userId != _id && userRole !== 'admin') {
            return res.status(403).json({
                message: "You can update only your account",
                success: false
            });
        }

        const { role, _Id, __v, createdAt, updatedAt, ...allowedFields } = UserModel.schema.paths;
        const allowedUpdates = Object.keys(allowedFields);  

        const filteredUpdates = {};
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredUpdates[field] = updateData[field];
            }
        });

        // Verificăm dacă există date de actualizat
        if (Object.keys(filteredUpdates).length === 0 && !password) {
            return res.status(400).json({
                message: "No fields to update",
                success: false
            });
        }

        // Dacă există parolă nouă, o criptăm
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long",
                    success: false
                });
            }
            const salt = await bcrypt.genSalt(10);
            filteredUpdates.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: filteredUpdates },
            { 
                new: true,
                runValidators: true,
                select: '-password' // Excludem parola din rezultat
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const token_data =  {
                id: updateUser._id,
                email : updateUser.email
            }
        
        const token = await jwt.sign(token_data, process.env.JWT_SECRET_KEY, { expiresIn : '1d'})
        
        const cookie_options = {
            httpOnly : true,
            secure : true
        }
        
        res.cookie('token', token, cookie_options)
        .status(201)
        .json({
            message: "User updated successfully",
            success: true,
            user: updatedUser
        });


    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

//delete user
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { _id, role: userRole } = req.body;

        if(userId != _id && userRole !== 'admin') {
            return res.status(403).json({
                message: "You can delete only your account",
                success: false
            });
        }

        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

//follow user
export const followUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { _id } = req.body;

        if(userId === _id) {
            return res.status(403).json({
                message: "You can't follow yourself",
                success: false
            });
        }

        const user = await UserModel.findById(userId);
        const currentUser = await UserModel.findById(_id);

        if (!user || !currentUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (currentUser.following.includes(_id)) {
            return res.status(400).json({
                message: "You already follow this user",
                success: false
            });
        }

        await user.updateOne({ $push: { followers: _id } });
        await currentUser.updateOne({ $push: { following: userId } });

        res.status(200).json({
            message: "User followed successfully",
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { _id } = req.body;

        if(userId === _id) {
            return res.status(403).json({
                message: "You can't unfollow yourself",
                success: false
            });
        }

        const user = await UserModel.findById(userId);
        const currentUser = await UserModel.findById(_id);

        if (!user || !currentUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!currentUser.followers.includes(_id)) {
            return res.status(400).json({
                message: "You don't follow this user",
                success: false
            });
        }

        await user.updateOne({ $pull: { followers: _id } });
        await currentUser.updateOne({ $pull: { following: userId } });

        res.status(200).json({
            message: "User unfollowed successfully",
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
}

//search
export const searchUsers = async (req, res) => {
    console.log("[Backend] Search endpoint hit");
    console.log("[Backend] Request query:", req.query);
    console.log("[Backend] Request params:", req.params);
    
    try {
        const searchTerm = req.query.username;
        
        console.log("[Backend] Search term extracted:", searchTerm);
        
        if (!searchTerm) {
            console.log("[Backend] Search term is missing, returning 400");
            return res.status(400).json({
                message: "Search term is required",
                success: false
            });
        }

        // Construiește expresia regulată pentru a face căutarea insensibilă la majuscule
        const searchRegex = new RegExp(searchTerm, 'i');
        console.log("[Backend] Created search regex:", searchRegex);
        
        // Caută utilizatorii după username, firstname sau lastname
        console.log("[Backend] Searching in UserModel");
        const users = await UserModel.find({
            $or: [
                { username: searchRegex },
                { firstname: searchRegex },
                { lastname: searchRegex }
            ]
        }).select('-password'); // Exclude parola din rezultate
        
        console.log(`[Backend] Search complete. Found ${users.length} users`);
        console.log("[Backend] Users:", users.map(u => ({ id: u._id, username: u.username })));
        
        res.status(200).json({
            message: "Users found successfully",
            success: true,
            users
        });
        console.log("[Backend] Response sent successfully");
    } catch (error) {
        console.error("[Backend] Error in searchUsers:", error);
        res.status(500).json({
            message: error.message || String(error),
            success: false
        });
        console.log("[Backend] Error response sent");
    }
}