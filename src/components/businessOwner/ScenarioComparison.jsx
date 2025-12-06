import React, { useEffect, useState } from "react";
import "./ScenarioComparison.css";

export default function ScenarioComparison() {
  const [scenarios, setScenarios] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const user = JSON.parse(localStorage.getItem("loggedUser"));
        const ownerId = user?.userId;

        // Load scenarios
        const sRes = await fetch(
          `http://localhost:5001/api/business-data/scenarios/owner/${ownerId}`
        );
        const sData = await sRes.json();
        if (sData.success) setScenarios(sData.scenarios);

        // Load advisor recommendations
        const rRes = await fetch(
          `http://localhost:5001/api/advisor/recommendations/owner/${ownerId}`
        );
        const rData = await rRes.json();
        setRecommendations(rData || []);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="scenario-wrapper">
        <h2 className="scenario-title">Pricing Scenarios</h2>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scenario-wrapper">
        <h2 className="scenario-title">Pricing Scenarios</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="scenario-wrapper">

      <h2 className="scenario-title">Pricing Scenarios</h2>

      {/* GRID: Left = Scenarios | Right = Advisor Recommendations */}
      <div className="scenario-grid-two-columns">

        {/* LEFT — SCENARIOS */}
        <div className="scenario-list">
          {scenarios.map((s) => (
            <div key={s._id} className="scenario-card">

              <div className="scenario-card-header">
                <div className="scenario-product">
                  {s.productName} — {Number(s.newPrice).toFixed(2)} SAR
                </div>
              </div>

              <div className="scenario-details">
                <span>Profit: <strong>{Number(s.totalProfit).toFixed(2)} SAR</strong></span>
                <span>Margin: <strong>{Number(s.profitMargin).toFixed(1)}%</strong></span>
                <span>Revenue: <strong>{Number(s.totalRevenue).toFixed(2)} SAR</strong></span>
                <span>Break-even Units: <strong>{s.breakEvenUnits}</strong></span>
              </div>

            </div>
          ))}
        </div>

        {/* RIGHT — ONE FIXED CARD OF RECOMMENDATIONS */}
        <div className="recommendation-box-fixed">
          <h2 className="recommendation-title">Advisor Recommendations</h2>

          {recommendations.length === 0 ? (
            <p>No recommendations yet.</p>
          ) : (
            <ul className="recommendation-list">
              {recommendations.map((r) => (
                <li key={r._id} className="rec-item">
                  <strong>{new Date(r.createdAt).toLocaleString()}:</strong>
                  <br />
                  {r.text}
                </li>
              ))}
            </ul>
          )}

          <p className="recommendation-footnote">
            These recommendations were sent by your financial advisor.
          </p>
        </div>

      </div>
    </div>
  );
}
