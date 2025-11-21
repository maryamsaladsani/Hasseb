import React from "react";
import { generateDashboardInsights } from "./InsightEngine";
import "./OwnerDashboardPanel.css"; 

export default function Dashboard({ baseData }) {
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
    function handleShareAdvisor() {
        alert("Shared with advisor! (UI only — no backend yet)");
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

            {/* HEALTH SCORE */}
            <div className="health-score-card">
                <h3>Health Score</h3>
                <p className="health-score-number">{healthScore}/100</p>
                <p className="health-score-desc">
                    This score evaluates pricing strength, break-even feasibility, and cash flow resilience.
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
                    <div key={i} className={`bep-item ${b.issue ? "bep-warning" : ""}`}>
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

                <button className="share-btn" onClick={handleShareAdvisor}>
                    Share with Advisor
                </button>
            </div>
        </div>
    );
}
