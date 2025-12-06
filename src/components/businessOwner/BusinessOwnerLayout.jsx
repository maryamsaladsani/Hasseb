import React, { useState, useEffect } from "react";
import { FiUser, FiBell, FiMoon, FiSun } from "react-icons/fi";
import "../../SharedStyles/Layout.css";

/* ============================
        HEADER
=============================== */
export function Header({ onOpenMenu }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("themeOption") || "light";
    });

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("themeOption", newTheme);
    };

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

                <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={toggleTheme}
                    style={{ marginLeft: "auto" }}
                    title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                    {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
                </button>
            </div>
        </nav>
    );
}

/* ============================
        SIDEBAR
=============================== */
export function Sidebar({ tab, setTab, isOpen, onClose, onLogout }) {

    const tools = [
        {
            id: "data",
            name: "Business Data",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
            ),
        },
        {
            id: "breakEven",
            name: "Break-Even Simulator",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
        },
        {
            id: "pricing",
            name: "Pricing Simulator",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
        },
        {
            id: "cashflow",
            name: "Cash Flow Tool",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
        },
        {
            id: "scenarios",
            name: "Scenarios",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            ),
        },

        {
            id: "feedback",
            name: "Feedback",
            icon: (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7A8.38 8.38 0 0 1 8.7 19L3 21l2-5.7A8.38 8.38 0 0 1 3.5 11.5a8.5 8.5 0 0 1 8.5-8.5h.5a8.5 8.5 0 0 1 8.5 8.5z" />
                </svg>
            ),
        },

        {
            id: "insights",
            name: "Dashboards & Insights",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
            ),
        },
    ];

    return (
        <>
            <div className={`pm-backdrop ${isOpen ? "show" : ""}`} onClick={onClose} />

            <aside className={`sidebar-neo pm-slide ${isOpen ? "is-open" : ""}`}>

                <div className="sidebar-neo__brand">
                    <img src="/assets/HaseebLogo.png" alt="Haseeb Logo" className="sidebar-logo-img" />
                </div>

                <nav className="sidebar-neo__nav">
                    {tools.map((tool) => {
                        const active = tab === tool.id;
                        return (
                            <button
                                key={tool.id}
                                onClick={() => {
                                    setTab(tool.id);
                                    onClose();
                                }}
                                className={`sidebar-neo__item ${active ? "is-active" : ""}`}
                            >
                                <span className="sidebar-neo__icon">{tool.icon}</span>
                                <span>{tool.name}</span>
                                {active && <span className="sidebar-neo__dot" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-neo__bottom">
                    <button
                        className="sidebar-neo__help-text"
                        onClick={() => {
                            setTab("support");
                            onClose();
                        }}
                    >
                        For Help & Support
                    </button>

                    <div className="sidebar-neo__dock">
                        <button
                            className="sidebar-neo__dock-btn"
                            onClick={() => {
                                setTab("account");
                                onClose();
                            }}
                        >
                            <FiUser size={20} />
                        </button>

                        <button
                            className="sidebar-neo__dock-btn"
                            onClick={() => {
                                setTab("notifications");
                                onClose();
                            }}
                        >
                            <FiBell size={20} />
                        </button>
                    </div>

                    <button className="sidebar-neo__logout" onClick={onLogout}>
                        <span className="sidebar-neo__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
