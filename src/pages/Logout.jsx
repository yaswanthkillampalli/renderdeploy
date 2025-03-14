// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear sessionStorage
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        // Redirect to /login and then refresh the page
        setTimeout(() => {
            navigate("/login", { replace: true });
            // Force a full page refresh to ensure app state updates
            window.location.reload();
        }, 1000); // Brief delay for feedback
    }, [navigate]);

    return (
        <div className="logout-container">
            <h2>Logging out...</h2>
            <p>You will be redirected to the login page shortly.</p>
        </div>
    );
}