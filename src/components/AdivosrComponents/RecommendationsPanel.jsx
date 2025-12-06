import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RecommendationsPanel({ advisorId, owners = [] }) {
  const [ownerId, setOwnerId] = useState("");
  const [scenarios, setScenarios] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [generalText, setGeneralText] = useState("");
  const [generalItems, setGeneralItems] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGeneralRecommendations();
  }, []);

  useEffect(() => {
    if (ownerId) loadScenarios(ownerId);
  }, [ownerId]);

  const loadGeneralRecommendations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/recommendations/${advisorId}`
      );

      const all = res.data || [];

      // Filter general recs (no scenarioId)
      setGeneralItems(all.filter((x) => !x.scenarioId));
    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  };

  const loadScenarios = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/business-data/scenarios/owner/${id}`
      );

      const data = res.data.scenarios || [];

      setScenarios(data);

      const formatted = data.map((s) => ({
        name: s.productName || s.scenarioName || "Scenario",
        breakEven: Number(s.breakEvenUnits || s.breakEvenPoint || 0),
        profit: Number(s.profit || 0),
        sales: Number(s.salesVolume || s.quantity || 0),
      }));

      setChartData(formatted);
    } catch (err) {
      console.error("Error loading scenarios", err);
      setScenarios([]);
      setChartData([]);
    }
  };

  // -----------------------------------------
  // SEND GENERAL RECOMMENDATION
  // -----------------------------------------
  const sendGeneralRecommendation = async () => {
    if (!generalText.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/advisor/recommendations",
        {
          advisorId,
          ownerId: null,
          scenarioId: null,
          text: generalText,
        }
      );

      const newRec = res.data.recommendation;
      setGeneralItems((prev) => [newRec, ...prev]);

      setGeneralText("");
    } catch (err) {
      console.error("Error sending general recommendation", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="support-container">
      <h1 className="support-title">Scenario Recommendations</h1>

      {/* OWNER SELECT */}
      <div className="support-card">
        <div className="ticket-form">
          <label className="form-label">Owner</label>
          <select
            className="ticket-input"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
          >
            <option value="">Select Owner</option>
            {owners.map((o) => (
              <option key={o._id} value={o._id}>
                {o.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CHART */}
      {chartData.length > 0 && (
        <div className="support-card" style={{ marginTop: "1.5rem" }}>
          <h2 className="section-title">Scenario Comparison Chart</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="breakEven" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" fill="#9333ea" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sales" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* GENERAL RECOMMENDATION INPUT */}
      <div className="support-card" style={{ marginTop: "1.5rem" }}>
        <h2 className="section-title">General Recommendation</h2>

        <textarea
          className="ticket-textarea"
          rows={4}
          value={generalText}
          onChange={(e) => setGeneralText(e.target.value)}
          placeholder="Write a general recommendation for the owner..."
        />

        <button
          className="submit-btn"
          onClick={sendGeneralRecommendation}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send General Recommendation"}
        </button>
      </div>

      {/* LIST GENERAL RECOMMENDATIONS */}
      <div className="support-card" style={{ marginTop: "1.5rem" }}>
        <h2 className="section-title">All General Recommendations</h2>

        {generalItems.length === 0 ? (
          <p className="empty-state">No general recommendations yet.</p>
        ) : (
          generalItems.map((r) => (
            <div key={r._id} className="ticket-item">
              <div className="ticket-item-left">
                <div className="ticket-icon">📝</div>
                <div className="ticket-info">
                  <div className="ticket-title">General Recommendation</div>
                  <div className="ticket-date">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                  <p style={{ marginTop: 6 }}>{r.text}</p>
                </div>
              </div>

              <span className="ticket-status status-open">General</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
