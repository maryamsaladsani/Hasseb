import React, { useState } from "react";

import { Header } from "../Layout";

import BusinessDataUpload from "./BusinessDataUpload";
import BreakEvenCalculator from "./BreakEvenCalculator";

import { bepTestData } from "../../data/bepTestData";

export default function OwnerHome() {
    const [theme, setTheme] = useState("light");
    const [activeTool, setActiveTool] = useState("data");


    const handleOpenMenu = () => {
        // later connect to real sidebar
        console.log("open sidebar");
    };

    return (
        <div className="download-data-owner-page">
            {/* Uniform header for ALL owner tools */}
            <Header theme={theme} onOpenMenu={handleOpenMenu} />

            <div className="owner-main">
                {/* Top navigation between tools */}
                <div className="owner-tools-nav">
                    <button
                        className={
                            activeTool === "breakEven"
                                ? "owner-tools-btn owner-tools-btn--active"
                                : "owner-tools-btn"
                        }
                        onClick={() => setActiveTool("breakEven")}
                    >
                        Break-even simulator
                    </button>

                    <button
                        className={
                            activeTool === "pricing"
                                ? "owner-tools-btn owner-tools-btn--active"
                                : "owner-tools-btn"
                        }
                        onClick={() => setActiveTool("pricing")}
                    >
                        Pricing simulator
                    </button>

                    <button
                        className={
                            activeTool === "cashflow"
                                ? "owner-tools-btn owner-tools-btn--active"
                                : "owner-tools-btn"
                        }
                        onClick={() => setActiveTool("cashflow")}
                    >
                        Cashflow tool
                    </button>

                    <button
                        className={
                            activeTool === "data"
                                ? "owner-tools-btn owner-tools-btn--active"
                                : "owner-tools-btn"
                        }
                        onClick={() => setActiveTool("data")}
                    >
                        Business data input
                    </button>
                </div>

                {/* Main area: show active tool */}
                {activeTool === "breakEven" && (
                    <BreakEvenCalculator baseData={bepTestData} />
                )}

                {activeTool === "data" && <BusinessDataUpload />}

                {activeTool === "pricing" && (
                    <div className="upload-card">
                        <h6>Pricing simulator (coming soon)</h6>
                        <p>Here we’ll let you test different prices and see profit impact.</p>
                    </div>
                )}

                {activeTool === "cashflow" && (
                    <div className="upload-card">
                        <h6>Cashflow tool (coming soon)</h6>
                        <p>Here we’ll visualize your monthly inflows and outflows.</p>
                    </div>
                )}
            </div>
        </div>
    );
}