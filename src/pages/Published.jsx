// src/pages/Published.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { fetchRecipes } from "../api/axiosInstance";
import "../styles.css";

export default function Published() {
    const [publishedRecipes, setPublishedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isLoggedIn = !!sessionStorage.getItem("token");
    const currentUserId = sessionStorage.getItem("userId");

    useEffect(() => {
        const loadPublishedRecipes = async () => {
            try {
                const data = await fetchRecipes();
                // Filter to show only the current user's published recipes
                const userPublishedRecipes = data.filter(
                    (recipe) => recipe.author?._id?.toString() === currentUserId
                );
                setPublishedRecipes(userPublishedRecipes);
            } catch (error) {
                console.error("Error fetching published recipes:", error);
                setError("Failed to load published recipes. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        loadPublishedRecipes();
    }, [currentUserId]);

    const handleRecipeUpdate = (updatedRecipe) => {
        setPublishedRecipes((prevRecipes) =>
            prevRecipes.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
        );
    };

    if (loading) return <p className="loading-text">Loading published recipes...</p>;
    if (error) return <p className="error-text">{error}</p>;

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="recipe-feed">
                <div className="container">
                    <h1 className="mb-4">📝 Published Recipes</h1>
                    <div className="row g-4">
                        {publishedRecipes.length === 0 ? (
                            <p>No published recipes found.</p>
                        ) : (
                            publishedRecipes.map((recipe) => (
                                <div className="col-md-4 col-lg-4 col-xl-3" key={recipe._id}>
                                    <RecipeCard
                                        recipe={recipe}
                                        onUpdate={handleRecipeUpdate}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}