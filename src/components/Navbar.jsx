import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "../api/axiosInstance";
import ProfilePopupMenu from "./ProfilePopupMenu";
import "../styles.css";

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = !!sessionStorage.getItem("token");

    useEffect(() => {
        const loadUserProfile = async () => {
            if (isLoggedIn) {
                try {
                    const data = await fetchUserProfile();
                    setUser(data);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    if (error.response?.status === 401) {
                        sessionStorage.removeItem("token");
                        sessionStorage.removeItem("userId");
                        setUser(null);
                        navigate("/login", { replace: true });
                    }
                }
            }
            setLoading(false);
        };

        loadUserProfile();
    }, [navigate, isLoggedIn]);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        setUser(null);
        navigate("/logout", { replace: true });
    };

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
                {/* Hamburger button to toggle offcanvas on small screens */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#navbarOffcanvas"
                    aria-controls="navbarOffcanvas"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Offcanvas for navigation links */}
                <div
                    className="offcanvas offcanvas-start"
                    tabIndex="-1"
                    id="navbarOffcanvas"
                    aria-labelledby="navbarOffcanvasLabel"
                >
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="navbarOffcanvasLabel">
                            Menu
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="offcanvas"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="offcanvas-body">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to="/home"
                                    data-bs-dismiss="offcanvas"
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to="/trending"
                                    data-bs-dismiss="offcanvas"
                                >
                                    Trending
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to="/recent"
                                    data-bs-dismiss="offcanvas"
                                >
                                    Recent
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to="/about"
                                    data-bs-dismiss="offcanvas"
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Navbar brand (logo) always centered */}
                <Link className="navbar-brand mx-auto d-block" to="/">
                    <img
                        src="/recipe-logo.jpg"
                        className="recipe-logo-settings"
                        alt="Recipe Logo"
                    />
                </Link>

                {/* Right-side elements */}
                <div className="d-flex align-items-center ms-auto">
                    <i
                        className="fas fa-search search-icon me-3"
                        onClick={() => navigate("/search")}
                    ></i>

                    {loading ? (
                        <p className="loading-text">Loading...</p>
                    ) : isLoggedIn && user ? (
                        <ProfilePopupMenu user={user} onLogout={handleLogout} />
                    ) : (
                        <Link className="btn btn-outline-success" to="/login">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}