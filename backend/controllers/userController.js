// backend/controllers/userController.js
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

/* ========================
    🛠️ AUTHENTICATION CONTROLLERS
======================== */
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already taken" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({
            message: "User created",
            userId: newUser._id,
            username: newUser.username,
            email: newUser.email,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Wrong email or password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ token, userId: user._id, username: user.username, email: user.email });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

/* ========================
    👤 USER CONTROLLERS
======================== */
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("following", "username")
            .populate("followers", "username")
            .select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("followers", "username profileImage")
            .populate("following", "username profileImage")
            .populate("publishedRecipes", "title image cookingTime servings difficulty recipeType author likes likedBy savedBy")
            .populate("savedRecipes", "title image cookingTime servings difficulty recipeType author RESOURCElikes likedBy savedBy")
            .populate("likedRecipes", "title image cookingTime servings difficulty recipeType author likes likedBy savedBy")
            .select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// backend/controllers/userController.js
exports.updateUserProfile = async (req, res) => {
    try {
        const { fullName, username, profileImage, bio } = req.body;
        const userId = req.user.id; // From authMiddleware

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (fullName) user.fullName = fullName;
        if (username) user.username = username;
        if (profileImage) user.profileImage = profileImage;
        if (bio) user.bio = bio;

        await user.save();
        res.status(200).json(user); // Return the updated user
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

exports.followUserByUsername = async (req, res) => {
    try {
        const userToFollow = await User.findOne({ username: req.params.username });
        const currentUser = await User.findById(req.user.id);
        if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });
        if (currentUser._id.toString() === userToFollow._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }
        if (!currentUser.following.includes(userToFollow._id)) {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            await Promise.all([currentUser.save(), userToFollow.save()]);
        }
        res.status(200).json({ message: "User followed" });
    } catch (error) {
        console.error("Error following user:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.unfollowUserByUsername = async (req, res) => {
    try {
        const userToUnfollow = await User.findOne({ username: req.params.username });
        if (!userToUnfollow) return res.status(404).json({ message: "User not found" });

        const currentUser = await User.findById(req.user.id);
        if (!currentUser.following.includes(userToUnfollow._id)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id.toString());
        await Promise.all([
            currentUser.save({ validateBeforeSave: false }), // Skip versioning
            userToUnfollow.save({ validateBeforeSave: false }),
        ]);

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ message: "Failed to unfollow user" });
    }
};

exports.checkUsernameAvailability = async (req, res) => {
    try {
        const usernameTaken = await User.exists({ username: req.params.username });
        res.status(200).json({ available: !usernameTaken });
    } catch (error) {
        console.error("Error checking username:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.searchUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Error searching user:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getUserRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ author: req.params.userId });
        res.status(200).json(recipes);
    } catch (error) {
        console.error("Error fetching user recipes:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.likeRecipe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { recipeId } = req.body;
        const recipe = await Recipe.findById(recipeId);

        if (!user || !recipe) return res.status(404).json({ message: "User or recipe not found" });
        if (user.likedRecipes.includes(recipeId)) {
            return res.status(400).json({ message: "Already liked" });
        }

        user.likedRecipes.push(recipeId);
        recipe.likedBy.push(req.user.id);
        recipe.likes.push(req.user.id); // Keep likes in sync
        await Promise.all([user.save(), recipe.save()]);
        res.status(200).json({ message: "Recipe liked" });
    } catch (error) {
        console.error("Error liking recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.unlikeRecipe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { recipeId } = req.body;
        const recipe = await Recipe.findById(recipeId);

        if (!user || !recipe) return res.status(404).json({ message: "User or recipe not found" });
        user.likedRecipes = user.likedRecipes.filter(id => id.toString() !== recipeId);
        recipe.likedBy = recipe.likedBy.filter(id => id.toString() !== req.user.id);
        recipe.likes = recipe.likes.filter(id => id.toString() !== req.user.id);
        await Promise.all([user.save(), recipe.save()]);
        res.status(200).json({ message: "Recipe unliked" });
    } catch (error) {
        console.error("Error unliking recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.saveRecipe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { recipeId } = req.body;
        const recipe = await Recipe.findById(recipeId);

        if (!user || !recipe) return res.status(404).json({ message: "User or recipe not found" });
        if (user.savedRecipes.includes(recipeId)) {
            return res.status(400).json({ message: "Already saved" });
        }

        user.savedRecipes.push(recipeId);
        recipe.savedBy.push(req.user.id);
        await Promise.all([user.save(), recipe.save()]);
        res.status(200).json({ message: "Recipe saved" });
    } catch (error) {
        console.error("Error saving recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.removeSavedRecipe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { recipeId } = req.body;
        const recipe = await Recipe.findById(recipeId);

        if (!user || !recipe) return res.status(404).json({ message: "User or recipe not found" });
        user.savedRecipes = user.savedRecipes.filter(id => id.toString() !== recipeId);
        recipe.savedBy = recipe.savedBy.filter(id => id.toString() !== req.user.id);
        await Promise.all([user.save(), recipe.save()]);
        res.status(200).json({ message: "Recipe removed from saved" });
    } catch (error) {
        console.error("Error removing saved recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.publishRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.publishedRecipes.includes(recipeId)) {
            user.publishedRecipes.push(recipeId);
            await user.save();
        }
        res.status(200).json({ message: "Recipe published successfully" });
    } catch (error) {
        console.error("Error publishing recipe:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

module.exports = exports;