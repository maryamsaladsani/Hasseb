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

import AccountPanel from "./AccountPanel.jsx";
import NotificationsPanel from "./NotificationsPanel.jsx";

export default function OwnerHome() {
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

    useEffect(() => {
        fetchBusinessData();
    }, []);

    const fetchBusinessData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("loggedUser"));
            if (!user) return;

            // 🔥 FIXED → Use ownerId, NOT userId
            const response = await fetch(
                `http://localhost:5001/api/business-data/owner/${user.ownerId}`
            );

            const result = await response.json();

            if (result.success && result.data) {
                setUploadedData(result.data);
            } else {
                setUploadedData(null);
            }
        } catch (error) {
            console.error("Error fetching business data:", error);
            setUploadedData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        fetchBusinessData();
        setActiveTool("breakEven");
    };

    if (isLoading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh"
            }}>
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
                </div>
            </main>
        </div>
    );
}
