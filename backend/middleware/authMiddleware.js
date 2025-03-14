const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    console.log("Auth Header:", authHeader);

    if (!authHeader) {
        console.log("No authorization header provided");
        return res.status(401).json({ error: "No token provided" });
    }

    // Handle both raw token and Bearer format
    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }
    console.log("Token:", token);

    if (!token) {
        console.log("No token extracted");
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded:", decoded);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            console.log("User not found for ID:", decoded.id);
            return res.status(404).json({ error: "User not found" });
        }

        req.user = { id: user._id, username: user.username, email: user.email };
        console.log("User set:", req.user);
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};