import React, { useState } from "react";
import { FiCamera } from "react-icons/fi";
import "../../SharedStyles/AccountPanel.css";

export default function AccountPanel({ settings, setSettings }) {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    const [profileImage, setProfileImage] = useState(
        localStorage.getItem("profileImage") || null
    );
    const [uploading, setUploading] = useState(false);

    if (!user) {
        return (
            <div className="account-not-found">
                <p>Please log in to view account settings.</p>
            </div>
        );
    }

    // ============================
    // PROFILE IMAGE HANDLER
    // ============================
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB");
                return;
            }

            // Check file type
            if (!file.type.startsWith("image/")) {
                alert("Please upload an image file");
                return;
            }

            setUploading(true);

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProfileImage(base64String);
                localStorage.setItem("profileImage", base64String);
                setUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfileImage = () => {
        setProfileImage(null);
        localStorage.removeItem("profileImage");
    };

    // Get initials for default avatar
    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return parts[0][0] + parts[parts.length - 1][0];
        }
        return name[0];
    };

    return (
        <div className="account-container">
            <h1 className="account-title">Account Settings</h1>

            {/* Profile Section */}
            <div className="account-card profile-card">
                <div className="profile-header">
                    <div className="profile-image-section">
                        <div className="profile-avatar">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="avatar-img" />
                            ) : (
                                <div className="avatar-initials">
                                    {getInitials(user.fullName)}
                                </div>
                            )}
                            <label htmlFor="profile-upload" className="avatar-upload-btn">
                                <FiCamera size={18} />
                            </label>
                            <input
                                type="file"
                                id="profile-upload"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>
                    <div className="profile-info-preview">
                        <h2 className="profile-name">{user.fullName}</h2>
                        <p className="profile-username">@{user.username}</p>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="account-card">
                <h2 className="card-title">Personal Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <div className="info-content">
                            <div className="info-label">Full Name</div>
                            <div className="info-value">{user.fullName}</div>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-content">
                            <div className="info-label">Email Address</div>
                            <div className="info-value">{user.email}</div>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-content">
                            <div className="info-label">Username</div>
                            <div className="info-value">{user.username}</div>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-content">
                            <div className="info-label">Role</div>
                            <div className="info-value role-badge">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}