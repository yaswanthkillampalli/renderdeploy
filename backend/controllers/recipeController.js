// backend/controllers/recipeController.js
const Recipe = require("../models/Recipe");

exports.createRecipe = async (req, res) => {
    try {
        const { title, description, ingredients, instructions, cookingTime, prepTime, servings, difficulty, recipeType, image, status } = req.body;
        if (!req.user) return res.status(401).json({ message: "Please log in" });

        let parsedInstructions = instructions;
        if (!Array.isArray(instructions)) {
            parsedInstructions = typeof instructions === "string" ? [instructions] : [];
        }

        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            instructions: parsedInstructions,
            cookingTime,
            prepTime,
            servings,
            difficulty,
            recipeType,
            image,
            author: req.user.id,
            status: status || "Draft", // Default to Draft if not provided
        });

        await newRecipe.save();
        res.status(201).json({ message: "Recipe created", recipe: newRecipe });
    } catch (error) {
        console.error("Error creating recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getRecipes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const recipes = await Recipe.find({ status: "Published" })
            .populate("author", "username profileImage")
            .skip(skip)
            .limit(limit);
        res.status(200).json(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.fetchTrendingRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ status: "Published" })
            .populate("author", "username profileImage")
            .sort({ createdAt: -1 }) // Fallback to newest
            .limit(20);

        const sortedRecipes = recipes.sort((a, b) => {
            const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
            const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
            return bLikes - aLikes || b.createdAt - a.createdAt; // Likes desc, then newest
        });

        res.status(200).json(sortedRecipes);
    } catch (error) {
        console.error("Error fetching trending recipes:", error.stack);
        res.status(500).json({ message: "Failed to fetch trending recipes", error: error.message });
    }
};

exports.fetchRecentRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ status: "Published" })
            .populate({
                path: "author",
                select: "username profileImage",
                match: { _id: { $exists: true } }, // Ensure author exists
            })
            .sort({ createdAt: -1 })
            .limit(20);

        const validRecipes = recipes.filter(recipe => recipe.author !== null);
        res.status(200).json(validRecipes);
    } catch (error) {
        console.error("Error fetching recent recipes:", error.stack);
        res.status(500).json({ message: "Failed to fetch recent recipes", error: error.message });
    }
};

exports.searchRecipes = async (req, res) => {
    try {
        const { query } = req.query;
        const recipes = await Recipe.find({
            status: "Published",
            $or: [
                { title: new RegExp(query, "i") },
                { description: new RegExp(query, "i") },
            ],
        })
            .populate("author", "username profileImage")
            .limit(20);
        res.status(200).json(recipes);
    } catch (error) {
        console.error("Error searching recipes:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate("author", "username profileImage")
            .populate("likes", "username")
            .populate("likedBy", "username")
            .populate("savedBy", "username");
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });
        res.status(200).json(recipe);
    } catch (error) {
        console.error("Error fetching recipe:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.editRecipe = async (req, res) => {
    try {
        const { id } = req.params; // Changed from recipeId to id to match route
        const { title, description, ingredients, instructions, cookingTime, prepTime, servings, difficulty, recipeType, image, status } = req.body;
        const recipe = await Recipe.findOne({ _id: id, author: req.user.id });
        if (!recipe) return res.status(404).json({ message: "Recipe not found or not authorized" });

        recipe.title = title || recipe.title;
        recipe.description = description || recipe.description;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.instructions = instructions || recipe.instructions;
        recipe.cookingTime = cookingTime || recipe.cookingTime;
        recipe.prepTime = prepTime || recipe.prepTime;
        recipe.servings = servings || recipe.servings;
        recipe.difficulty = difficulty || recipe.difficulty;
        recipe.recipeType = recipeType || recipe.recipeType;
        recipe.image = image || recipe.image;
        recipe.status = status || recipe.status;

        await recipe.save();
        res.status(200).json({ message: "Recipe updated", recipeId: recipe._id });
    } catch (error) {
        console.error("Error updating recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params; // Changed from recipeId to id
        const recipe = await Recipe.findById(id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        if (recipe.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can delete this" });
        }

        await recipe.deleteOne();
        res.status(200).json({ message: "Recipe deleted" });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.likeRecipe = async (req, res) => {
    try {
        const { id } = req.params; // Changed from recipeId to id
        const userId = req.user.id;

        const recipe = await Recipe.findById(id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const alreadyLiked = recipe.likes.includes(userId);
        if (alreadyLiked) {
            recipe.likes = recipe.likes.filter((id) => id.toString() !== userId);
            recipe.likedBy = recipe.likedBy.filter((id) => id.toString() !== userId);
            await recipe.save();
            return res.status(200).json({ message: "Like removed", likes: recipe.likes.length });
        }

        recipe.likes.push(userId);
        recipe.likedBy.push(userId);
        await recipe.save();
        res.status(200).json({ message: "Recipe liked", likes: recipe.likes.length });
    } catch (error) {
        console.error("Error liking recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.saveRecipe = async (req, res) => {
    try {
        const { id } = req.params; // Changed from recipeId to id
        const userId = req.user.id;

        const recipe = await Recipe.findById(id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        if (recipe.savedBy.includes(userId)) {
            return res.status(400).json({ message: "Already saved" });
        }

        recipe.savedBy.push(userId);
        await recipe.save();
        res.status(200).json({ message: "Recipe saved", savedBy: recipe.savedBy.length });
    } catch (error) {
        console.error("Error saving recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.unsaveRecipe = async (req, res) => {
    try {
        const { id } = req.params; // Changed from recipeId to id
        const userId = req.user.id;

        const recipe = await Recipe.findById(id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        recipe.savedBy = recipe.savedBy.filter((id) => id.toString() !== userId);
        await recipe.save();
        res.status(200).json({ message: "Recipe unsaved", savedBy: recipe.savedBy.length });
    } catch (error) {
        console.error("Error unsaving recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.saveDraft = async (req, res) => {
    try {
        const { title, description, ingredients, instructions, cookingTime, prepTime, servings, difficulty, recipeType, image } = req.body;
        const author = req.user.id;

        const newDraft = new Recipe({
            title,
            description,
            ingredients,
            instructions,
            cookingTime,
            prepTime,
            servings,
            difficulty,
            recipeType,
            image,
            author,
            status: "Draft",
        });

        await newDraft.save();
        res.status(201).json({ message: "Draft saved", recipe: newDraft });
    } catch (error) {
        console.error("Error saving draft:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.shareRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findById(id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const shareLink = `https://recipe-frontend.onrender.com/recipe/${id}`;
        res.status(200).json({ shareLink });
    } catch (error) {
        console.error("Error sharing recipe:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


exports.isUserLiked = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id; // From middleware
        

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
    
        const hasLiked = recipe.likedBy && Array.isArray(recipe.likedBy)
            ? recipe.likedBy.some(id => id && id.toString() === userId.toString())
            : false;

        return res.status(200).json({ isLiked: hasLiked });
    } catch (error) {
        console.error("Error in isUserLiked:", error.stack);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.isUserSaved = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id;

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            console.log("Recipe not found for ID:", recipeId);
            return res.status(404).json({ message: "Recipe not found" });
        }

        const hasSaved = recipe.savedBy && Array.isArray(recipe.savedBy)
            ? recipe.savedBy.some(id => id && id.toString() === userId.toString())
            : false;

        return res.status(200).json({ isSaved: hasSaved });
    } catch (error) {
        console.error("Error in isUserSaved:", error.stack);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = exports;
