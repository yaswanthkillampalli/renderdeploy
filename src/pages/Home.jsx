// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import Filter from "../components/Filter";
import { fetchRecipes } from "../api/axiosInstance";
import "../styles.css";

export default function Home() {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [filters, setFilters] = useState({ category: "all", cookingTime: "all" });
    const isLoggedIn = !!sessionStorage.getItem("token");
    const currentUserId = sessionStorage.getItem("userId");
    const offcanvasRef = useRef(null);

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const data = await fetchRecipes();
                const userFilteredRecipes = data.filter(recipe => recipe.author._id.toString() !== currentUserId);
                setRecipes(userFilteredRecipes);
                applyFilters(filters, userFilteredRecipes); // Apply initial filters
            } catch (error) {
                console.error("Error loading recipes:", error);
            }
        };
        loadRecipes();
    }, [currentUserId]);

    const applyFilters = (newFilters, recipeList = recipes) => {
        let filtered = [...recipeList];

        if (newFilters.category !== "all") {
            filtered = filtered.filter(recipe => recipe.recipeType.toLowerCase() === newFilters.category);
        }

        if (newFilters.cookingTime !== "all") {
            filtered = filtered.filter(recipe => {
                const time = parseInt(recipe.cookingTime) || 0;
                if (newFilters.cookingTime === "30") return time < 30;
                if (newFilters.cookingTime === "60") return time >= 30 && time <= 60;
                if (newFilters.cookingTime === "60+") return time > 60;
                return true;
            });
        }

        setFilteredRecipes(filtered);
        setFilters(newFilters);
        // Close offcanvas
        if (offcanvasRef.current) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasRef.current);
            offcanvas?.hide();
        }
    };

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="recipe-feed">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="feed-title">🍽️ Latest Recipes</h2>
                        {isLoggedIn && (
                            <button
                                className="btn btn-outline-primary filter-toggle-btn"
                                data-bs-toggle="offcanvas"
                                data-bs-target="#filterOffcanvas"
                            >
                                <i className="fa-solid fa-filter"></i> Filters
                            </button>
                        )}
                    </div>

                    <Filter onFilterApply={applyFilters} offcanvasRef={offcanvasRef} />

                    <div className="row g-4">
                        {filteredRecipes.length === 0 ? (
                            <p className="no-recipes">No recipes match your filters.</p>
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
                        title="Filters"
                    >
                    🔍
                    </button>
                    <Link to="/newpost" className="floating-btn new-post-btn" title="New Recipe">
                        ➕
                    </Link>
                </div>
            )}
        </>
    );
}