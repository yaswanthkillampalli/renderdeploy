const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now },
});

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    cookingTime: { type: String, required: true }, // Keeping as string to match dropdown
    prepTime: { type: String }, // New field
    servings: { type: Number }, // New field
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" }, // New field
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    image: { type: String, required: true },
    ingredients: [{ name: String }], // Updated to match NewPost.jsx
    instructions: { type: [String], required: true },
    status: { type: String, enum: ["Published", "Draft"], default: "Published" },
    recipeType: { type: String, enum: ["Veg", "Non-Veg"], required: true },
    averageRating: { type: Number, default: 0 },
    reviews: [reviewSchema],
});

module.exports = mongoose.model("Recipe", recipeSchema);