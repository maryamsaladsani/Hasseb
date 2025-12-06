// DashboardAdvisorPanel.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DashboardAdvisorPanel({
  advisorId,
  feedback = [],
  setTab,
}) {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [risk, setRisk] = useState(null);

  const [supportTickets, setSupportTickets] = useState([]);
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [notificationList, setNotificationList] = useState([]);

  useEffect(() => {
    if (!advisorId) return;
    fetchOwners();
    fetchSupportTickets();
    fetchRecommendationCount();
    fetchNotifications(); 
  }, [advisorId]);

  // ======== OWNERS ========
  const fetchOwners = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/dashboard/${advisorId}`
      );
      setOwners(res.data.owners || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  // ======== SUPPORT TICKETS ========
  const fetchSupportTickets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("loggedUser"));
      const fromUserId = user?.userId || advisorId;

      const res = await axios.get("http://localhost:5001/api/tickets", {
        params: { role: "advisor", userId: fromUserId },
      });

      setSupportTickets(res.data || []);
    } catch (err) {
      console.error("Dashboard support tickets error:", err);
    }
  };

  // ======== RECOMMENDATIONS COUNT ========
  const fetchRecommendationCount = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/recommendations/${advisorId}`
      );
      const items = res.data?.recommendations || res.data || [];
      setRecommendationCount(items.length);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  };

  // ⭐ NEW — GET REAL NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/notifications/${advisorId}`
      );
      setNotificationList(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  // ======== SELECT OWNER ========
  const handleSelectOwner = async (owner) => {
    setSelectedOwner(owner);
    setOwnerData(null);
    setRisk(null);

    try {
      const res = await axios.get(
        `http://localhost:5001/api/business-data/owner/${owner._id}`
      );
      const data = res.data?.data || null;
      setOwnerData(data);
      if (data) calculateRisk(data);
    } catch (e) {
      console.error("Owner business data error:", e);
    }
  };

  // ======== RISK ANALYSIS ========
  const calculateRisk = (data) => {
    const scenario = data.pricingScenarios?.[0] || {};
    const revenue = scenario.revenue || 0;
    const variableCost = scenario.variableCost || 0;
    const profit = scenario.profit || 0;

    const cashArray = data.cashFlow || [];

    const avgCash = Number(
      (
        cashArray.reduce((sum, c) => sum + c.netCashFlow, 0) /
        (cashArray.length || 1)
      ).toFixed(2)
    );

    const positiveMonths = cashArray.filter((c) => c.netCashFlow > 0).length;
    const negativeMonths = cashArray.filter((c) => c.netCashFlow < 0).length;

    const profitMargin =
      revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;

    const vcRatio =
      revenue > 0
        ? Number(((variableCost / revenue) * 100).toFixed(2))
        : 0;

    let score = 0;

    if (profitMargin < 8) score += 3;
    else if (profitMargin < 15) score += 2;
    else if (profitMargin < 20) score += 1;

    if (vcRatio > 70) score += 3;
    else if (vcRatio > 55) score += 2;
    else if (vcRatio > 40) score += 1;

    if (avgCash < 0) score += 2;

    if (negativeMonths > positiveMonths) score += 2;
    else if (negativeMonths > 0) score += 1;

    let level = "Low Risk";
    let color = "green";

    if (score >= 7) {
      level = "High Risk";
      color = "red";
    } else if (score >= 4) {
      level = "Medium Risk";
      color = "orange";
    }

    setRisk({
      level,
      color,
      score,
      profitMargin,
      vcRatio,
      positiveMonths,
      negativeMonths,
      avgCash,
    });
  };

  // ======== COUNTS ========
  const openTickets = supportTickets.filter((t) => t.status === "open").length;

  const unreadNotifications = notificationList.filter((n) => !n.read).length;

  const feedbackCount = feedback.length;
  const totalRecommendations = recommendationCount;

  // ======== BUSINESS METRICS ========
  const scenario = ownerData?.pricingScenarios?.[0] || null;

  const totalCost =
    scenario && ownerData?.fixedCost != null
      ? ownerData.fixedCost + scenario.variableCost
      : null;

  const profitMarginDisplay =
    scenario && scenario.revenue
      ? ((scenario.profit / scenario.revenue) * 100).toFixed(2)
      : null;

  const avgCashFlowDisplay =
    ownerData?.cashFlow?.length
      ? Number(
          (
            ownerData.cashFlow.reduce((s, c) => s + c.netCashFlow, 0) /
            ownerData.cashFlow.length
          ).toFixed(2)
        )
      : null;

  return (
    <div className="support-container">
      <h1 className="support-title">Advisor Dashboard</h1>

      {/* ===== STATS CARDS ===== */}
      <div className="stats-grid">

        {/* OPEN TICKETS */}
        <div className="stat-card clickable" onClick={() => setTab("support")}>
          <div className="stat-icon-wrapper stat-icon-blue">📩</div>
          <div className="stat-content">
            <span className="stat-label">Open Tickets</span>
            <span className="stat-value">{openTickets}</span>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div
          className="stat-card clickable"
          onClick={() => setTab("notifications")}
        >
          <div className="stat-icon-wrapper stat-icon-yellow">🔔</div>
          <div className="stat-content">
            <span className="stat-label">Unread Notifications</span>
            <span className="stat-value">{unreadNotifications}</span>
          </div>
        </div>

        {/* FEEDBACK */}
        <div className="stat-card clickable" onClick={() => setTab("feedback")}>
          <div className="stat-icon-wrapper stat-icon-green">💬</div>
          <div className="stat-content">
            <span className="stat-label">Total Feedback</span>
            <span className="stat-value">{feedbackCount}</span>
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        <div
          className="stat-card clickable"
          onClick={() => setTab("recommendations")}
        >
          <div className="stat-icon-wrapper stat-icon-purple">📝</div>
          <div className="stat-content">
            <span className="stat-label">Recommendations</span>
            <span className="stat-value">{totalRecommendations}</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="two-column-grid">

        {/* LEFT — OWNERS LIST */}
        <div className="support-card">
          <h2 className="card-title">Assigned Owners</h2>

          {owners.length === 0 && (
            <div className="empty-state">No owners assigned yet.</div>
          )}

          {owners.map((owner) => (
            <div
              key={owner._id}
              className="ticket-item"
              onClick={() => handleSelectOwner(owner)}
            >
              <div className="ticket-item-left">
                <div className="ticket-icon">👤</div>
                <div className="ticket-info">
                  <div className="ticket-title">{owner.fullName}</div>
                  <div className="ticket-date">{owner.username}</div>
                </div>
              </div>
              <span className="ticket-status status-open">Owner</span>
            </div>
          ))}
        </div>

        {/* RIGHT — BUSINESS DETAILS */}
        <div className="support-card">
          {!selectedOwner ? (
            <div className="empty-state">
              Select an owner to view business details.
            </div>
          ) : (
            <>
              <h2 className="section-title">
                {selectedOwner.fullName} — Business Overview
              </h2>

              {!ownerData ? (
                <p className="empty-state">
                  This owner has not uploaded business data yet.
                </p>
              ) : (
                <>
                  {/* BUSINESS METRICS */}
                  <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
                    <div className="stat-card">
                      <span className="stat-label">Fixed Cost</span>
                      <span className="stat-value">{ownerData.fixedCost}</span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Price / Unit</span>
                      <span className="stat-value">
                        {scenario?.price ?? "—"}
                      </span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">
                        {scenario?.revenue ?? "—"}
                      </span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Variable Cost</span>
                      <span className="stat-value">
                        {scenario?.variableCost ?? "—"}
                      </span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Total Cost</span>
                      <span className="stat-value">{totalCost ?? "—"}</span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Profit</span>
                      <span className="stat-value">
                        {scenario?.profit ?? "—"}
                      </span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Profit Margin (%)</span>
                      <span className="stat-value">
                        {profitMarginDisplay ?? "—"}
                      </span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Avg Cash Flow</span>
                      <span className="stat-value">
                        {avgCashFlowDisplay ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* RISK ANALYSIS */}
                  {risk && (
                    <div style={{ marginTop: "1rem", width: "100%" }}>
                      <h3 className="card-title">Risk Analysis</h3>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        <div className="stat-card">
                          <span className="stat-label">Risk Level</span>
                          <span
                            className="stat-value"
                            style={{
                              color: risk.color,
                              fontWeight: "bold",
                            }}
                          >
                            {risk.level}
                          </span>
                        </div>

                        <div className="stat-card">
                          <span className="stat-label">Risk Score</span>
                          <span className="stat-value">{risk.score}</span>
                        </div>

                        <div className="stat-card">
                          <span className="stat-label">Profit Margin %</span>
                          <span className="stat-value">
                            {risk.profitMargin}
                          </span>
                        </div>

                        <div className="stat-card">
                          <span className="stat-label">VC Ratio %</span>
                          <span className="stat-value">{risk.vcRatio}</span>
                        </div>

                        <div className="stat-card">
                          <span className="stat-label">Positive Months</span>
                          <span className="stat-value">
                            {risk.positiveMonths}
                          </span>
                        </div>

                        <div className="stat-card">
                          <span className="stat-label">Negative Months</span>
                          <span className="stat-value">
                            {risk.negativeMonths}
                          </span>
                        </div>

                        <div className="stat-card">
                          <span className="stat-label">Avg Cash Flow</span>
                          <span className="stat-value">{risk.avgCash}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
