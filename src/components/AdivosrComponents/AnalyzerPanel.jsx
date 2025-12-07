// src/components/AdivosrComponents/AnalyzerPanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function AnalyzerPanel({ advisorId, setTab }) {
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [businessData, setBusinessData] = useState(null);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingOwnerData, setLoadingOwnerData] = useState(false);

  // ================================
  // GET OWNERS LIST
  // ================================
  useEffect(() => {
    if (!advisorId) return;

    const loadOwners = async () => {
      try {
        setLoadingOwners(true);
        const res = await axios.get(
          `http://localhost:5001/api/advisor/owners/${advisorId}`
        );

        const ownersList = res.data?.owners || [];
        setOwners(ownersList);

        if (ownersList.length > 0) {
          setSelectedOwnerId(ownersList[0]._id);
        }
      } catch (err) {
        console.error("Error fetching owners", err);
      } finally {
        setLoadingOwners(false);
      }
    };

    loadOwners();
  }, [advisorId]);

  // ================================
  // LOAD BUSINESS DATA
  // ================================
  useEffect(() => {
    if (!selectedOwnerId) return;

    const loadBusiness = async () => {
      try {
        setLoadingOwnerData(true);

        const res = await axios.get(
          `http://localhost:5001/api/business-data/owner/${selectedOwnerId}`
        );

        setBusinessData(res.data?.data || null);
      } catch (err) {
        console.error("Error loading business data", err);
        setBusinessData(null);
      } finally {
        setLoadingOwnerData(false);
      }
    };

    loadBusiness();
  }, [selectedOwnerId]);

  // ================================
  // PREPARE CHART DATA
  // ================================
  const cashFlowChart =
    businessData?.cashFlow?.map((c, i) => ({
      name: c.date || `Entry ${i + 1}`,
      value: c.netCashFlow
    })) || [];

  // BREAK-EVEN CHART
  const breakEvenData =
    businessData?.scenarios?.map((s) => ({
      name: s.scenarioName || s.productName || "Scenario",
      sales: Number(s.breakEvenSales || 0),
    })) || [];

  const positiveMonths =
    businessData?.cashFlow?.filter((c) => c.netCashFlow > 0).length || 0;

  const negativeMonths =
    businessData?.cashFlow?.filter((c) => c.netCashFlow < 0).length || 0;

  const pieChartData = [
    { name: "Positive", value: positiveMonths },
    { name: "Negative", value: negativeMonths }
  ];

  const PIE_COLORS = ["#16a34a", "#dc2626"];

  // ================================
  // RENDER
  // ================================
  return (
    <div className="support-container">
      <h1 className="support-title">Analyzer</h1>

      {/* OWNER SELECT */}
      <div className="support-card">
        <div className="ticket-form">
          <div className="form-row">
            <label className="form-label">Select Owner</label>
            <select
              className="ticket-input"
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
            >
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.fullName || o.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="support-card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="submit-btn"
            style={{ background: "#2563eb", color: "white" }}
            onClick={() => {
              localStorage.setItem("selectedFeedbackOwner", selectedOwnerId);
              setTab("feedback");
            }}
          >
            ✨ Write Feedback
          </button>

          <button
            className="submit-btn"
            style={{ background: "#9333ea", color: "white" }}
            onClick={() => {
              localStorage.setItem("selectedRecommendationOwner", selectedOwnerId);
              setTab("recommendations");
            }}
          >
            📝 Write Recommendation
          </button>
        </div>
      </div>

      {/* BUSINESS DATA VIEW */}
      {loadingOwnerData ? (
        <p style={{ marginTop: "1rem" }}>Loading business data...</p>
      ) : !businessData ? (
        <p style={{ marginTop: "1rem" }}>No business data found.</p>
      ) : (
        <>
          {/* AREA CHART */}
          <div className="support-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">Cash Flow Trend</h2>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowChart}>
                <defs>
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  fill="url(#cashGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* LINE CHART */}
          <div className="support-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">Monthly Cash Flow (Line Chart)</h2>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cashFlowChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="support-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">Cash Flow Health</h2>

            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* PRODUCTS LIST */}
          <div className="support-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">Products</h2>
            <ul style={{ paddingLeft: "1rem" }}>
              {businessData.products?.map((p) => (
                <li key={p._id}>{p.name}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
