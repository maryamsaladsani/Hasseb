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

export default function RecommendationsPanel({ owners = [], advisorId }) {
  const [ownerId, setOwnerId] = useState("");

  // ----- SCENARIOS -----
  const [scenarios, setScenarios] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // ----- SCENARIO RECOMMENDATIONS -----
  const [recItems, setRecItems] = useState([]);

  // ----- GENERAL RECOMMENDATION -----
  const [generalText, setGeneralText] = useState("");
  const [generalItems, setGeneralItems] = useState([]);

  const [loading, setLoading] = useState(false);

  // ===============================================
  // LOAD DATA WHEN OWNER SELECTED
  // ===============================================
  useEffect(() => {
    if (ownerId) {
      loadScenarios();
      loadScenarioRecommendations();
      loadGeneralRecommendations();
    }
  }, [ownerId]);

  const loadScenarios = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/pricing-scenarios/${ownerId}`
      );
      if (res.data.success) setScenarios(res.data.scenarios || []);
      else setScenarios([]);
    } catch (err) {
      console.error("Error loading scenarios:", err);
      setScenarios([]);
    }
  };

  const loadScenarioRecommendations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/recommendations/${advisorId}`
      );
      const all = res.data || [];
      setRecItems(all.filter((x) => x.scenarioId && x.ownerId === ownerId));
    } catch (err) {
      console.error(err);
    }
  };

  const loadGeneralRecommendations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/advisor/recommendations/${advisorId}`
        );
        const all = res.data || [];
        setGeneralItems(all.filter((x) => !x.scenarioId && x.ownerId === ownerId));
      } catch (err) {
        console.error(err);
      }
    };
    const sendGeneralRecommendation = async () => {
      if (!generalText.trim()) return;

      setLoading(true);

      try {
        const res = await axios.post(
          "http://localhost:5001/api/advisor/recommendations",
          {
            advisorId,
            ownerId,
            scenarioId: null,
            text: generalText
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



  // ============================================================
  // METRICS (ScenarioComparison logic)
  // ============================================================
  function buildMetrics(s) {
    return {
      price: Number(s.newPrice || 0),
      variableCost: Number(s.variableCost || 0),
      fixedCostPerUnit: Number(s.fixedCostPerUnit || 0),
      profitPerUnit: Number(s.profitPerUnit || 0),
      profitMargin: Number(s.profitMargin || 0),
      totalProfit: Number(s.totalProfit || 0),
      totalRevenue: Number(s.totalRevenue || 0),
    };
  }

  // select/unselect scenarios
  function toggle(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  const selectedScenarios = selectedIds
    .map((id) => scenarios.find((s) => s._id === id))
    .filter(Boolean);

  // ============================================================
  // GRAPH DATA
  // ============================================================
  let chartData = [];
  if (selectedScenarios.length === 2) {
    chartData = selectedScenarios.map((s) => ({
      name: s.productName,
      margin: buildMetrics(s).profitMargin
    }));
  }

  return (
    <div className="support-container">
      <h1 className="support-title">Advisor Scenario Recommendations</h1>

      {/* OWNER SELECTION */}
      <div className="support-card">
        <label className="form-label">Owner</label>
        <select
          className="ticket-input"
          value={ownerId}
          onChange={(e) => {
            setOwnerId(e.target.value);
            setSelectedIds([]);
          }}
        >
          <option value="">Select Owner</option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* ============================================================ */}
      {/* MESSAGE IF NO SCENARIOS */}
      {/* ============================================================ */}
      {ownerId && scenarios.length === 0 && (
        <div className="support-card" style={{ marginTop: "1.5rem" }}>
          <h2 className="section-title">No Scenarios Available</h2>
          <p className="empty-state">
            This owner has not shared any scenarios yet.
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/*  SCENARIOS LIST + COMPARISON */}
      {/* ============================================================ */}
      {scenarios.length > 0 && (
        <div className="support-card">
          <h2 className="section-title">Choose Two Scenarios to Compare</h2>

          <div className="scenario-list">
            {scenarios.map((s) => {
              const m = buildMetrics(s);

              return (
                <div
                  key={s._id}
                  className={
                    "scenario-card" + (selectedIds.includes(s._id) ? " selected" : "")
                  }
                  onClick={() => toggle(s._id)}
                >
                  <div className="scenario-card-header">
                    <div className="scenario-product">
                      {s.productName} — {m.price} SAR
                    </div>
                  </div>

                  <div className="scenario-details">
                    <span><strong>Profit:</strong> {m.totalProfit}</span>
                    <span><strong>Margin:</strong> {m.profitMargin}%</span>
                    <span><strong>Revenue:</strong> {m.totalRevenue}</span>
                    <span>Saved: {new Date(s.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GRAPH SECTION */}
          {selectedScenarios.length === 2 && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3 className="section-title">Margin Comparison</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="margin" fill="#0ea5e9" radius={[8, 8, 0, 0]}>
                    <LabelList dataKey="margin" position="inside" fill="#fff" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* LIST OF SCENARIO RECOMMENDATIONS (READ-ONLY) */}
      {/* ============================================================ */}
      {recItems.length > 0 && (
        <div className="support-card" style={{ marginTop: "1.5rem" }}>
          <h2 className="section-title">Scenario Recommendations</h2>

          {recItems.map((r) => (
            <div key={r._id} className="ticket-item">
              <div className="ticket-item-left">
                <div className="ticket-icon">📊</div>
                <div className="ticket-info">
                  <div className="ticket-title">Comparison Recommendation</div>
                  <div className="ticket-date">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                  <p style={{ marginTop: 6 }}>{r.text}</p>
                </div>
              </div>

              <span className="ticket-status status-open">Scenario</span>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* GENERAL RECOMMENDATION INPUT */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* GENERAL RECOMMENDATIONS LIST */}
      {/* ============================================================ */}
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
