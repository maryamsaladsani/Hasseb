// src/components/AdivosrComponents/BreakEvenSimulationPanel.jsx
import React, { useState } from "react";
import axios from "axios";
import { FiArrowLeft, FiPenTool } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function BreakEvenSimulationPanel({ client, setTab }) {
  const [price, setPrice] = useState(Number(client?.pricePerUnit) || 0);
  const [variableCost, setVariableCost] = useState(Number(client?.variableCost) || 0);
  const [fixedCost, setFixedCost] = useState(Number(client?.fixedCosts) || 0);
  const [units, setUnits] = useState(Number(client?.salesVolume) || 0);


  const breakEvenUnits =
    price - variableCost > 0
      ? Math.round(fixedCost / (price - variableCost))
      : 0;

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const u = (i + 1) * (units / 7);
    return {
      point: `P${i + 1}`,
      revenue: u * price,
      cost: fixedCost + variableCost * u
    };
  });

  // 🟢 NEW — Save Suggestion API call
  const sendSuggestion = async () => {
    try {
      const advisor = JSON.parse(localStorage.getItem("loggedUser"));

      const payload = {
        advisorId: advisor?.userId,
        ownerId: client?._id,
        suggestion: {
          price,
          variableCost,
          fixedCost,
          units,
          breakEvenUnits
        }
      };

      await axios.post("http://localhost:5001/api/advisor/suggestions", payload);

      alert("Suggestion sent to the owner successfully!");
    } catch (err) {
      console.error("Suggestion Error:", err);
      alert("Error sending suggestion");
    }
  };

  // Early UI if no client selected
  if (!client) {
    return (
      <div className="container-xxl">
        <div className="d-flex align-items-center mb-4">
          <button
            className="btn btn-outline-secondary me-3"
            onClick={() => setTab("dashboard")}
          >
            <FiArrowLeft /> Back
          </button>
          <h3 className="fw-bold mb-0">Break-even Simulation</h3>
        </div>

        <div className="alert alert-warning">
          No business owner is selected. Please go back to the dashboard and
          choose an owner.
        </div>
      </div>
    );
  }

  const ownerName = client.businessName || client.fullName || "Business";

  return (
    <div className="container-xxl">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => setTab("dashboard")}
        >
          <FiArrowLeft /> Back
        </button>

        <h3 className="fw-bold mb-0">
          Break-even Simulation — {ownerName}
        </h3>
      </div>

      {/* Inputs */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Simulation Settings</h5>

        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Price per Unit (SAR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Variable Cost (SAR)</label>
            <input
              type="number"
              value={variableCost}
              onChange={(e) => setVariableCost(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Fixed Cost (SAR)</label>
            <input
              type="number"
              value={fixedCost}
              onChange={(e) => setFixedCost(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Expected Units Sold</label>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Break-even result */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Break-even Result</h5>

        <div className="alert alert-info fw-semibold">
          Estimated break-even point:
          <span className="text-primary"> {breakEvenUnits} units</span>
        </div>

        <div className="text-muted small">
          * You can tweak the inputs to test different scenario recommendations.
        </div>
      </div>

      {/* Chart */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Revenue vs Cost Trend</h5>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="point" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#28a745" strokeWidth={2} />
              <Line type="monotone" dataKey="cost" stroke="#dc3545" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔥 NEW — Save Suggestion Button */}
      <div className="text-end mt-3">
        <button
          className="btn btn-success d-inline-flex align-items-center gap-2"
          onClick={sendSuggestion}
        >
          💾 Save Suggestion
        </button>
      </div>

      {/* Write feedback button */}
      <div className="text-end mt-4">
        <button
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => setTab("feedback")}
        >
          <FiPenTool size={16} />
          Write Feedback
        </button>
      </div>
    </div>
  );
}
