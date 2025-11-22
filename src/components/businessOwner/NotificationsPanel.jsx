import React from "react";
import { FiBell } from "react-icons/fi";

export default function NotificationsPanel() {
  const [items, setItems] = React.useState([
    { id: "n1", title: "Feedback Update:", message: "You have feedback", tone: "success" },
    { id: "n2", title: "Feedback Update:", message: "You have feedback", tone: "success" },
    { id: "n3", title: "Upload Update:",   message: "Data has uploaded", tone: "info" },
  ]);

  const dismiss = (id) => setItems((list) => list.filter((n) => n.id !== id));

  return (
    <div className="container-xxl">
      <div className="notif__wrap card-neo p-4">
        <h5 className="mb-4">Notifications</h5>

        <div className="d-flex flex-column gap-3">
          {items.map((n) => (
            <div key={n.id} className={`notif__item ${n.tone}`}>
              <div className="notif__left">
                <span className="notif__icon"><FiBell /></span>
                <div className="notif__text">
                  <div className="notif__title">{n.title}</div>
                  <div className="notif__msg">{n.message}</div>
                </div>
              </div>
              <button className="notif__close" aria-label="Dismiss" onClick={() => dismiss(n.id)}>
                ×
              </button>
            </div>
          ))}
          {items.length === 0 && <div className="text-muted">All caught up</div>}
        </div>
      </div>
    </div>
  );
}
