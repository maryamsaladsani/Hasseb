import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";

export default function NotificationsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("loggedUser") || "null");
  const userId = user?.userId;

  // Load notifications from backend
  async function loadNotifications() {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5001/api/notifications?userId=${userId}`
      );

      const data = await res.json();
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  // Dismiss (mark as read)
  async function dismiss(id) {
    try {
      await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
        method: "POST",
      });

      // Remove from UI
      setItems((list) => list.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  if (!userId) {
    return <div className="text-muted p-3">No notifications (not logged in)</div>;
  }

  return (
    <div className="container-xxl">
      <div className="notif__wrap card-neo p-4">
        <h5 className="mb-4">Notifications</h5>

        {loading && <div className="text-muted">Loading...</div>}

        {!loading && (
          <div className="d-flex flex-column gap-3">
            {items.map((n) => (
              <div key={n._id} className={`notif__item ${n.tone || "info"}`}>
                <div className="notif__left">
                  <span className="notif__icon"><FiBell /></span>
                  <div className="notif__text">
                    <div className="notif__title">{n.title}</div>
                    <div className="notif__msg">{n.body}</div>
                    <div className="notif__time text-muted small">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  className="notif__close"
                  aria-label="Dismiss"
                  onClick={() => dismiss(n._id)}
                >
                  ×
                </button>
              </div>
            ))}

            {items.length === 0 && !loading && (
              <div className="text-muted">All caught up </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
