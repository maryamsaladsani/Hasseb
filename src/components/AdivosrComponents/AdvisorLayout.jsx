import React from "react";
import { 
  FiTrendingUp,
  FiHome,
  FiMessageCircle,
  FiBarChart2,
  FiUser,
  FiBell,
  FiHelpCircle
} from "react-icons/fi";

export function Header({ theme, onOpenMenu }) {
  React.useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <nav className="navbar bg-white shadow-sm sticky-top">
      <div className="container-fluid">
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={onOpenMenu}
          aria-label="Open sidebar"
        >
          ☰
        </button>
      </div>
    </nav>
  );
}

export function Sidebar({ tab, setTab, isOpen, onClose }) {

  const items = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
    { id: "feedback", label: "Feedback", icon: <FiMessageCircle /> },
    { id: "analyzer", label: "Analyzer", icon: <FiBarChart2 /> },
  ];

  return (
    <>
      <div
        className={`pm-backdrop ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="pmSidebar"
        className={`sidebar-neo pm-slide ${isOpen ? "is-open" : ""}`}
        role="navigation"
      >
        <div className="offcanvas-header sidebar-neo__brand">
          <div className="d-flex align-items-center gap-2">
            <img
      src="/assets/Haseeb.png"   
      alt="Haseeb Logo"
      className="sidebar-logo-img"
    />
            <div className="sidebar-neo__logo">
              <FiTrendingUp size={20} color="#fff" />
            </div>
          </div>
        </div>

        <div className="offcanvas-body p-0 d-flex flex-column">

          {/* MAIN MENUS */}
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

          {/* DOCK: Account + Notifications */}
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

          {/* HELP & SUPPORT LINK */}
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
      </aside>
    </>
  );
}
