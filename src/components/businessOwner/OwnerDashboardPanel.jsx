// src/components/businessOwner/OwnerDashboardPanel.jsx
import React, { useState, useEffect } from "react";
import { generateDashboardInsights } from "./InsightEngine";
import "./OwnerDashboardPanel.css";

const TICKETS_API_URL = "http://localhost:5001/api/tickets";

export default function Dashboard() {

  // -----------------------------
  // STATE
  // -----------------------------
  const [businessData, setBusinessData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  // -----------------------------
  // ALWAYS FETCH BUSINESS DATA USING ownerId
  // -----------------------------
  useEffect(() => {
    const logged = JSON.parse(localStorage.getItem("loggedUser") || "null");
    const ownerId = logged?.ownerId;

    if (!ownerId) {
      console.error("❌ No ownerId in loggedUser");
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
        console.error("❌ Error fetching business data:", err);
        setLoadError(err.message || "Failed to load business data.");
      } finally {
        setLoadingData(false);
      }
    }

    fetchBusinessData();
  }, []);

  // -----------------------------
  // LOADING / ERROR HANDLING
  // -----------------------------
  if (loadingData) return <div>Loading…</div>;

  if (!businessData) {
    return <div>{loadError || "No data available. Please upload your sheets."}</div>;
  }

  // -----------------------------
  // INSIGHTS ENGINE
  // -----------------------------
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
  // CSV EXPORT
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
  // SHARE WITH ADVISOR (TICKET)
  // ================================================================
  async function handleShareWithAdvisor() {
    try {
      setShareLoading(true);
      setShareError("");
      setShareSuccess("");

      const logged = JSON.parse(localStorage.getItem("loggedUser") || "null");

      if (!logged || !logged.userId) {
        setShareError("Cannot find logged in owner information.");
        return;
      }

      const subject = "Simulation shared for advisor feedback";
      const topRecs = recommendations.slice(0, 3).join(" | ");

      const message = `
Owner has shared a new simulation.

Health score: ${healthScore}/100
Real burn rate: ${cashInsights.realBurnRate} SAR/month

Top recommendations:
${topRecs || "No recommendations generated."}
      `.trim();

      const res = await fetch(TICKETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: logged.userId,
          fromRole: "owner",
          subject,
          message,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to share with advisor.");
      }

      setShareSuccess("Shared with advisor successfully!");
    } catch (err) {
      console.error("handleShareWithAdvisor error:", err);
      setShareError(err.message || "Failed to share with advisor.");
    } finally {
      setShareLoading(false);
    }
  }

  // -----------------------------
  // RENDER
  // -----------------------------
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
        <p className="health-score-desc">
          This score evaluates pricing strength, break-even feasibility, and cash flow resilience.
        </p>
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
          <div className="insight-box">
            <h4>Danger Months</h4>
            <p className="insight-number">{cashInsights.dangerMonths}</p>
          </div>
          <div className="insight-box">
            <h4>First Danger Month</h4>
            <p className="insight-number">
              {cashInsights.firstDangerMonth || "None"}
            </p>
          </div>
        </div>
      </div>

      {/* BREAK EVEN */}
      <div className="section-card">
        <h3>Break-Even Insights</h3>
        {bepInsights.length === 0 && <p>No break-even insights yet.</p>}
        {bepInsights.map((b, i) => (
          <div key={i} className={`bep-item ${b.issue ? "bep-warning" : ""}`}>
            <strong>{b.product}:</strong> {b.message}
          </div>
        ))}
      </div>

      {/* PRICING */}
      <div className="section-card">
        <h3>Pricing Insights</h3>
        {pricingInsights.length === 0 && <p>No pricing insights yet.</p>}
        {pricingInsights.map((p, i) => (
          <div key={i} className="pricing-item">
            <strong>{p.product}:</strong> {p.margin.toFixed(1)}% margin — {p.opportunity}
          </div>
        ))}
      </div>

      {/* RECOMMENDATIONS */}
      <div className="section-card">
        <h3>Recommendations</h3>
        {recommendations.length === 0 ? (
          <p>No recommendations generated yet.</p>
        ) : (
          <ul className="recs-list">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-actions">
        <button className="export-btn" onClick={handleExportCSV}>
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
