// src/pages/Recipe.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchRecipeById,
    likeRecipe,
    unlikeRecipe,
    saveRecipe,
    removeSavedRecipe,
    shareRecipe,
    followUserByUsername,
    unfollowUserByUsername,
    fetchCurrentUser,
} from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import "../styles.css";

export default function Recipe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const isLoggedIn = !!sessionStorage.getItem("token");
    const currentUserId = sessionStorage.getItem("userId");

    useEffect(() => {
        if (!id || id === "undefined") {
            console.error("❌ Invalid Recipe ID:", id);
            setError("Recipe not found.");
            setLoading(false);
            return;
        }

        const loadRecipe = async () => {
            try {
                const data = await fetchRecipeById(id);
                console.log("✅ Recipe fetched:", data);
                setRecipe(data);
                if (currentUserId) {
                    setIsLiked(data.likedBy?.some((userId) => userId.toString() === currentUserId) || false);
                    setIsSaved(data.savedBy?.some((userId) => userId.toString() === currentUserId) || false);
                    const currentUser = await fetchCurrentUser();
                    setIsFollowing(
                        currentUser.following.some((user) => user._id.toString() === data.author?._id?.toString())
                    );
                }
            } catch (err) {
                console.error("❌ Error fetching recipe:", err);
                setError("Failed to load recipe.");
            } finally {
                setLoading(false);
            }
        };

        loadRecipe();
    }, [id, currentUserId]);

    const handleLikeToggle = async () => {
        if (!isLoggedIn) return alert("You must be logged in to like recipes.");
        try {
            if (isLiked) {
                await unlikeRecipe(id);
                setIsLiked(false);
            } else {
                await likeRecipe(id);
                setIsLiked(true);
            }
            // Refetch the recipe to sync with the backend
            const updatedRecipe = await fetchRecipeById(id);
            setRecipe(updatedRecipe);
            setIsLiked(updatedRecipe.likedBy?.some((userId) => userId.toString() === currentUserId) || false);
        } catch (err) {
            console.error("❌ Error toggling like:", err);
            alert("Failed to toggle like. Please try again.");
        }
    };

    const handleSaveToggle = async () => {
        if (!isLoggedIn) return alert("You must be logged in to save recipes.");
        try {
            if (isSaved) {
                await removeSavedRecipe(id);
                setIsSaved(false);
            } else {
                await saveRecipe(id);
                setIsSaved(true);
            }
            // Refetch the recipe to sync with the backend
            const updatedRecipe = await fetchRecipeById(id);
            setRecipe(updatedRecipe);
            setIsSaved(updatedRecipe.savedBy?.some((userId) => userId.toString() === currentUserId) || false);
        } catch (err) {
            console.error("❌ Error toggling save:", err);
            alert("Failed to toggle save. Please try again.");
        }
    };

    const handleShare = async () => {
        try {
            if (isLoggedIn) {
                const response = await shareRecipe(id);
                if (response.shareLink) {
                    await navigator.clipboard.writeText(response.shareLink);
                    alert("Share link copied to clipboard!");
                } else {
                    throw new Error("Share link not provided by the server.");
                }
            } else {
                const shareLink = `${window.location.origin}/recipe/${id}`;
                await navigator.clipboard.writeText(shareLink);
                alert("Share link copied to clipboard!");
            }
        } catch (error) {
            console.error("❌ Error sharing recipe:", error);
            alert("Failed to copy share link. Please try again.");
        }
    };

    const handleFollowToggle = async () => {
        if (!isLoggedIn) return alert("Please log in to follow users.");
        try {
            if (isFollowing) {
                await unfollowUserByUsername(recipe.author.username);
                setIsFollowing(false);
            } else {
                await followUserByUsername(recipe.author.username);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("❌ Error toggling follow:", error);
            alert("Failed to toggle follow. Please try again.");
        }
    };

    if (loading) return <p className="loading-text">Loading recipe...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!recipe) return <p className="error-text">Recipe not found.</p>;

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <div className="recipe-page">
                <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                <div className="recipe-container">
                    <div className="recipe-header d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <img
                                src={recipe.author?.profileImage || "/default-profile.jpg"}
                                alt="Author"
                                className="recipe-author-img"
                            />
                            <span className="recipe-author-name">{recipe.author?.username || "Unknown User"}</span>
                        </div>
                        {isLoggedIn && currentUserId !== recipe.author?._id?.toString() && (
                            <button
                                className={`follow-btn ${isFollowing ? "following" : ""}`}
                                onClick={handleFollowToggle}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>
                        )}
                    </div>

                    <img src={recipe.image || "/default-recipe.jpg"} alt={recipe.title} className="recipe-image" />
                    <div className="recipe-content">
                        <h1>{recipe.title || "Untitled Recipe"}</h1>
                        <p className="recipe-description">{recipe.description || "No description available."}</p>

                        <div className="recipe-details mb-3">
                            <span><i className="fa-solid fa-clock"></i> Cooking Time: {recipe.cookingTime || "N/A"}</span>
                            <span><i className="fa-solid fa-hourglass-start"></i> Prep Time: {recipe.prepTime || "N/A"}</span>
                            <span><i className="fa-solid fa-user-group"></i> Servings: {recipe.servings || "N/A"}</span>
                            <span><i className="fa-solid fa-gauge"></i> Difficulty: {recipe.difficulty || "N/A"}</span>
                            <span><i className="fa-solid fa-leaf"></i> Type: {recipe.recipeType || "N/A"}</span>
                        </div>

                        <h3>🛒 Ingredients</h3>
                        <ul className="recipe-list">
                            {recipe.ingredients?.length ? (
                                recipe.ingredients.map((ingredient, index) => (
                                    <li key={index}>{ingredient.name || ingredient}</li>
                                ))
                            ) : (
                                <li>No ingredients listed.</li>
                            )}
                        </ul>

                        <h3>📋 Instructions</h3>
                        <div className="accordion" id="instructionsAccordion">
                            {recipe.instructions?.length ? (
                                recipe.instructions.map((step, index) => (
                                    <div className="accordion-item" key={index}>
                                        <h2 className="accordion-header">
                                            <button
                                                className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#collapseStep${index}`}
                                                aria-expanded={index === 0 ? "true" : "false"}
                                                aria-controls={`collapseStep${index}`}
                                            >
                                                Step #{index + 1}
                                            </button>
                                        </h2>
                                        <div
                                            id={`collapseStep${index}`}
                                            className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                            data-bs-parent="#instructionsAccordion"
                                        >
                                            <div className="accordion-body">
                                                {step || "No details provided."}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No instructions available.</p>
                            )}
                        </div>

                        <div className="recipe-footer mt-3">
                            <p>❤️ {recipe.likes?.length || 0} Likes</p>
                        </div>

                        {isLoggedIn && (
                            <div className="recipe-actions mt-3">
                                <button
                                    className={`btn ${isLiked ? "btn-danger" : "btn-outline-danger"}`}
                                    onClick={handleLikeToggle}
                                >
                                    <i className="fa-solid fa-heart"></i> {isLiked ? "Unlike" : "Like"} ({recipe.likes?.length || 0})
                                </button>
                                <button
                                    className={`btn ${isSaved ? "btn-success" : "btn-outline-secondary"}`}
                                    onClick={handleSaveToggle}
                                >
                                    <i className="fa-solid fa-bookmark"></i> {isSaved ? "Saved" : "Save"}
                                </button>
                                <button className="btn btn-outline-primary" onClick={handleShare}>
                                    <i className="fa-solid fa-paper-plane"></i> Share
                                </button>
                            </div>
                        )}
                        {!isLoggedIn && (
                            <div className="recipe-actions mt-3">
                                <button className="btn btn-outline-primary" onClick={handleShare}>
                                    <i className="fa-solid fa-paper-plane"></i> Share
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}