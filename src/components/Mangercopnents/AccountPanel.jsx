// src/components/Mangercopnents/AccountPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiCamera, FiUpload } from "react-icons/fi";

export default function AccountPanel({ settings, setSettings }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
  });

  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // we keep role & status so we don't lose them when saving
  const [accountMeta, setAccountMeta] = useState({
    id: null,
    role: "manager",
    status: "active",
  });

  const fileRef = useRef(null);

  // ---------- helpers ----------
  const onChangeField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  };

  const onPickAvatar = () => fileRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChangeField("avatarUrl", url);
  };

  // ---------- load current user from backend ----------
  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        setError("");

        const stored = JSON.parse(localStorage.getItem("loggedUser") || "null");

        const userId = stored?.userId || stored?._id || stored?.id || null;

        if (!userId) {
          setError("No logged-in user information found.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5001/api/users/${userId}`
        );

        const u = res.data || {};
        const fullName = u.fullName || "";
        const [first, ...rest] = fullName.split(" ");
        const last = rest.join(" ");

        setForm({
          firstName: first || "",
          lastName: last || "",
          email: u.email || "",
          avatarUrl: "",
        });

        setAccountMeta({
          id: u.id || userId,
          role: u.role || stored?.role || "manager",
          status: u.status || stored?.status || "active",
        });
      } catch (err) {
        console.error("Load manager account error:", err.response || err);
        setError("Failed to load account information.");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

// ---------- save profile ----------
const onSave = async () => {
  if (!accountMeta.id) {
    alert("No user id found – cannot save.");
    return;
  }

  try {
    setError("");
    setLoading(true);

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    await axios.put(
      `http://localhost:5001/api/users/${accountMeta.id}`,
      {
        name: fullName,
        email: form.email,
        role: accountMeta.role,
        status: accountMeta.status,
      }
    );

    setDirty(false);
    alert("Profile saved");
  } catch (err) {
    console.error("Save profile error:", err.response || err);
    alert("Failed to save profile.");
  } finally {
    setLoading(false);
  }
};

  // ---------- render ----------
  return (
    <div className="container-xxl">
      <div className="card-neo p-4 mb-4">
        <h5 className="mb-1">Profile Settings</h5>
        <div className="text-muted mb-3">
          Manage your account settings and preferences
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3">
            {error}
          </div>
        )}

        {/* Avatar row */}
        <div className="acct__section">
          <div className="acct__photo">
            <div className="acct__avatar">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" />
              ) : (
                <div
                  className="acct__avatar-fallback"
                  aria-label="Avatar placeholder"
                >
                  <span className="acct__avatar-circle" />
                </div>
              )}
              <button
                type="button"
                className="acct__avatar-pick"
                onClick={onPickAvatar}
                title="Change photo"
                aria-label="Change photo"
              >
                <FiCamera />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onFile}
              />
            </div>

            <button
              type="button"
              className="btn btn-sm btn-light acct__upload-btn"
              onClick={onPickAvatar}
            >
              <FiUpload className="me-1" />
              Upload New Photo
            </button>
          </div>
        </div>

        {/* Personal info */}
        <div className="acct__section mt-3">
          <h6 className="mb-3">Personal Information</h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small">First Name</label>
              <input
                className="form-control acct__input"
                value={form.firstName}
                disabled={loading}
                onChange={(e) => onChangeField("firstName", e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Last Name</label>
              <input
                className="form-control acct__input"
                value={form.lastName}
                disabled={loading}
                onChange={(e) => onChangeField("lastName", e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label small">Email Address</label>
              <input
                type="email"
                className="form-control acct__input"
                value={form.email}
                disabled={loading}
                onChange={(e) => onChangeField("email", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!dirty || loading}
              onClick={onSave}
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Preferences (still using settings prop) */}
        <div className="acct__section mt-3">
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label small d-block">Notifications</label>
              <div className="acct__toggle-line">
                <span className="text-muted small me-2">
                  Send notifications
                </span>
                <label className="acct__switch">
                  <input
                    type="checkbox"
                    checked={!!settings.sendNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sendNotifications: e.target.checked,
                      })
                    }
                  />
                  <span className="acct__slider" />
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small d-block">
                Default Theme for Users
              </label>
              <select
                className="form-select acct__select"
                value={settings.themeOption || "light"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    themeOption: e.target.value,
                  })
                }
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="system">System Theme</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
