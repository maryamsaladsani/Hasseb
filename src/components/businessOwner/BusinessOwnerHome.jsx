import React, { useState } from "react";
import "./BusinessOwnerHome.css";

import BusinessDataUpload from "./BusinessDataUpload";
import BreakEvenCalculator from "./BreakEvenCalculator";
import PricingSimulator from "./PricingSimulator";
import CashFlowTool from "./CashFlowTool";



import { bepTestData } from "../../data/bepTestData";

export default function OwnerHome() {
    const [activeTool, setActiveTool] = useState("data");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [hasUploadedData, setHasUploadedData] = useState(false); // Track if user uploaded data

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
            requiresData: false
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
            requiresData: true
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
            requiresData: true,
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
            requiresData: true,
            comingSoon: true
        },
        {
            id: "scenarios",
            name: "Scenarios",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            ),
            requiresData: true,
            comingSoon: true
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
            requiresData: true,
            comingSoon: true
        },
        {
            id: "sliders",
            name: "Real-Time Assumptions",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
            ),
            requiresData: true,
            comingSoon: true
        }
    ];

    const handleToolClick = (toolId, requiresData) => {
        if (requiresData && !hasUploadedData) {
            // Show warning but still allow navigation to see the tool
            setActiveTool(toolId);
        } else {
            setActiveTool(toolId);
        }
        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const activToolInfo = tools.find(t => t.id === activeTool);

    return (
        <div className="owner-home">
            {/* Top Header */}
            <header className="owner-header">
                <div className="owner-header-content">
                    <div className="owner-header-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <div className="owner-logo">
                            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                                <path d="M20 80 L40 40 L50 60 L70 20 L90 50" stroke="#1AC6C6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                            <span className="owner-logo-text">HASEEB</span>
                        </div>
                    </div>
                    <div className="owner-header-right">
                        <span className="owner-tagline">Every Decision Counts</span>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`owner-sidebar ${sidebarOpen ? 'owner-sidebar--open' : ''}`}>
                <div className="sidebar-content">
                    <nav className="sidebar-nav">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                className={`sidebar-nav-item ${activeTool === tool.id ? 'sidebar-nav-item--active' : ''} ${tool.comingSoon ? 'sidebar-nav-item--disabled' : ''}`}
                                onClick={() => handleToolClick(tool.id, tool.requiresData)}
                            >
                                <span className="sidebar-nav-icon">{tool.icon}</span>
                                <span className="sidebar-nav-label">{tool.name}</span>
                                {tool.requiresData && !hasUploadedData && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sidebar-nav-warning">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                )}
                                {tool.comingSoon && (
                                    <span className="sidebar-badge">Soon</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="owner-main">
                <div className="owner-content">
                    {/* Warning Banner */}
                    {activToolInfo?.requiresData && !hasUploadedData && (
                        <div className="warning-banner">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <div className="warning-content">
                                <p className="warning-title">Data Upload Required</p>
                                <p className="warning-text">
                                    Upload your business data template to unlock this feature.{" "}
                                    <button
                                        className="warning-link"
                                        onClick={() => setActiveTool("data")}
                                    >
                                        Go to Business Data
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tool Content */}
                    {activeTool === "data" && (
                        <BusinessDataUpload onUploadSuccess={() => setHasUploadedData(true)} />
                    )}

                    {activeTool === "breakEven" && (
                        <BreakEvenCalculator baseData={hasUploadedData ? bepTestData : null} />
                    )}
                    {activeTool === "pricing" && (
                        <PricingSimulator baseData={bepTestData} />
                    )}
                    {activeTool === "cashflow" && (
                        <CashFlowTool baseData={bepTestData} />
                    )}

                    {(activeTool === "scenarios" || activeTool === "insights" || activeTool === "sliders") && (
                        <div className="coming-soon-card">
                            <div className="coming-soon-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <h3>{activToolInfo?.name}</h3>
                            <p>This feature is currently under development by your team.</p>
                            <span className="coming-soon-badge">Coming Soon</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
