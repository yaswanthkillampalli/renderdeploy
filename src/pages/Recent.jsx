// src/pages/Recent.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { fetchRecentRecipes } from "../api/axiosInstance";
import "../styles.css";

export default function Recent() {
    const navigate = useNavigate();
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isLoggedIn = !!sessionStorage.getItem("token");

    useEffect(() => {
        const loadRecentRecipes = async () => {
            try {
                const data = await fetchRecentRecipes();
                const currentUserId = sessionStorage.getItem("userId");
                const filteredRecipes = data.filter(recipe => recipe.author._id.toString() !== currentUserId);
                setRecentRecipes(filteredRecipes);
            } catch (error) {
                console.error("Error fetching recent recipes:", error);
                setError("Failed to load recent recipes. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        loadRecentRecipes();
    }, []);

    if (loading) return <p className="loading-text">Loading recent recipes...</p>;
    if (error) return <p className="error-text">{error}</p>;

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="recipe-feed">
                <div className="container">
                    <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                    <h1 className="mb-4">📅 Recent Recipes</h1>
                    <p className="mb-4">Discover the newest recipes added.</p>
                    <div className="row g-4">
                        {recentRecipes.length === 0 ? (
                            <p>No recent recipes found.</p>
                        ) : (
                            recentRecipes.map((recipe) => (
                                <div className="col-md-4 col-lg-4 col-xl-3" key={recipe._id}>
                                    <RecipeCard recipe={recipe} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}