// src/pages/Trending.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import Filter from "../components/Filter";
import { fetchTrendingRecipes } from "../api/axiosInstance";
import "../styles.css";

export default function Trending() {
    const [trendingRecipes, setTrendingRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [error, setError] = useState(null); // Added for error display
    const isLoggedIn = !!sessionStorage.getItem("token");
    const currentUserId = sessionStorage.getItem("userId");
    const offcanvasRef = useRef(null);

    useEffect(() => {
        const loadTrendingRecipes = async () => {
            try {
                const data = await fetchTrendingRecipes();
                const userFilteredRecipes = data.filter(recipe => recipe.author._id.toString() !== currentUserId);
                setTrendingRecipes(userFilteredRecipes);
                setFilteredRecipes(userFilteredRecipes);
            } catch (error) {
                console.error("Error fetching trending recipes:", error);
                setError("Failed to load trending recipes. Please try again later.");
            }
        };
        loadTrendingRecipes();
    }, [currentUserId]);

    const applyFilters = ({ category, cookingTime }) => {
        let filtered = trendingRecipes;

        if (category !== "all") {
            filtered = filtered.filter(recipe => recipe.recipeType.toLowerCase() === category);
        }

        if (cookingTime !== "all") {
            filtered = filtered.filter(recipe => {
                const time = parseInt(recipe.cookingTime) || 0;
                if (cookingTime === "30") return time < 30;
                if (cookingTime === "60") return time >= 30 && time <= 60;
                if (cookingTime === "60+") return time > 60;
                return true;
            });
        }

        setFilteredRecipes(filtered);
        if (offcanvasRef.current) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasRef.current);
            offcanvas?.hide();
        }
    };

    if (error) return <p className="error-text">{error}</p>;

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="recipe-feed">
                <div className="container">
                    <h1 className="mb-4">🔥 Trending Recipes</h1>
                    <Filter onFilterApply={applyFilters} offcanvasRef={offcanvasRef} />
                    <div className="row g-4">
                        {filteredRecipes.length === 0 ? (
                            <p>No trending recipes found.</p>
                        ) : (
                            filteredRecipes.map((recipe) => (
                                <div className="col-md-4 col-lg-4 col-xl-3" key={recipe._id}>
                                    <RecipeCard recipe={recipe} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
            {isLoggedIn && (
                <div className="floating-buttons">
                    <button
                        className="floating-btn filter-btn"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#filterOffcanvas"
                    >
                        🔍
                    </button>
                    <Link to="/newpost" className="floating-btn new-post-btn">
                        ➕
                    </Link>
                </div>
            )}
        </>
    );
}