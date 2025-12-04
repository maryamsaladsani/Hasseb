import React, { useState } from "react";
import { Mail, User, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import "./Haseebauth.css";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [verifyData, setVerifyData] = useState({ email: "", username: "" });
  const [resetData, setResetData] = useState({ newPassword: "", confirmPassword: "" });
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength
  const [strength, setStrength] = useState(0);
  const strengthLabel = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["#ff4d4d", "#ff944d", "#ffcc00", "#66cc66", "#009933"];

  const calculateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return score;
  };

  const handleVerifyChange = (e) => {
    setVerifyData({ ...verifyData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData({ ...resetData, [name]: value });

    if (name === "newPassword") {
      setStrength(calculateStrength(value));
    }
  };

  const verifyUser = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5001/api/users/forgot-password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyData),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.msg);

    setUserId(data.userId);
    setStep(2);
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (resetData.newPassword !== resetData.confirmPassword)
      return alert("Passwords do not match");

    const res = await fetch("http://localhost:5001/api/users/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        newPassword: resetData.newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.msg);

    alert("Password updated! Check your email.");
    navigate("/auth");
  };

  return (
    <div className="auth-container">

      {/* Background */}
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-content">

        {/* Branding */}
        <div className="auth-branding">
          <div className="branding-inner">
            <div className="logo-section">
              <img src="/assets/HaseebLogo.png" alt="HASEEB Logo" className="auth-logo" />

              <button className="back-to-home-btn" onClick={() => navigate("/auth")}>
                <ArrowLeft className="back-icon" />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">

            {/* ========== STEP 1 ========== */}
            {step === 1 && (
              <>
                <div className="auth-header">
                  <h2 className="auth-title">Forgot Password</h2>
                  <p className="auth-subtitle">Verify your identity</p>
                </div>

                <form onSubmit={verifyUser} className="auth-form">

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={verifyData.email}
                        onChange={handleVerifyChange}
                        placeholder="Enter your email"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrapper">
                      <User className="input-icon" />
                      <input
                        type="text"
                        name="username"
                        value={verifyData.username}
                        onChange={handleVerifyChange}
                        placeholder="Enter your username"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-submit" type="submit">
                    Verify Identity
                    <CheckCircle className="btn-icon" />
                  </button>

                </form>
              </>
            )}

            {/* ========== STEP 2 ========== */}
            {step === 2 && (
              <>
                <div className="auth-header">
                  <h2 className="auth-title">Create New Password</h2>
                  <p className="auth-subtitle">Make it a strong one</p>
                </div>

                <form onSubmit={resetPassword} className="auth-form">

                  {/* New Password */}
                  <div className="form-group">
                    <label className="form-label">New Password</label>

                    <div className="input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={resetData.newPassword}
                        onChange={handleResetChange}
                        placeholder="Enter your new password"
                        className="form-input"
                        required
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {/* Strength Meter */}
                    {resetData.newPassword.length > 0 && (
                      <div style={{ marginTop: "8px" }}>
                        <div
                          style={{
                            height: "6px",
                            borderRadius: "4px",
                            backgroundColor: strengthColors[strength - 1] || "#ddd",
                            width: `${(strength / 5) * 100}%`,
                            transition: "all 0.3s ease"
                          }}
                        ></div>

                        <p
                          style={{
                            marginTop: "4px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            color: strengthColors[strength - 1] || "#999"
                          }}
                        >
                          {strengthLabel[strength - 1] || "Too Short"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={resetData.confirmPassword}
                        onChange={handleResetChange}
                        placeholder="Confirm your new password"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-submit" type="submit">
                    Reset Password
                    <CheckCircle className="btn-icon" />
                  </button>

                </form>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
