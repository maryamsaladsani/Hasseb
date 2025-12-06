import React, { useState, useEffect } from "react";
import { generateDashboardInsights } from "./InsightEngine";
import "./OwnerDashboardPanel.css"; 
const TICKETS_API_URL = "http://localhost:5001/api/tickets";


export default function Dashboard({ baseData }) {
    const [shareLoading, setShareLoading] = useState(false);
    const [shareError, setShareError] = useState("");
    const [shareSuccess, setShareSuccess] = useState("");

    if (!baseData) return <div>Loading…</div>;

    const insights = generateDashboardInsights(baseData);

    if (!insights) return <div>No data available.</div>;

    const { bepInsights, pricingInsights, cashInsights, healthScore, recommendations } = insights;

    // -------------------------
    // EXPORT CSV
    // -------------------------
    function handleExportCSV() {
        const rows = [];

        rows.push(["Metric", "Value"]);

        rows.push(["Health Score", healthScore]);
        rows.push(["Real Burn Rate", cashInsights.realBurnRate]);

        bepInsights.forEach((b) => {
            rows.push([`BEP - ${b.product}`, b.issue ? "Not profitable" : `${b.breakEvenUnits} units`]);
        });

        pricingInsights.forEach((p) => {
            rows.push([`Margin - ${p.product}`, `${p.margin.toFixed(1)}%`]);
        });

        recommendations.forEach((r, i) => {
            rows.push([`Recommendation ${i + 1}`, r]);
        });

        let csvContent =
            "data:text/csv;charset=utf-8," +
            rows.map((e) => e.join(",")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "business_model_export.csv";
        link.click();
    }

    // -------------------------
    // SHARE (mock)
    // -------------------------
 async function handleShareWithAdvisor() {
    try {
      setShareLoading(true);
      setShareError("");
      setShareSuccess("");

      // 1) Get logged-in owner from localStorage
      const logged = JSON.parse(localStorage.getItem("loggedUser") || "null");

      if (!logged || !logged.userId) {
        setShareError("Cannot find logged in owner information.");
        return;
      }

      // 2) Build a useful summary message from current insights
      const subject = "Simulation shared for advisor feedback";
      const topRecs = recommendations.slice(0, 3).join(" | ");
      const message = `
Owner has shared a new simulation.

Health score: ${healthScore}/100
Real burn rate: ${cashInsights.realBurnRate} SAR/month

Top recommendations:
${topRecs || "No recommendations generated."}
      `.trim();

      // 3) Call backend
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

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Business Dashboard</h1>
        <p className="dashboard-subtitle">
          Insights generated from your pricing, cash flow, and break-even data.
        </p>
      </div>

      {/* FEEDBACK MESSAGES */}
      {shareError && (
        <div className="alert alert-danger py-2 small mb-2">
          {shareError}
        </div>
      )}
      {shareSuccess && (
        <div className="alert alert-success py-2 small mb-2">
          {shareSuccess}
        </div>
      )}

      {/* HEALTH SCORE */}
      <div className="health-score-card">
        <h3>Health Score</h3>
        <p className="health-score-number">{healthScore}/100</p>
        <p className="health-score-desc">
          This score evaluates pricing strength, break-even feasibility, and
          cash flow resilience.
        </p>
      </div>

      {/* CASH INSIGHTS */}
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

      {/* BREAK-EVEN INSIGHTS */}
      <div className="section-card">
        <h3>Break-Even Insights</h3>

        {bepInsights.map((b, i) => (
          <div
            key={i}
            className={`bep-item ${b.issue ? "bep-warning" : ""}`}
          >
            <strong>{b.product}:</strong> {b.message}
          </div>
        ))}
      </div>

      {/* PRICING INSIGHTS */}
      <div className="section-card">
        <h3>Pricing Insights</h3>

        {pricingInsights.map((p, i) => (
          <div key={i} className="pricing-item">
            <strong>{p.product}:</strong>{" "}
            {p.margin.toFixed(1)}% margin — {p.opportunity}
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
