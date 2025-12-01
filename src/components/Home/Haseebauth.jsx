import React, { useState } from 'react';
import {
    User,
    Lock,
    Mail,
    Users,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    Coffee,
    ArrowLeft,
} from 'lucide-react';
import './Haseebauth.css';
import { useNavigate } from 'react-router-dom';

export default function HaseebAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: ''
    });

    const navigate = useNavigate();

    /* ROLES */
    const userRoles = [
        {
            id: 'owner',
            title: 'Business Owner',
            description: 'Manage your coffee supply business finances',
            icon: <Coffee className="role-icon" />,
            color: 'primary',
            features: ['Create financial simulations', 'Track cash flow', 'Manage business data', 'View insights & analytics']
        },
        {
            id: 'advisor',
            title: 'Financial Advisor',
            description: 'Guide and support your clients',
            icon: <Users className="role-icon" />,
            color: 'success',
            features: ['Access client simulations', 'Provide recommendations', 'Identify financial risks', 'Collaborate with clients']
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setFormData(prev => ({ ...prev, role: roleId }));
    };

    const handleBackToHome = () => navigate('/');

    /* SAFE JSON PARSER */
    const safeJSON = async (res) => {
        try {
            return await res.json();
        } catch (err) {
            return null;
        }
    };

    /* LOGIN + SIGNUP SUBMISSION */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLogin) {
            /* LOGIN WITH USERNAME + PASSWORD */
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    password: formData.password
                })
            });

            const data = await safeJSON(res);

            if (!res.ok) {
                alert(data?.msg || "Login failed. Server returned invalid response.");
                return;
            }

            localStorage.setItem("loggedUser", JSON.stringify(data.user));

            if (data.user.role === "owner") return (window.location.href = "/owner");
            if (data.user.role === "advisor") return (window.location.href = "/advisor");
            if (data.user.role === "manager") return (window.location.href = "/manager");

            alert("Unknown role. Contact system admin.");
            return;
        }

        /* SIGNUP */
        if (!selectedRole) return alert("Please select a role.");
        if (formData.password !== formData.confirmPassword)
            return alert("Passwords do not match.");

        const res = await fetch("/api/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await safeJSON(res);

        if (!res.ok) {
            alert(data?.msg || "Signup failed. Server returned invalid response.");
            return;
        }

        alert("Account created! Your username is: " + data.user.username);

        setIsLogin(true);
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setSelectedRole('');
        setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            role: ''
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="auth-content">
                <div className="auth-branding">
                    <div className="branding-inner">
                        <div className="logo-section">
                            <img src="/assets/HaseebLogo.png" alt="HASEEB Logo" className="auth-logo" />
                            <button className="back-to-home-btn" onClick={handleBackToHome}>
                                <ArrowLeft className="back-icon" />
                                <span>Back to Home</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Join HASEEB'}</h2>
                            <p className="auth-subtitle">
                                {isLogin
                                    ? 'Sign in to access your financial dashboard'
                                    : 'Create your account and start making smarter decisions'}
                            </p>
                        </div>

                        {!isLogin && (
                            <div className="role-selection">
                                <label className="form-label">Join as:</label>
                                <div className="roles-grid">
                                    {userRoles.map(role => (
                                        <div
                                            key={role.id}
                                            onClick={() => handleRoleSelect(role.id)}
                                            className={`role-card ${selectedRole === role.id ? 'selected' : ''} color-${role.color}`}
                                        >
                                            <div className="role-icon-wrapper">{role.icon}</div>
                                            <h4 className="role-title">{role.title}</h4>
                                            <p className="role-description">{role.description}</p>

                                            {selectedRole === role.id && (
                                                <div className="role-features">
                                                    {role.features.map((feature, idx) => (
                                                        <div key={idx} className="role-feature">
                                                            <CheckCircle2 className="feature-icon" />
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* EMAIL ONLY IN SIGNUP */}
                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* USERNAME ONLY IN LOGIN */}
                            {isLogin && (
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            placeholder="Enter your username"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        className="form-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm your password"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {isLogin && (
                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="forgot-link">Forgot password?</a>
                                </div>
                            )}

                            <button type="submit" className="btn-submit">
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="btn-icon" />
                            </button>

                            <div className="auth-toggle">
                                <p>
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    <button type="button" onClick={toggleAuthMode} className="toggle-link">
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        </form>

                        <p className="auth-terms">
                            By continuing, you agree to HASEEB's
                            <a href="#"> Terms of Service</a> and
                            <a href="#"> Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}