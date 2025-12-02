import React, { useEffect, useState } from "react";
import axios from "axios";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);

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
        console.error(err);
      }
    }
    load();
  }, [advisorId]);

  return (
    <div className="container-xxl">
      <h3 className="fw-bold mb-4">Notifications</h3>

      {notifications.length === 0 ? (
        <div className="text-muted">No notifications yet</div>
      ) : (
        <ul className="list-group">
          {notifications.map((n) => (
            <li key={n._id} className="list-group-item">
              <strong>{n.message}</strong>
              <div className="text-muted small">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
