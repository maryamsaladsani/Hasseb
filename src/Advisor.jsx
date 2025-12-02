// src/Advisor.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

import { Header, Sidebar } from "./components/AdivosrComponents/AdvisorLayout.jsx";

import DashboardAdvisorPanel from "./components/AdivosrComponents/DashboardAdvisorPanel.jsx";
import FeedbackPanel from "./components/AdivosrComponents/FeedbackPanel.jsx";
import AnalyzerPanel from "./components/AdivosrComponents/AnalyzerPanel.jsx";
import BreakEvenSimulationPanel from "./components/AdivosrComponents/BreakEvenSimulationPanel.jsx";
import RiskDetailsPanel from "./components/AdivosrComponents/RiskDetailsPanel.jsx";
import SupportPanel2 from "./components/AdivosrComponents/SupportPanel2.jsx";
import TicketDetailsPanel from "./components/AdivosrComponents/TicketDetailsPanel.jsx";
import NotificationsPanel from "./components/AdivosrComponents/NotificationsPanel.jsx";
import AccountPanel from "./components/AdivosrComponents/AccountPanel.jsx";
import "./components/AdivosrComponents/index.css";
export default function Advisor() {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================================
        THEME SETTINGS
  ================================= */
  const [settings, setSettings] = useState({
    themeOption: "system",
  });

  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const advisorId = user?.userId;

  /* ================================
        LOGOUT HANDLER
  ================================= */
  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "/";
  };

  /* ================================
        FETCH DASHBOARD DATA
  ================================= */
  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/dashboard/${advisorId}`
      );

      setData(res.data);
      setTickets(res.data.tickets);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (advisorId) fetchDashboard();
    else setLoading(false);
  }, [advisorId]);

  /* ================================
        FETCH TICKETS ONLY
  ================================= */
  const fetchTickets = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/tickets/${advisorId}`
      );
      setTickets(res.data);
    } catch (err) {
      console.error("Ticket fetch error:", err);
    }
  };

  /* ================================
        GUARD — MUST BE ADVISOR
  ================================= */
  useEffect(() => {
    if (!user || user.role !== "advisor") {
      window.location.href = "/";
    }
  }, [user]);

  if (loading) return <div className="p-5 fs-4">Loading...</div>;

  if (!data) {
    return (
      <div className="p-5 fs-4 text-danger">
        Failed to load data — please check backend connection.
      </div>
    );
  }

  const { advisor, owners, feedback, activity, alerts, filteredRisk } = data;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <Sidebar
        tab={tab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        setTab={(id) => {
          setTab(id);
          setSidebarOpen(false);
        }}
      />

      <div className="flex-grow-1 d-flex flex-column">
        
        {/* PASS THEME TO HEADER */}
        <Header
          onOpenMenu={() => setSidebarOpen(true)}
          theme={settings.themeOption}
        />

        <main className="container-fluid py-4">

          {/* Dashboard */}
          {tab === "dashboard" && (
            <DashboardAdvisorPanel
              advisor={advisor}
              owners={owners}
              tickets={tickets}
              activity={activity}
              alerts={alerts}
              setTab={setTab}
              setSelectedClient={setSelectedClient}
              setSelectedRisk={setSelectedRisk}
              riskAlerts={filteredRisk}
            />
          )}

          {/* Feedback */}
          {tab === "feedback" && (
            <FeedbackPanel
              feedback={feedback}
              owners={owners}
              advisorId={advisor?._id}
            />
          )}

          {/* Analyzer */}
          {tab === "analyzer" && <AnalyzerPanel owners={owners} />}

          {/* Break-even Simulation */}
          {tab === "simulation_details" && (
            <BreakEvenSimulationPanel
              client={selectedClient}
              setTab={setTab}
            />
          )}

          {/* Risk Details */}
          {tab === "risk-details" && (
            <RiskDetailsPanel
              risk={selectedRisk}
              setTab={setTab}
              setSelectedClient={setSelectedClient}
            />
          )}

          {/* Support */}
          {tab === "support" && (
            <SupportPanel2
              tickets={tickets}
              fetchTickets={fetchTickets}
              setSelectedTicket={setSelectedTicket}
              setTab={setTab}
            />
          )}

          {/* Ticket Details */}
          {tab === "ticket-details" && (
            <TicketDetailsPanel
              ticket={selectedTicket}
              setTab={setTab}
            />
          )}

          {/* Notifications */}
          {tab === "notifications" && <NotificationsPanel />}

          {/* ACCOUNT — PASS SETTINGS */}
          {tab === "account" && (
            <AccountPanel
              settings={settings}
              setSettings={setSettings}
            />
          )}

        </main>
      </div>
    </div>
  );
}
