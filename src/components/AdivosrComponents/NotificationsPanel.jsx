// NotificationsPanel.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiBell, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import "../../SharedStyles/Notifications.css";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const advisorId = user?.userId;

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/advisor/notifications/${advisorId}`
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [advisorId]);

  const dismiss = (id) => {
    setNotifications((list) => list.filter((n) => n._id !== id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getNotificationType = (message) => {
    const msg = message.toLowerCase();

    if (msg.includes("feedback") || msg.includes("success")) return "success";
    if (msg.includes("warning") || msg.includes("pending")) return "warning";
    if (msg.includes("error") || msg.includes("failed")) return "error";

    return "info";
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle />;
      case "warning":
      case "error":
        return <FiAlertCircle />;
      default:
        return <FiBell />;
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <h1 className="notifications-title">Notifications</h1>
        <div className="notifications-card">
          <div className="notifications-empty">
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h1 className="notifications-title">Notifications</h1>

      <div className="notifications-card">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <FiBell />
            <p>All caught up! No new notifications.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((n) => {
              const type = getNotificationType(n.message);

              return (
                <div key={n._id} className={`notification-item ${type}`}>
                  <div className="notification-left">
                    <div className="notification-icon">{getIcon(type)}</div>

                    <div className="notification-content">
                      <h6 className="notification-title">Notification</h6>
                      <p className="notification-message">{n.message}</p>
                      <span className="notification-date">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="notification-close"
                    aria-label="Dismiss notification"
                    onClick={() => dismiss(n._id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
