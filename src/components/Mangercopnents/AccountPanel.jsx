import React from "react";
import { FiCamera, FiUpload } from "react-icons/fi";

export default function AccountPanel({ settings, setSettings }) {
  const [form, setForm] = React.useState({
    firstName: "Norah",
    lastName: "Alharbi",
    email: "Norah.doe@example.com",
    avatarUrl: "",
  });
  const [dirty, setDirty] = React.useState(false);
  const fileRef = React.useRef(null);

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

  const onSave = () => {
    setDirty(false);
    //fetch("",{PU})
    alert("Profile saved");
  };

  return (
    <div className="container-xxl">
      <div className="card-neo p-4 mb-4">
        <h5 className="mb-1">Profile Settings</h5>
        <div className="text-muted mb-3">
          Manage your account settings and preferences
        </div>

        {/* Avatar row */}
        <div className="acct__section">
          <div className="acct__photo">
            <div className="acct__avatar">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" />
              ) : (
                <div className="acct__avatar-fallback" aria-label="Avatar">
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
                onChange={(e) => onChangeField("firstName", e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Last Name</label>
              <input
                className="form-control acct__input"
                value={form.lastName}
                onChange={(e) => onChangeField("lastName", e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label small">Email Address</label>
              <input
                type="email"
                className="form-control acct__input"
                value={form.email}
                onChange={(e) => onChangeField("email", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!dirty}
              onClick={onSave}
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="acct__section mt-3">
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label small d-block">Notifications</label>
              <div className="acct__toggle-line">
                <span className="text-muted small me-2">Send notifications</span>
                <label className="acct__switch">
                  <input
                    type="checkbox"
                    checked={!!settings.sendNotifications}
                    onChange={(e) =>
                      setSettings({ sendNotifications: e.target.checked })
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
                  setSettings({ themeOption: e.target.value })
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
