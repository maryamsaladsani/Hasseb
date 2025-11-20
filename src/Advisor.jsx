import React, { useEffect, useState } from "react";
import { Header, Sidebar } from "./components/AdivosrComponents/AdvisorLayout.jsx";

import DashboardAdvisorPanel from "./components/AdivosrComponents/DashboardAdvisorPanel.jsx";
import FeedbackPanel from "./components/AdivosrComponents/FeedbackPanel.jsx";
import AnalyzerPanel from "./components/AdivosrComponents/AnalyzerPanel.jsx";

import BreakEvenSimulationPanel from "./components/AdivosrComponents/BreakEvenSimulationPanel.jsx";
import RiskDetailsPanel from "./components/AdivosrComponents/RiskDetailsPanel.jsx";

import SupportPanel2 from "./components/AdivosrComponents/SupportPanel2.jsx";
import TicketDetailsPanel from "./components/AdivosrComponents/TicketDetailsPanel.jsx";

import NotificationsPanel from "./components/Mangercopnents/NotificationsPanel.jsx";
import AccountPanel from "./components/AdivosrComponents/AccountPanel.jsx";

import { loadState, saveState } from "./information.js";

export default function Advisor() {

  // Auth guard — only advisor role can access
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    if (!user || user.role !== "advisor") {
      window.location.href = "/";
    }
  }, []);

  const [tab, setTab] = useState("dashboard");
  const [state, setState] = useState(loadState);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const themeOption = state.settings?.themeOption || "light";

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (themeOption === "light") {
      document.body.dataset.theme = "light";
    } else if (themeOption === "dark") {
      document.body.dataset.theme = "dark";
    } else {
      document.body.dataset.theme = systemTheme.matches ? "dark" : "light";
      const handleChange = (e) =>
        (document.body.dataset.theme = e.matches ? "dark" : "light");
      systemTheme.addEventListener("change", handleChange);
      return () => systemTheme.removeEventListener("change", handleChange);
    }
  }, [themeOption]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar
        tab={tab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        setTab={(id) => {
          setTab(id);
          setSidebarOpen(false);
        }}
      />

      <div className="flex-grow-1 d-flex flex-column">
        <Header
          theme={document.body.dataset.theme || "light"}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <main className="container-fluid py-4">
          {tab === "dashboard" && (
            <DashboardAdvisorPanel
              setTab={setTab}
              setSelectedClient={setSelectedClient}
              setSelectedRisk={setSelectedRisk}
            />
          )}

          {tab === "feedback" && <FeedbackPanel />}
          {tab === "analyzer" && <AnalyzerPanel />}

          {tab === "simulation_details" && (
            <BreakEvenSimulationPanel
              client={selectedClient}
              setTab={setTab}
            />
          )}

          {tab === "risk-details" && (
            <RiskDetailsPanel
              risk={selectedRisk}
              setTab={setTab}
            />
          )}

          {tab === "support" && (
            <SupportPanel2
              setTab={setTab}
              setSelectedTicket={setSelectedTicket}
            />
          )}

          {tab === "ticket-details" && (
            <TicketDetailsPanel ticket={selectedTicket} setTab={setTab} />
          )}

          {tab === "notifications" && <NotificationsPanel />}

          {tab === "account" && (
            <AccountPanel
              settings={state.settings}
              setSettings={(settings) =>
                setState((s) => ({ ...s, settings }))
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
