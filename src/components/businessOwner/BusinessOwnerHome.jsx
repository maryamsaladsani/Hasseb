import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessOwnerHome.css";

import BusinessDataUpload from "./BusinessDataUpload.jsx";
import BreakEvenCalculator from "./BreakEvenCalculator";
import PricingSimulator from "./PricingSimulator";
import CashFlowTool from "./CashFlowTool";
import OwnerDashboardPanel from "./OwnerDashboardPanel.jsx";
import AccountPanel from "./AccountPanel.jsx";
import NotificationsPanel from "./NotificationsPanel.jsx";
import ScenarioComparison from "./ScenarioComparison.jsx";
import { FiUser, FiBell } from "react-icons/fi";

export default function OwnerHome() {
    // Auth guard
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedUser"));
        if (!user || user.role !== "owner") {
            window.location.href = "/";
        }
    }, []);

    const [activeTool, setActiveTool] = useState("data");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [uploadedData, setUploadedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("loggedUser");
        navigate("/");
    };

    // Fetch uploaded data on mount
    useEffect(() => {
        fetchBusinessData();
    }, []);

    const fetchBusinessData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("loggedUser"));
            if (!user) return;

            const username = user.username;

            const response = await fetch(
                `http://localhost:5001/api/business-data/${username}`
            );
            const result = await response.json();

            if (result.success && result.data) {
                setUploadedData(result.data);
                console.log("✅ Business data loaded:", result.data);
            } else {
                console.log("ℹ️ No business data found for user");
                setUploadedData(null);
            }
        } catch (error) {
            console.error("🔥 Error fetching business data:", error);
            setUploadedData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadSuccess = (data) => {
        console.log("✅ Upload successful, refreshing data...");
        fetchBusinessData(); // Refresh data after upload
        setActiveTool("breakEven"); // Optionally switch to calculator
    };

    const tools = [
        {
            id: "data",
            name: "Business Data",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
            ),
            requiresData: false,
        },
        {
            id: "breakEven",
            name: "Break-Even Simulator",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            requiresData: true,
        },
        {
            id: "pricing",
            name: "Pricing Simulator",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            requiresData: true,
        },
        {
            id: "cashflow",
            name: "Cash Flow Tool",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            requiresData: true,
        },
        {
            id: "scenarios",
            name: "Scenarios",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            ),
            requiresData: true,
            // 🔹 removed comingSoon so it’s now active
        },
        {
            id: "insights",
            name: "Dashboards & Insights",
            icon: (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
            ),
            requiresData: true,
        },
    ];

    const handleToolClick = (toolId /*, requiresData*/) => {
        setActiveTool(toolId);
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    if (isLoading) {
        return (
            <div className="owner-home">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                    }}
                >
                    <h3>Loading your data...</h3>
                </div>
            </div>
        );
    }

    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const username = loggedUser?.username;

    return (
        <div className="owner-home">
            {/* Header */}
            <header className="owner-header">
                <div className="owner-header-content">
                    <div className="owner-header-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <div className="owner-logo">
                            <img
                                src="/assets/HaseebLogo.png"
                                alt="Haseeb Logo"
                                className="logo-image"
                            />
                        </div>
                    </div>
                    <div className="owner-header-right">
                        <span className="owner-tagline">
                            Every Decision Counts
                        </span>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`owner-sidebar ${
                    sidebarOpen ? "owner-sidebar--open" : ""
                }`}
            >
                <div className="sidebar-content">
                    <nav className="sidebar-nav">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                className={`sidebar-nav-item ${
                                    activeTool === tool.id
                                        ? "sidebar-nav-item--active"
                                        : ""
                                } ${
                                    tool.comingSoon
                                        ? "sidebar-nav-item--disabled"
                                        : ""
                                }`}
                                onClick={() =>
                                    !tool.comingSoon &&
                                    handleToolClick(
                                        tool.id,
                                        tool.requiresData
                                    )
                                }
                            >
                                <span className="sidebar-nav-icon">
                                    {tool.icon}
                                </span>
                                <span className="sidebar-nav-label">
                                    {tool.name}
                                </span>

                                {tool.comingSoon && (
                                    <span className="sidebar-badge">Soon</span>
                                )}
                            </button>
                        ))}

                        {/* Logout */}
                        <button
                            className="sidebar-nav-item sidebar-nav-item--logout"
                            onClick={handleLogout}
                        >
                            <span className="sidebar-nav-icon">
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
                                    <line
                                        x1="21"
                                        y1="12"
                                        x2="9"
                                        y2="12"
                                    ></line>
                                </svg>
                            </span>
                            <span className="sidebar-nav-label">Logout</span>
                        </button>

                        {/* FOOTER BUTTONS */}
                        <div className="sidebar-footer">
                            <button
                                className="footer-icon-btn"
                                onClick={() => handleToolClick("account")}
                            >
                                <FiUser size={18} />
                            </button>

                            <button
                                className="footer-icon-btn"
                                onClick={() =>
                                    handleToolClick("notifications")
                                }
                            >
                                <FiBell size={18} />
                            </button>
                        </div>
                    </nav>
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="owner-main">
                <div className="owner-content">
                    {activeTool === "data" && (
                        <BusinessDataUpload
                            onUploadSuccess={handleUploadSuccess}
                        />
                    )}
                    {activeTool === "breakEven" && (
                        <BreakEvenCalculator baseData={uploadedData} />
                    )}
                    {activeTool === "pricing" && (
                        <PricingSimulator baseData={uploadedData} />
                    )}
                    {activeTool === "cashflow" && (
                        <CashFlowTool baseData={uploadedData} />
                    )}
                    {activeTool === "insights" && (
                        <OwnerDashboardPanel baseData={uploadedData} />
                    )}
                    {activeTool === "account" && (
                        <AccountPanel
                            settings={{}}
                            setSettings={() => {}}
                        />
                    )}
                    {activeTool === "notifications" && (
                        <NotificationsPanel />
                    )}

                    {/* 🔹 NEW: Active scenarios page */}
                    {activeTool === "scenarios" && username && (
                        <ScenarioComparison username={username} />
                    )}
                </div>
            </main>
        </div>
    );
}