// src/components/businessOwner/OwnerDashboardPanel.jsx
import React, { useState, useEffect } from "react";
import { generateDashboardInsights } from "./InsightEngine";
import "./OwnerDashboardPanel.css";

const NOTIF_API_URL = "http://localhost:5001/api/advisor/notifications";

export default function Dashboard() {

  const [businessData, setBusinessData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  // ----------------------------------------
  // FETCH BUSINESS DATA
  // ----------------------------------------
  useEffect(() => {
    const logged = JSON.parse(localStorage.getItem("loggedUser") || "null");
    const ownerId = logged?.ownerId;

    if (!ownerId) {
      setLoadError("Cannot find owner account. Please log in again.");
      setLoadingData(false);
      return;
    }

    async function fetchBusinessData() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/business-data/owner/${ownerId}`
        );

        const data = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.message || "Failed to load business data.");
        }

        setBusinessData(data.data);

      } catch (err) {
        setLoadError(err.message || "Failed to load business data.");
      } finally {
        setLoadingData(false);
      }
    }

    fetchBusinessData();
  }, []);

  if (loadingData) return <div>Loading…</div>;

  if (!businessData) {
    return <div>{loadError || "No data available. Please upload your sheets."}</div>;
  }

  const insights = generateDashboardInsights(businessData);
  if (!insights) return <div>No data available.</div>;

  const {
    bepInsights,
    pricingInsights,
    cashInsights,
    healthScore,
    recommendations,
  } = insights;

  // ================================================================
  // RESTORE CSV EXPORT BUTTON (SAME STYLE AS BEFORE)
  // ================================================================
  function handleExportCSV() {
    const rows = [];

    rows.push(["Metric", "Value"]);
    rows.push(["Health Score", healthScore]);
    rows.push(["Real Burn Rate", cashInsights.realBurnRate]);

    bepInsights.forEach((b) => {
      rows.push([
        `BEP - ${b.product}`,
        b.issue ? "Not profitable" : `${b.breakEvenUnits} units`,
      ]);
    });

    pricingInsights.forEach((p) => {
      rows.push([`Margin - ${p.product}`, `${p.margin.toFixed(1)}%`]);
    });

    recommendations.forEach((r, i) => {
      rows.push([`Recommendation ${i + 1}`, r]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "business_model_export.csv";
    link.click();
  }

  // ================================================================
  // SHARE FULL BUSINESS DATA WITH ADVISOR
  // ================================================================
  async function handleShareWithAdvisor() {
    try {
      setShareLoading(true);
      setShareError("");
      setShareSuccess("");

      const logged = JSON.parse(localStorage.getItem("loggedUser"));
      const ownerId = logged?.userId;

      if (!ownerId) {
        setShareError("Owner ID not found.");
        return;
      }

      // 1️⃣ Get advisor
      const advRes = await fetch(
        `http://localhost:5001/api/assignments/owner/${ownerId}`
      );
      const advData = await advRes.json();

      if (!advData?.advisorId) {
        setShareError("No advisor assigned to this owner.");
        return;
      }

      const advisorId = advData.advisorId;

      // 2️⃣ Send FULL DATA
      const fullRes = await fetch("http://localhost:5001/api/owner/share/full-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          advisorId,
          businessData
        })
      });

      const fullData = await fullRes.json();

      if (!fullData.success) throw new Error(fullData.msg);

      setShareSuccess("Full business data sent to advisor!");

    } catch (err) {
      setShareError(err.message);
    } finally {
      setShareLoading(false);
    }
  }

  // ----------------------------------------
  // RENDER UI
  // ----------------------------------------
  return (
    <div className="dashboard-container">

      <div className="dashboard-header">
        <h1 className="dashboard-title">Business Dashboard</h1>
        <p className="dashboard-subtitle">
          Insights generated from your pricing, cash flow, and break-even data.
        </p>
      </div>

      {shareError && (
        <div className="alert alert-danger py-2 small mb-2">{shareError}</div>
      )}
      {shareSuccess && (
        <div className="alert alert-success py-2 small mb-2">{shareSuccess}</div>
      )}

      {/* HEALTH SCORE */}
      <div className="health-score-card">
        <h3>Health Score</h3>
        <p className="health-score-number">{healthScore}/100</p>
      </div>

      {/* CASH FLOW */}
      <div className="section-card">
        <h3>Cash Flow Insights</h3>
        <div className="insight-row">
          <div className="insight-box">
            <h4>Real Burn Rate</h4>
            <p className="insight-number">
              {cashInsights.realBurnRate.toLocaleString()} SAR / month
            </p>
          </div>
        </div>
      </div>

      {/* BREAK EVEN */}
      <div className="section-card">
        <h3>Break-Even Insights</h3>
        {bepInsights.map((b, i) => (
          <div key={i} className={`bep-item ${b.issue ? "bep-warning" : ""}`}>
            <strong>{b.product}:</strong> {b.message}
          </div>
        ))}
      </div>

      {/* PRICING */}
      <div className="section-card">
        <h3>Pricing Insights</h3>
        {pricingInsights.map((p, i) => (
          <div key={i} className="pricing-item">
            <strong>{p.product}:</strong> {p.margin.toFixed(1)}% margin
          </div>
        ))}
      </div>

      {/* RECOMMENDATIONS */}
      <div className="section-card">
        <h3>Recommendations</h3>
        <ul className="recs-list">
          {recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* ACTION BUTTONS */}
      <div className="dashboard-actions">

        {/* EXACT OLD TURQUOISE CSV BUTTON */}
        <button
          className="export-btn"
          onClick={handleExportCSV}
        >
          Export CSV
        </button>

        <button
          className="share-btn btn btn-warning"
          onClick={handleShareWithAdvisor}
          disabled={shareLoading}
        >
          {shareLoading ? "Sharing…" : "Share with Advisor"}
        </button>

      </div>
    </div>
  );
}
