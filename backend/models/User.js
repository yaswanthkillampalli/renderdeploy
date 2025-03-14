const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true }, // Unique username
    fullName: { type: String, default: "" },
    email: { type: String, unique: true, required: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true },
    profileImage: { type: String, default: "default-profile.jpg" },
    bio: { type: String, default: "" },
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    publishedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("User", userSchema);