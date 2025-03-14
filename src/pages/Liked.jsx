// src/pages/Liked.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { fetchUserProfile } from "../api/axiosInstance";
import "../styles.css";

export default function Liked() {
    const navigate = useNavigate();
    const [likedRecipes, setLikedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isLoggedIn = !!sessionStorage.getItem("token");

    useEffect(() => {
        const loadLikedRecipes = async () => {
            if (!isLoggedIn) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                const data = await fetchUserProfile();
                setLikedRecipes(data.likedRecipes || []);
            } catch (error) {
                console.error("Error fetching liked recipes:", error);
                setError("Failed to load liked recipes.");
            } finally {
                setLoading(false);
            }
        };

        loadLikedRecipes();
    }, [isLoggedIn, navigate]);

    if (!isLoggedIn) return null;
    if (loading) return <p className="loading-text">Loading liked recipes...</p>;
    if (error) return <p className="error-text">{error}</p>;

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="recipe-feed">
                <div className="container">
                    <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                    <h1 className="mb-4">❤️ Liked Recipes</h1>
                    <div className="row g-4">
                        {likedRecipes.length === 0 ? (
                            <p>No liked recipes yet.</p>
                        ) : (
                            likedRecipes.map((recipe) => (
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