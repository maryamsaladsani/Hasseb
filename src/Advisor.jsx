import React, { useState, useEffect } from "react";
import { Header, Sidebar } from "./components/AdivosrComponents/AdvisorLayout";

import DashboardAdvisorPanel from "./components/AdivosrComponents/DashboardAdvisorPanel";
import AnalyzerPanel from "./components/AdivosrComponents/AnalyzerPanel";
import NotificationsPanel from "./components/AdivosrComponents/NotificationsPanel";
import AccountPanel from "./components/AdivosrComponents/AccountPanel";
import SupportPanel from "./components/AdivosrComponents/SupportPanel2";
import RecommendationsPanel from "./components/AdivosrComponents/RecommendationsPanel";
import FeedbackPanel from "./components/AdivosrComponents/FeedbackPanel";
import RiskDetailsPanel from "./components/AdivosrComponents/RiskDetailsPanel";

export default function Advisor() {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const advisorId = user?.userId;

  const [tab, setTab] = useState("dashboard");
  const [owners, setOwners] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadAdvisorData();
  }, []);

  const loadAdvisorData = async () => {
    try {
      // Fetch owners
      const res = await fetch(
        `http://localhost:5001/api/advisor/dashboard/${advisorId}`
      );
      const data = await res.json();
      setOwners(data.owners || []);

      // Fetch feedback
      const fb = await fetch(
        `http://localhost:5001/api/advisor/feedback/${advisorId}`
      );
      const fbData = await fb.json();
      setFeedback(fbData.feedback || []);
    } catch (err) {
      console.error("Error loading advisor data:", err);
    }
  };


  const renderTab = () => {
    switch (tab) {
      case "dashboard":
        return (
          <DashboardAdvisorPanel
            advisorId={advisorId}
            owners={owners}
            feedback={feedback}
            setTab={setTab}
          />
        );

      case "analyzer":
        return (
          <AnalyzerPanel 
            owners={owners} 
            advisorId={advisorId}
            setTab={setTab}
          />
        );

      case "notifications":
        return <NotificationsPanel advisorId={advisorId} />;

      case "support":
        return <SupportPanel advisorId={advisorId} owners={owners} />;

      case "recommendations":
        return (
          <RecommendationsPanel
            advisorId={advisorId}
            owners={owners}
          />
        );

      case "feedback":
        return (
          <FeedbackPanel
            advisorId={advisorId}
            owners={owners}
            feedback={feedback}
            setFeedback={setFeedback}
          />
        );


      case "risk":
        return <RiskDetailsPanel owners={owners} />;

      case "account":
        return <AccountPanel advisorId={advisorId} />;

      default:
        return <DashboardAdvisorPanel advisorId={advisorId} setTab={setTab} />;
    }
  };

  return (
    <div className="advisor-layout">

      <Sidebar
        tab={tab}
        setTab={setTab}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="advisor-main">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        {renderTab()}
      </div>
    </div>
  );
}
