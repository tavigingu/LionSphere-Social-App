// backend/middleware/RoleMiddleware.js

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req, res, next) => {
    try {
        // Check if user exists and has the role property
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false
            });
        }
        
        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: "Admin privileges required",
                success: false
            });
        }
        
        // Allow request to proceed if user is admin
        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        res.status(500).json({
            message: error.message || "Server error",
            success: false
        });
    }
};

/**
 * Middleware to check if user is moderator or admin
 */
export const isModeratorOrAdmin = (req, res, next) => {
    try {
        // Check if user exists and has the role property
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false
            });
        }
        
        // Check if user has admin or moderator role
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return res.status(403).json({
                message: "Moderator or admin privileges required",
                success: false
            });
        }
        
        // Allow request to proceed if user is admin or moderator
        next();
    } catch (error) {
        console.error("Error in moderator middleware:", error);
        res.status(500).json({
            message: error.message || "Server error",
            success: false
        });
    }
};