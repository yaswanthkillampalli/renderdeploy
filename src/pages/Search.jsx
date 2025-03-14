// src/pages/Search.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { searchRecipes } from "../api/axiosInstance";
import "../styles.css";

export default function Search() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isLoggedIn = !!sessionStorage.getItem("token");

    const handleSearch = async (e) => {
        const searchQuery = e.target.value;
        setQuery(searchQuery);
        if (searchQuery.length > 2) {
            setLoading(true);
            setError(null);
            try {
                const data = await searchRecipes(searchQuery);
                setResults(data);
            } catch (error) {
                console.error("Error searching recipes:", error);
                setError("Failed to search recipes.");
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <main className="recipe-feed">
                <div className="container">
                    <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                    <h1 className="mb-4">🔍 Search Recipes</h1>
                    <input
                        type="text"
                        placeholder="Search for recipes..."
                        value={query}
                        onChange={handleSearch}
                        className="search-input mb-4"
                    />
                    {loading && <p className="loading-text">Searching...</p>}
                    {error && <p className="error-text">{error}</p>}
                    {!loading && !error && (
                        <div className="row g-4">
                            {results.length === 0 ? (
                                <p>No results found.</p>
                            ) : (
                                results.map((recipe) => (
                                    <div className="col-md-4 col-lg-4 col-xl-3" key={recipe._id}>
                                        <RecipeCard recipe={recipe} />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}