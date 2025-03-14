// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchUserProfile,
    updateUserProfile,
    followUserByUsername,
    unfollowUserByUsername,
} from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import "../styles.css";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [editing, setEditing] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({});
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [message, setMessage] = useState(""); // For success/error messages
    const isLoggedIn = !!sessionStorage.getItem("token");

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const data = await fetchUserProfile();
                setUser(data);
                setUpdatedUser(data); // Sync initial updatedUser with fetched data
            } catch (error) {
                console.error("Error fetching user profile:", error);
                if (error.response?.status === 401) {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("userId");
                    navigate("/login");
                } else {
                    setMessage("Failed to load profile. Please try again.");
                }
            }
        };
        loadUserProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            // Send only the fields that have changed
            const updatedFields = {};
            for (const key in updatedUser) {
                if (updatedUser[key] !== user[key]) {
                    updatedFields[key] = updatedUser[key];
                }
            }
            if (Object.keys(updatedFields).length === 0) {
                setMessage("No changes detected.");
                setEditing(false);
                return;
            }

            const response = await updateUserProfile(updatedFields); // Expect updated user data
            setUser(response); // Update user state with the response from the backend
            setUpdatedUser(response); // Sync updatedUser with the new data
            setEditing(false);
            setMessage("Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage(
                error.response?.data?.message || "Failed to update profile. Please try again."
            );
            setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
        }
    };

    const handleFollowToggle = async (username, isFollowing) => {
        try {
            if (isFollowing) {
                await unfollowUserByUsername(username);
                setUser((prev) => ({
                    ...prev,
                    following: prev.following.filter((u) => u.username !== username),
                }));
            } else {
                await followUserByUsername(username);
                const followedUser = { username, _id: "temp-id" }; // Placeholder; ideally fetch full data
                setUser((prev) => ({
                    ...prev,
                    following: [...prev.following, followedUser],
                }));
            }
            // Optionally refetch profile to sync with backend
            const updatedProfile = await fetchUserProfile();
            setUser(updatedProfile);
        } catch (error) {
            console.error(`Error ${isFollowing ? "unfollowing" : "following"} user:`, error);
            setMessage(`Failed to ${isFollowing ? "unfollow" : "follow"} user.`);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    if (!user.username) return <p className="loading-text">Loading profile...</p>;

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} />
            <div className="profile-page">
                <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
                <div className="profile-container">
                    <div className="profile-header">
                        <img
                            src={user.profileImage || "/default-profile.jpg"}
                            alt="Profile"
                            className="profile-image"
                        />
                        <div className="profile-info">
                            <h2 className="profile-username">{user.username}</h2>
                            <p className="profile-fullname">{user.fullName || "No name provided"}</p>
                            <p className="profile-bio">{user.bio || "No bio added."}</p>
                            <div className="profile-stats">
                                <span>
                                    <strong>{user.publishedRecipes?.length || 0}</strong> Recipes
                                </span>
                                <span
                                    className="clickable-stat"
                                    onClick={() => setShowFollowersModal(true)}
                                >
                                    <strong>{user.followers?.length || 0}</strong> Followers
                                </span>
                                <span
                                    className="clickable-stat"
                                    onClick={() => setShowFollowingModal(true)}
                                >
                                    <strong>{user.following?.length || 0}</strong> Following
                                </span>
                            </div>
                            <div className="profile-recipe-stats">
                                <span>
                                    <i className="fa-solid fa-heart"></i>{" "}
                                    {user.likedRecipes?.length || 0} Liked
                                </span>
                                <span>
                                    <i className="fa-solid fa-bookmark"></i>{" "}
                                    {user.savedRecipes?.length || 0} Saved
                                </span>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={message.includes("success") ? "success-message" : "error-message"}>
                            {message}
                        </div>
                    )}

                    {editing ? (
                        <div className="profile-edit-form">
                            <div className="form-group">
                                <label>Full Name:</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={updatedUser.fullName || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={updatedUser.username || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={updatedUser.email || ""}
                                    onChange={handleChange}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Profile Image URL:</label>
                                <input
                                    type="text"
                                    name="profileImage"
                                    value={updatedUser.profileImage || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio:</label>
                                <textarea
                                    name="bio"
                                    value={updatedUser.bio || ""}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div className="profile-buttons">
                                <button onClick={handleUpdate} className="btn btn-success">
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-actions">
                            <button
                                onClick={() => setEditing(true)}
                                className="btn btn-primary"
                            >
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Followers Modal */}
                <div
                    className={`modal fade ${showFollowersModal ? "show d-block" : ""}`}
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Followers ({user.followers?.length || 0})
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowFollowersModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {user.followers?.length ? (
                                    user.followers.map((follower) => (
                                        <div
                                            key={follower._id}
                                            className="d-flex justify-content-between align-items-center mb-2"
                                        >
                                            <span>{follower.username}</span>
                                            <button
                                                className={`btn btn-sm ${
                                                    user.following?.some(
                                                        (f) =>
                                                            f._id.toString() === follower._id.toString()
                                                    )
                                                        ? "btn-secondary"
                                                        : "btn-primary"
                                                }`}
                                                onClick={() =>
                                                    handleFollowToggle(
                                                        follower.username,
                                                        user.following?.some(
                                                            (f) =>
                                                                f._id.toString() === follower._id.toString()
                                                        )
                                                    )
                                                }
                                            >
                                                {user.following?.some(
                                                    (f) => f._id.toString() === follower._id.toString()
                                                )
                                                    ? "Following"
                                                    : "Follow"}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No followers yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Following Modal */}
                <div
                    className={`modal fade ${showFollowingModal ? "show d-block" : ""}`}
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Following ({user.following?.length || 0})
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowFollowingModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {user.following?.length ? (
                                    user.following.map((following) => (
                                        <div
                                            key={following._id}
                                            className="d-flex justify-content-between align-items-center mb-2"
                                        >
                                            <span>{following.username}</span>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() =>
                                                    handleFollowToggle(following.username, true)
                                                }
                                            >
                                                Following
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>Not following anyone yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}