import Navbar from "../components/Navbar";
import "../styles.css";

export default function About() {
    return (
        <>
            <Navbar isLoggedIn={!!localStorage.getItem("token")} />
            <main className="about-page">
                <div className="container">
                    <h1 className="about-title">About Us</h1>
                    <p className="about-description">
                        Welcome to the <strong>Recipe Sharing Platform</strong>, where food lovers come together to share and discover amazing recipes! Whether you're a seasoned chef or a beginner in the kitchen, our platform is designed to inspire and connect you with a community of passionate cooks.
                    </p>
                    <div className="about-features">
                        <h3 className="features-title">Why Use Our Platform?</h3>
                        <ul className="features-list">
                            <li>
                                <span className="feature-icon">📌</span>
                                <span className="feature-text">Share your favorite recipes with the world</span>
                            </li>
                            <li>
                                <span className="feature-icon">🔥</span>
                                <span className="feature-text">Explore trending dishes and discover new flavors</span>
                            </li>
                            <li>
                                <span className="feature-icon">❤️</span>
                                <span className="feature-text">Save and like recipes to create your personal collection</span>
                            </li>
                            <li>
                                <span className="feature-icon">👨‍🍳</span>
                                <span className="feature-text">Follow top chefs and get inspired by their creations</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </>
    );
}