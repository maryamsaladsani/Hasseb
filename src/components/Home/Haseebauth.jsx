import React, { useState } from 'react';
import { User, Lock, Mail, Building2, Users, Eye, EyeOff, ArrowRight, CheckCircle2, Coffee } from 'lucide-react';
import './Haseebauth.css';

export default function HaseebAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        businessName: '',
        role: ''
    });

    const userRoles = [
        {
            id: 'business_owner',
            title: 'Business Owner',
            description: 'Manage your coffee supply business finances',
            icon: <Coffee className="role-icon" />,
            color: 'primary',
            features: [
                'Create financial simulations',
                'Track cash flow',
                'Manage business data',
                'View insights & analytics'
            ]
        },
        {
            id: 'advisor',
            title: 'Financial Advisor',
            description: 'Guide and support your clients',
            icon: <Users className="role-icon" />,
            color: 'success',
            features: [
                'Access client simulations',
                'Provide recommendations',
                'Identify financial risks',
                'Collaborate with clients'
            ]
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setFormData(prev => ({
            ...prev,
            role: roleId
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setSelectedRole('');
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            businessName: '',
            role: ''
        });
    };

    return (
        <div className="auth-container">
            {/* Animated Background */}
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            {/* Main Content */}
            <div className="auth-content">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="branding-inner">
                        <div className="logo-section">
                            <img
                                src="/assets/HaseebLogo.png"
                                alt="HASEEB Logo"
                                className="auth-logo"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        {/* Header */}
                        <div className="auth-header">
                            <h2 className="auth-title">
                                {isLogin ? 'Welcome Back' : 'Join HASEEB'}
                            </h2>
                            <p className="auth-subtitle">
                                {isLogin
                                    ? 'Sign in to access your financial dashboard'
                                    : 'Create your account and start making smarter decisions'}
                            </p>
                        </div>

                        {/* Role Selection (Only for Signup) */}
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
                                            <div className="role-icon-wrapper">
                                                {role.icon}
                                            </div>
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

                        {/* Auth Form */}
                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Full Name (Signup only) */}
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
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Business Name (Signup only for Business Owner) */}
                            {!isLogin && selectedRole === 'business_owner' && (
                                <div className="form-group">
                                    <label className="form-label">Business Name</label>
                                    <div className="input-wrapper">
                                        <Building2 className="input-icon" />
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your business name"
                                            className="form-input"
                                            required={selectedRole === 'business_owner'}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
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

                            {/* Password */}
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

                            {/* Confirm Password (Signup only) */}
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
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Remember Me & Forgot Password (Login only) */}
                            {isLogin && (
                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="forgot-link">Forgot password?</a>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button type="submit" className="btn-submit">
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="btn-icon" />
                            </button>

                            {/* Toggle Auth Mode */}
                            <div className="auth-toggle">
                                <p>
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    <button
                                        type="button"
                                        onClick={toggleAuthMode}
                                        className="toggle-link"
                                    >
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        </form>

                        {/* Terms & Privacy */}
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