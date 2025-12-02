import React from "react";

export default function AccountPanel({ settings, setSettings }) {

  const user = JSON.parse(localStorage.getItem("loggedUser"));

  if (!user) {
    return (
      <div className="alert alert-warning fw-semibold m-4">
        Please log in to view account settings.
      </div>
    );
  }

  const theme = settings?.themeOption || "light";

  // ============================
  // APPLY THEME HANDLER
  // ============================
  const handleThemeChange = (value) => {

    setSettings({ themeOption: value });

    localStorage.setItem("themeOption", value);

    document.body.setAttribute("data-theme", value);
  };

  return (
    <div className="container-xxl">

      <h3 className="fw-bold mb-4">Account Settings</h3>

      {/* User Info */}
      <div className="card p-4 shadow-sm mb-4">
        <h5 className="fw-bold">Personal Information</h5>

        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {/* Theme Settings */}
      <div className="card p-4 shadow-sm">
        <h5 className="fw-bold mb-2">Theme Preference</h5>

        <select
          className="form-select w-auto"
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value)}
        >
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
          <option value="system">System Default</option>
        </select>

        <p className="mt-2 text-muted small">
          Theme changes instantly across your dashboard.
        </p>
      </div>

    </div>
  );
}
