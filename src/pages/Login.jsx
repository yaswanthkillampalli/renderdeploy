import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/axiosInstance";
import "../styles.css";

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);  // ✅ Declare showPassword

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(formData);
            sessionStorage.setItem("token", response.token);
            sessionStorage.setItem("userId", response.userId);
            navigate("/home");
            window.location.reload();
        } catch (error) {
            setMessage(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
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
                    <div className="form-group password-container">
                        <input
                            type={showPassword ? "text" : "password"}  // ✅ Toggle password visibility
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <button type="submit" className="auth-button">Login</button>
                    {message && <p className="error-message">{message}</p>}
                </form>
                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}
