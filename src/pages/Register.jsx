import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/axiosInstance";
import "../styles.css";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(formData);
            setMessage("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000); // 2-second delay
        } catch (error) {
            setMessage(error.response?.data?.message || "Registration failed. Please try again.");
        }
    };
    
    // In the return, update the message display:
    {message && <p className={message.includes("successful") ? "success-message" : "error-message"}>{message}</p>}

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">Register</button>
                    {message && <p className="error-message">{message}</p>}
                </form>
                <p className="auth-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}