import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Sidebar } from "./BusinessOwnerLayout";

import BusinessDataUpload from "./BusinessDataUpload.jsx";
import BreakEvenCalculator from "./BreakEvenCalculator";
import PricingSimulator from "./PricingSimulator";
import CashFlowTool from "./CashFlowTool";
import OwnerDashboardPanel from "./OwnerDashboardPanel.jsx";
import ScenarioComparison from "./ScenarioComparison.jsx";
import BusinessOwnerSupport from "./BusinessOwnerSupport.jsx";
import BusinessOwnerTicketDetails from "./BusinessOwnerTicketDetails.jsx";
import OwnerFeedbackPanel from "./OwnerFeedbackPanel.jsx";

import AccountPanel from "./AccountPanel.jsx";
import NotificationsPanel from "./NotificationsPanel.jsx";

export default function OwnerHome() {
    // ------------------------------
    // Validate owner login
    // ------------------------------
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

    const [selectedTicket, setSelectedTicket] = useState(null);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("loggedUser");
        navigate("/");
    };

    // ------------------------------
    // Fetch Owner Business Data
    // ------------------------------
    useEffect(() => {
        fetchBusinessData();
    }, []);

    const fetchBusinessData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("loggedUser"));
            if (!user) return;

            // Use ownerId OR fallback to userId
            const ownerId = user.ownerId || user.userId;

            if (!ownerId) {
                console.warn("No ownerId/userId found in loggedUser");
                setUploadedData(null);
                setIsLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:5001/api/business-data/owner/${ownerId}`
            );

            const result = await response.json();

            if (result.success && result.data) {
                // FIXED: Store the actual backend data (do NOT erase it)
                setUploadedData(result.data);
            }
        } catch (error) {
            console.error("Error fetching business data:", error);
            setUploadedData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // ------------------------------
    // After Upload → Load & Open Tools
    // ------------------------------
    const handleUploadSuccess = () => {
        fetchBusinessData();
        setActiveTool("breakEven");
    };

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <h3>Loading...</h3>
            </div>
        );
    }

    const username = JSON.parse(localStorage.getItem("loggedUser"))?.username;

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* Header */}
            <Header onOpenMenu={() => setSidebarOpen(!sidebarOpen)} />

            {/* Sidebar */}
            <Sidebar
                tab={activeTool}
                setTab={setActiveTool}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="owner-main">
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                    {activeTool === "data" && (
                        <BusinessDataUpload onUploadSuccess={handleUploadSuccess} />
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
                        <AccountPanel settings={{}} setSettings={() => {}} />
                    )}

                    {activeTool === "notifications" && <NotificationsPanel />}

                    {activeTool === "scenarios" && username && (
                        <ScenarioComparison username={username} />
                    )}

                    {activeTool === "support" && (
                        <BusinessOwnerSupport
                            username={username}
                            setSelectedTicket={setSelectedTicket}
                            setTab={setActiveTool}
                        />
                    )}

                    {activeTool === "ticketDetails" && (
                        <BusinessOwnerTicketDetails
                            ticket={selectedTicket}
                            setTab={setActiveTool}
                        />
                    )}
                    {activeTool === "feedback" && (
                        <OwnerFeedbackPanel ownerId={JSON.parse(localStorage.getItem("loggedUser"))?.ownerId} />
                    )}                    
                </div>
            </main>
        </div>
    );
}
