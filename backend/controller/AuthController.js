import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

export const register = async (req, res) => {
    try {
        const { username, email, password, firstname, lastname } = req.body;
        
        const existingUser = await UserModel.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() }
            ]
        })

        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email.toLowerCase() 
                    ? "Email already exists" 
                    : "Username already exists" 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstname,
            lastname
        });

        const token_data =  {
            id: newUser._id,
            email : newUser.email
        }
        const token = await jwt.sign(token_data, process.env.JWT_SECRET_KEY, { expiresIn : '1d'})

        const cookie_options = {
            httpOnly : true,
            secure : true
        }
        
        const user = await newUser.save();

        //remove password from user object
        const { password:_, ...userWithouPassword } = user._doc;

        res.cookie('token', token, cookie_options)
            .status(201)
            .json({
                message: "User registered successfully",
                success: true,
                user: userWithouPassword
            });

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email and password are required",
                success: false 
            });
        }

        const user = await UserModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                success: false 
            });
        }
        
        const verifyPassword = await bcrypt.compare(password, user.password);

         if (!verifyPassword) {
            return res.status(400).json({ 
                message: "Invalid credentials",
                success: false 
            });
        }

        if (!verifyPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token_data =  {
            id: user._id,
            email : user.email
        }
        const token = await jwt.sign(token_data, process.env.JWT_SECRET_KEY, { expiresIn : '1d'})

        const cookie_options = {
            httpOnly : true,
            secure : true
        }

        //remove password from user object
        const { password:_, ...userWithouPassword } = user._doc;

        res.cookie('token', token, cookie_options)
            .status(200)
            .json({
                message: "Login successfully",
                success: true,
                user: userWithouPassword
            });

    }catch(error) {
        return res.status(500).json({
            message : error.message || error,
            error : true
        });
    }
}