// src/pages/NewPost.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createRecipe, fetchRecipeById, editRecipe } from "../api/axiosInstance";
import "../styles.css";

export default function NewPost() {
    const navigate = useNavigate();
    const { recipeId } = useParams();
    const isEditing = !!recipeId;
    const [recipe, setRecipe] = useState({
        title: "",
        description: "",
        ingredients: [""],
        instructions: [""],
        cookingTime: "",
        prepTime: "",
        servings: "",
        difficulty: "Medium",
        recipeType: "",
        image: "",
        status: "Published", // Default status for new recipes
    });
    const [message, setMessage] = useState("");
    const isLoggedIn = !!sessionStorage.getItem("token");

    useEffect(() => {
        if (isEditing) {
            const loadRecipe = async () => {
                try {
                    const data = await fetchRecipeById(recipeId);
                    setRecipe({
                        title: data.title || "",
                        description: data.description || "",
                        ingredients: data.ingredients.length > 0 
                            ? data.ingredients.map(ing => ing.name || "") 
                            : [""],
                        instructions: data.instructions.length > 0 
                            ? data.instructions 
                            : [""],
                        cookingTime: data.cookingTime || "",
                        prepTime: data.prepTime || "",
                        servings: data.servings || "",
                        difficulty: data.difficulty || "Medium",
                        recipeType: data.recipeType || "",
                        image: data.image || "",
                        status: data.status || "Published", // Preserve existing status
                    });
                } catch (error) {
                    console.error("Error fetching recipe:", error);
                    setMessage("Failed to load recipe. Please try again.");
                }
            };
            loadRecipe();
        }
    }, [recipeId, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe((prev) => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, value) => {
        const updatedIngredients = [...recipe.ingredients];
        updatedIngredients[index] = value;
        setRecipe((prev) => ({ ...prev, ingredients: updatedIngredients }));
    };

    const addIngredient = () => {
        setRecipe((prev) => ({ ...prev, ingredients: [...prev.ingredients, ""] }));
    };

    const handleInstructionChange = (index, value) => {
        const updatedInstructions = [...recipe.instructions];
        updatedInstructions[index] = value;
        setRecipe((prev) => ({ ...prev, instructions: updatedInstructions }));
    };

    const addInstruction = () => {
        setRecipe((prev) => ({ ...prev, instructions: [...prev.instructions, ""] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            console.error("⚠️ User not logged in!");
            alert("Please log in before posting a recipe.");
            navigate("/login");
            return;
        }

        const recipeData = {
            title: recipe.title.trim(),
            description: recipe.description.trim(),
            ingredients: recipe.ingredients.filter((ing) => ing.trim() !== "").map((ing) => ({ name: ing })),
            instructions: recipe.instructions.filter((step) => step.trim() !== ""),
            cookingTime: recipe.cookingTime,
            prepTime: recipe.prepTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            recipeType: recipe.recipeType,
            image: recipe.image.trim(),
            author: userId,
            status: recipe.status, // Use the form's status value
        };

        console.log("✅ Final Recipe Data:", recipeData);

        try {
            if (isEditing) {
                const response = await editRecipe(recipeId, recipeData);
                console.log("✅ Recipe updated successfully:", response);
                setMessage("Recipe updated successfully!");
            } else {
                const response = await createRecipe(recipeData);
                console.log("✅ Recipe created successfully:", response);
                // Optionally publish the recipe (if not already handled by createRecipe)
                await API.post("/users/publish", { recipeId: response.data._id });
                setMessage("Recipe added and published successfully!");
            }
            setTimeout(() => navigate("/published"), 2000); // Redirect to Published page
        } catch (error) {
            console.error("❌ Error:", error.response?.data || error.message);
            setMessage(
                error.response?.data?.message || `Failed to ${isEditing ? "update" : "add"} recipe.`
            );
        }
    };

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <div className="new-post-container">
                <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                <h2 className="new-post-title">{isEditing ? "Edit Recipe" : "New Recipe"}</h2>
                <form onSubmit={handleSubmit} className="new-post-form">
                    <div className="form-group">
                        <label>Recipe Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Recipe Title"
                            value={recipe.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Recipe Description</label>
                        <textarea
                            name="description"
                            placeholder="Recipe Description"
                            value={recipe.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Ingredients</label>
                        {recipe.ingredients.map((ingredient, index) => (
                            <input
                                key={index}
                                type="text"
                                value={ingredient}
                                onChange={(e) => handleIngredientChange(index, e.target.value)}
                                placeholder={`Ingredient ${index + 1}`}
                                required={index === 0} // Only the first ingredient is required
                            />
                        ))}
                        <button type="button" className="add-button" onClick={addIngredient}>
                            + Add Ingredient
                        </button>
                    </div>
                    <div className="form-group">
                        <label>Instructions</label>
                        {recipe.instructions.map((step, index) => (
                            <textarea
                                key={index}
                                rows="2"
                                value={step}
                                onChange={(e) => handleInstructionChange(index, e.target.value)}
                                placeholder={`Step ${index + 1}`}
                                required={index === 0} // Only the first instruction is required
                            />
                        ))}
                        <button type="button" className="add-button" onClick={addInstruction}>
                            + Add Step
                        </button>
                    </div>
                    <div className="form-group">
                        <label>Cooking Time (minutes)</label>
                        <select
                            name="cookingTime"
                            value={recipe.cookingTime}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Cooking Time</option>
                            <option value="15">15 mins</option>
                            <option value="30">30 mins</option>
                            <option value="45">45 mins</option>
                            <option value="60">60 mins</option>
                            <option value="90">90 mins</option>
                            <option value="120">120 mins</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Prep Time (minutes)</label>
                        <select
                            name="prepTime"
                            value={recipe.prepTime}
                            onChange={handleChange}
                        >
                            <option value="">Select Prep Time</option>
                            <option value="5">5 mins</option>
                            <option value="10">10 mins</option>
                            <option value="15">15 mins</option>
                            <option value="30">30 mins</option>
                            <option value="45">45 mins</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Servings</label>
                        <input
                            type="number"
                            name="servings"
                            placeholder="e.g., 4"
                            value={recipe.servings}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Difficulty</label>
                        <select
                            name="difficulty"
                            value={recipe.difficulty}
                            onChange={handleChange}
                            required
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="recipeType" value={recipe.recipeType} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Recipe Image (URL)</label>
                        <input
                            type="text"
                            name="image"
                            placeholder="Paste image URL here"
                            value={recipe.image}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={recipe.status} onChange={handleChange}>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-button">
                        {isEditing ? "Update Recipe" : "Publish"}
                    </button>
                    {message && (
                        <p className={message.includes("success") ? "success-message" : "error-message"}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </>
    );
}