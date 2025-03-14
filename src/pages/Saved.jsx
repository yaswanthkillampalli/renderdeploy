// src/pages/Saved.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { fetchUserProfile } from "../api/axiosInstance";
import "../styles.css";

export default function Saved() {
    const navigate = useNavigate();
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isLoggedIn = !!sessionStorage.getItem("token");

    useEffect(() => {
        const loadSavedRecipes = async () => {
            if (!isLoggedIn) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                const data = await fetchUserProfile();
                setSavedRecipes(data.savedRecipes || []);
            } catch (error) {
                console.error("Error fetching saved recipes:", error);
                setError("Failed to load saved recipes.");
            } finally {
                setLoading(false);
            }
        };

        loadSavedRecipes();
    }, [isLoggedIn, navigate]);

    if (!isLoggedIn) return null;
    if (loading) return <p className="loading-text">Loading saved recipes...</p>;
    if (error) return <p className="error-text">{error}</p>;

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="recipe-feed">
                <div className="container">
                    <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                    <h1 className="mb-4">💾 Saved Recipes</h1>
                    <div className="row g-4">
                        {savedRecipes.length === 0 ? (
                            <p>No saved recipes yet.</p>
                        ) : (
                            savedRecipes.map((recipe) => (
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