// ============================
//   IMPORTS
// ============================
import React from "react";
import {
  FiHome,
  FiMessageCircle,
  FiBarChart2,
  FiUser,
  FiBell,
  FiStar,
} from "react-icons/fi";
import "../../SharedStyles/Layout.css";

/* ============================
        HEADER
=============================== */
export function Header({ theme = "light", onOpenMenu }) {
  React.useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <nav className="navbar shadow-sm sticky-top">
      <div className="container-fluid">
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={onOpenMenu}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}

/* ============================
        SIDEBAR
=============================== */
export function Sidebar({ tab, setTab, isOpen, onClose }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
    { id: "feedback", label: "Feedback", icon: <FiMessageCircle /> },
    { id: "recommendations", label: "Recommendations", icon: <FiStar /> },
    { id: "analyzer", label: "Analyzer", icon: <FiBarChart2 /> },
  ];

  /* ============================
        LOGOUT FIX
  =============================== */
  const handleLogout = () => {
    try {
      localStorage.removeItem("loggedUser");
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Redirect to login page
    window.location.href = "/";
  };

  return (
    <>
      {/* BACKDROP */}
      {isOpen && (
        <div
          className="pm-backdrop-fixed"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="pmSidebar"
        className={`sidebar-neo pm-slide ${isOpen ? "is-open" : ""}`}
        role="navigation"
      >
        {/* LOGO */}
        <div className="offcanvas-header sidebar-neo__brand">
          <img
            src="/assets/Haseeb.png"
            alt="Haseeb Logo"
            className="sidebar-logo-img"
          />
        </div>

        {/* MENU */}
        <div className="offcanvas-body p-0 d-flex flex-column">
          <nav className="py-3 px-3 flex-grow-1">
            {items.map((it) => {
              const active = tab === it.id;

              return (
                <button
                  key={it.id}
                  onClick={() => {
                    setTab(it.id);
                    onClose();
                  }}
                  className={`sidebar-neo__item ${active ? "is-active" : ""}`}
                >
                  <span className="sidebar-neo__icon">{it.icon}</span>
                  <span className="sidebar-neo__label">{it.label}</span>
                  {active && <span className="sidebar-neo__dot" />}
                </button>
              );
            })}
          </nav>

          {/* SUPPORT */}
          <div
            className="px-3 py-2 small text-muted"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setTab("support");
              onClose();
            }}
          >
            For Help & Support
          </div>
        </div>

        {/* DOCK AREA */}
        <div className="sidebar-neo__dock">
          <button
            className="sidebar-neo__dock-btn"
            onClick={() => {
              setTab("account");
              onClose();
            }}
          >
            <FiUser size={18} />
          </button>

          <button
            className="sidebar-neo__dock-btn"
            onClick={() => {
              setTab("notifications");
              onClose();
            }}
          >
            <FiBell size={18} />
          </button>
        </div>

        {/* LOGOUT */}
        <button className="sidebar-neo__logout" onClick={handleLogout}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
