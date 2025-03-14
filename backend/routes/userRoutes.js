// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
    registerUser, loginUser, getUserProfile, updateUserProfile, followUserByUsername,
    unfollowUserByUsername, checkUsernameAvailability, searchUserByUsername, getUserRecipes,
    likeRecipe, unlikeRecipe, saveRecipe, removeSavedRecipe, publishRecipe, getCurrentUser
} = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.post("/follow/username/:username", authenticate, followUserByUsername);
router.post("/unfollow/username/:username", authenticate, unfollowUserByUsername);
router.get("/check-username/:username", checkUsernameAvailability);
router.get("/search/:username", searchUserByUsername);
router.get("/:userId/recipes", getUserRecipes);
router.post("/like", authenticate, likeRecipe);
router.post("/unlike", authenticate, unlikeRecipe);
router.post("/save", authenticate, saveRecipe);
router.post("/unsave", authenticate, removeSavedRecipe);
router.post("/publish", authenticate, publishRecipe);
router.get("/current", authenticate, getCurrentUser);

module.exports = router;