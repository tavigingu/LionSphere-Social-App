import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

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

        const token_data = {
            id: user._id,
            email: user.email,
            role: user.role 
        }

        const token = await jwt.sign(token_data, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })

        const cookie_options = {
            httpOnly: true,
            secure: true
        }

        //remove password from user object
        const { password:_, ...userWithoutPassword } = user._doc;

        res.cookie('token', token, cookie_options)
            .status(200)
            .json({
                message: "Login successfully",
                success: true,
                user: userWithoutPassword,
                token: token // Include token in response
            });

    } catch(error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

// Similarly update the register function
export const register = async (req, res) => {
    try {
        const { username, email, password, firstname, lastname } = req.body;
        
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required",
                success: false
            });
        }
        
        // Check if user already exists
        const existingUser = await UserModel.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });
        
        if (existingUser) {
            return res.status(409).json({
                message: "User with this email or username already exists",
                success: false
            });
        }
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = new UserModel({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstname: firstname || "",
            lastname: lastname || "",
            role: "user"
        });
        
        // Save the user first
        const savedUser = await newUser.save();
        
        // Now create token with the saved user data
        const token_data = {
            id: savedUser._id,
            email: savedUser.email,
            role: savedUser.role
        }
        
        const token = await jwt.sign(token_data, process.env.JWT_SECRET_KEY, { expiresIn: '1d'});

        const cookie_options = {
            httpOnly: true,
            secure: true
        }
        
        // Remove password from user object
        const { password:_, ...userWithoutPassword } = savedUser._doc;

        res.cookie('token', token, cookie_options)
            .status(201)
            .json({
                message: "User registered successfully",
                success: true,
                user: userWithoutPassword,
                token: token // Include token in response
            });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

export const logout = async (req, res) => {
    try {
        // Ștergem cookie-ul 'token' setând o dată de expirare în trecut
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict' // Opțional, pentru securitate suplimentară
        });

        // Returnăm un răspuns JSON care indică succesul delogării
        return res.status(200).json({
            message: "Logged out successfully",
            success: true,
            user: null // Indică faptul că utilizatorul nu mai este autentificat
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
};