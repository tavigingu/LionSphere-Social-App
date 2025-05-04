// backend/middleware/AuthMiddleware.js
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
                    ? req.headers.authorization.split(' ')[1] 
                    : null);
    //console.log("Token found:", token);
    if (!token) {
      //console.log("No token found in request headers or cookies:", req.headers, req.cookies);
      return res.status(401).json({
        message: "Authentication required",
        success: false
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Find user
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false
    });
  }
};

// Role-based access control middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.console.log("User not found in request object:", req.user);
      ("User not found in request object:", req.user);
      return res.status(401).json({
        message: "Authentication required",
        success: false
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
        success: false
      });
    }
    
    next();
  };
};

// Guest access middleware (allows both authenticated and unauthenticated users)
export const allowGuest = (req, res, next) => {
  try {
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
                    ? req.headers.authorization.split(' ')[1] 
                    : null);
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        UserModel.findById(decoded.id)
          .then(user => {
            if (user) {
              req.user = user;
            }
            next();
          })
          .catch(() => next()); // Continue even if user lookup fails
      } catch (error) {
        // Token is invalid, continue as guest
        next();
      }
    } else {
      // No token, continue as guest
      req.user = null; // Explicitly set user to null for guest access
      next();
    }
  } catch (error) {
    // Continue as guest on error
    req.user = null;
    next();
  }
};