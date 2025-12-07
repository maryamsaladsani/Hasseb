import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList
} from "recharts";

export default function RecommendationsPanel({ advisorId, owners = [] }) {

  const [ownerId, setOwnerId] = useState("");
  const [scenarios, setScenarios] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [generalText, setGeneralText] = useState("");
  const [generalItems, setGeneralItems] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ownerId) {
      loadScenarios(ownerId);
      loadGeneralRecommendations();
    }
  }, [ownerId]);

  // ============================
  // LOAD GENERAL RECOMMENDATIONS
  // ============================
  const loadGeneralRecommendations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/recommendations/${advisorId}`
      );

      const all = res.data || [];

      setGeneralItems(
        all.filter((x) => !x.scenarioId && x.ownerId === ownerId)
      );

    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  };

  // ============================
  // LOAD SCENARIOS + FILTER ZERO BREAK-EVEN
  // ============================
  const loadScenarios = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/business-data/scenarios/owner/${id}`
      );

      const data = res.data.scenarios || [];
      setScenarios(data);

      const formatted = data
        .map((s) => ({
          name: s.productName || s.scenarioName || "Scenario",
          breakEven: Number(s.breakEvenUnits || s.breakEvenPoint || 0),
        }))
        .filter((s) => s.breakEven > 0); 

      setChartData(formatted);

    } catch (err) {
      console.error("Error loading scenarios", err);
      setScenarios([]);
      setChartData([]);
    }
  };

  // ============================
  // SEND GENERAL RECOMMENDATION
  // ============================
  const sendGeneralRecommendation = async () => {
    if (!generalText.trim() || !ownerId) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/advisor/recommendations",
        {
          advisorId,
          ownerId,
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

  return (
    <div className="support-container">
      <h1 className="support-title">Scenario Recommendations</h1>

      {/* OWNER SELECTION */}
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

      {/* BREAK-EVEN GRAPH */}
      {chartData.length > 0 && (
        <div className="support-card" style={{ marginTop: "1.5rem" }}>
          <h2 className="section-title">Break-Even Analysis</h2>

          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"
              interval={0} 
              tick={{ fontSize: 12 }}
              />
              <YAxis />

              <Bar
                dataKey="breakEven"
                name="Break-Even Units"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="breakEven" position="inside" fill="#fff" />
              </Bar>
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
          placeholder="Write a general recommendation..."
        />

        <button
          className="submit-btn"
          disabled={loading}
          onClick={sendGeneralRecommendation}
        >
          {loading ? "Sending..." : "Send General Recommendation"}
        </button>
      </div>

      {/* GENERAL RECOMMENDATIONS LIST */}
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
