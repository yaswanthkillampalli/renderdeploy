// src/components/RecipeCard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    likeRecipe,
    unlikeRecipe,
    saveRecipe,
    removeSavedRecipe,
    shareRecipe,
    followUserByUsername,
    unfollowUserByUsername,
    fetchCurrentUser,
    checkIsLiked, // New API call
    checkIsSaved, // New API call
} from "../api/axiosInstance";
import "../styles.css";

export default function RecipeCard({ recipe, onUpdate }) {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false); // Tracks if current user liked the recipe
    const [likeCount, setLikeCount] = useState(recipe.likes?.length || 0); // Total likes
    const [isSaved, setIsSaved] = useState(false); // Tracks if current user saved the recipe
    const [isFollowing, setIsFollowing] = useState(false); // Tracks if current user follows the author
    const isLoggedIn = !!sessionStorage.getItem("token"); // Check login status
    const currentUserId = sessionStorage.getItem("userId"); // Current user's ID

    useEffect(() => {
        const initializeStates = async () => {
            if (currentUserId && isLoggedIn) {
                try {
                    // Fetch like and save status from new endpoints
                    const likeStatus = await checkIsLiked(recipe._id);
                    setIsLiked(likeStatus.isLiked);

                    const saveStatus = await checkIsSaved(recipe._id);
                    setIsSaved(saveStatus.isSaved);

                    // Set initial like count from recipe prop
                    setLikeCount(recipe.likes?.length || 0);

                    // Check if user follows the recipe author
                    const currentUser = await fetchCurrentUser();
                    setIsFollowing(
                        currentUser.following.some(
                            (user) => user._id.toString() === recipe.author?._id?.toString()
                        )
                    );
                } catch (error) {
                    console.error("Error initializing states:", error);
                    // Fallback to recipe prop data if API fails
                    setIsLiked(recipe.likedBy?.some((id) => id.toString() === currentUserId) || false);
                    setIsSaved(recipe.savedBy?.some((id) => id.toString() === currentUserId) || false);
                    setLikeCount(recipe.likes?.length || 0);
                }
            }
        };

        initializeStates();
    }, [recipe._id, currentUserId, isLoggedIn]);

    const handleLikeToggle = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) return alert("Please log in to like recipes.");
        try {
            if (isLiked) {
                await unlikeRecipe(recipe._id);
                setIsLiked(false);
                setLikeCount((prev) => prev - 1);
            } else {
                await likeRecipe(recipe._id);
                setIsLiked(true);
                setLikeCount((prev) => prev + 1);
            }
            if (onUpdate) {
                const updatedRecipe = {
                    ...recipe,
                    likedBy: isLiked
                        ? recipe.likedBy.filter((id) => id.toString() !== currentUserId)
                        : [...recipe.likedBy, currentUserId],
                };
                onUpdate(updatedRecipe);
            }
        } catch (error) {
            console.error("❌ Error toggling like:", error);
        }
    };

    const handleSaveToggle = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) return alert("Please log in to save recipes.");
        try {
            if (isSaved) {
                await removeSavedRecipe(recipe._id);
                setIsSaved(false);
            } else {
                await saveRecipe(recipe._id);
                setIsSaved(true);
            }
            if (onUpdate) {
                const updatedRecipe = {
                    ...recipe,
                    savedBy: isSaved
                        ? recipe.savedBy.filter((id) => id.toString() !== currentUserId)
                        : [...recipe.savedBy, currentUserId],
                };
                onUpdate(updatedRecipe);
            }
        } catch (error) {
            console.error("❌ Error toggling save:", error);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        try {
            if (isLoggedIn) {
                const response = await shareRecipe(recipe._id);
                if (response.shareLink) {
                    await navigator.clipboard.writeText(response.shareLink);
                    alert("Share link copied to clipboard!");
                } else {
                    throw new Error("Share link not provided by the server.");
                }
            } else {
                const shareLink = `${window.location.origin}/recipe/${recipe._id}`;
                await navigator.clipboard.writeText(shareLink);
                alert("Share link copied to clipboard!");
            }
        } catch (error) {
            console.error("❌ Error sharing recipe:", error);
            alert("Failed to copy share link. Please try again.");
        }
    };

    const handleFollowToggle = async (e) => {
        e.preventDefault();
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
        }
    };

    const handleViewRecipe = (e) => {
        e.preventDefault();
        if (!recipe._id) {
            console.error("❌ Recipe ID is missing!");
            return;
        }
        navigate(`/recipe/${recipe._id}`);
    };

    return (
        <div className="recipe-card">
            <div className="recipe-header">
                <div className="d-flex align-items-center gap-2">
                    <img
                        src={recipe.author?.profileImage || "/default-profile.jpg"}
                        alt="Profile"
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

            <div className="recipe-img-container">
                <img src={recipe.image || "/default-recipe.jpg"} className="recipe-img" alt={recipe.title} />
            </div>

            <div className="recipe-body">
                <h5 className="recipe-title">{recipe.title}</h5>
                <div className="recipe-details">
                    <span><i className="fa-solid fa-clock"></i> {recipe.cookingTime || "N/A"}</span>
                    <span><i className="fa-solid fa-user-group"></i> {recipe.servings || "N/A"} servings</span>
                    <span><i className="fa-solid fa-gauge"></i> {recipe.difficulty || "N/A"}</span>
                </div>
                <div className="recipe-stats">
                    <span><i className="fa-solid fa-heart"></i> {likeCount}</span>
                </div>
                <div className={`recipe-actions ${!isLoggedIn ? "logged-out" : ""}`}>
                    {isLoggedIn ? (
                        <>
                            <button
                                className={`like-btn ${isLiked ? "liked" : ""}`}
                                onClick={handleLikeToggle}
                                title={isLiked ? "Unlike" : "Like"}
                            >
                                <i className={`fa-heart ${isLiked ? "fas" : "far"}`}></i>
                                {/* Alternative with emojis: {isLiked ? "❤️" : "♡"} */}
                            </button>
                            <button className="share-btn" onClick={handleShare} title="Share">
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                            <button
                                className={`save-btn ${isSaved ? "saved" : ""}`}
                                onClick={handleSaveToggle}
                                title={isSaved ? "Unsave" : "Save"}
                            >
                                <i className={`fa-bookmark ${isSaved ? "fas" : "far"}`}></i>
                                {/* Alternative with emojis: {isSaved ? "🔖" : "☑️"} */}
                            </button>
                        </>
                    ) : (
                        <button className="share-btn" onClick={handleShare} title="Share">
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    )}
                </div>
            </div>

            <Link
                to={`/recipe/${recipe._id}`}
                className="btn btn-sm btn-outline-success mt-2 w-100"
                onClick={handleViewRecipe}
            >
                View Recipe
            </Link>
            {isLoggedIn && currentUserId === recipe.author?._id?.toString() && (
                <Link to={`/edit/${recipe._id}`} className="btn btn-sm btn-outline-primary mt-2 w-100">
                    Edit Recipe
                </Link>
            )}
        </div>
    );
}