// src/components/AdivosrComponents/RiskDetailsPanel.jsx

import React from "react";
import { FiArrowLeft, FiAlertTriangle, FiEdit3 } from "react-icons/fi";

export default function RiskDetailsPanel({ risk, setTab, setSelectedClient }) {
  if (!risk) {
    return (
      <div className="p-5 fs-4 text-muted">
        No risk data available.
      </div>
    );
  }

  return (
    <div className="container-xxl">

      {/* Back Button */}
      <button
        className="btn btn-light mb-4"
        onClick={() => setTab("dashboard")}
      >
        <FiArrowLeft /> Back
      </button>

      {/* MAIN CARD */}
      <div className="card p-4 shadow-sm rounded-4">

        <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <FiAlertTriangle /> Risk Details
        </h3>

        {/* Client */}
        <p className="mb-2">
          <strong>Client:</strong> {risk.ownerName}
        </p>

        {/* Risk Level */}
        <p className="mb-2">
          <strong>Risk Level:</strong>{" "}
          <span
            className={`badge px-3 py-2 ${
              risk.riskLevel === "High"
                ? "bg-danger"
                : risk.riskLevel === "Medium"
                ? "bg-warning text-dark"
                : "bg-success"
            }`}
          >
            {risk.riskLevel}
          </span>
        </p>

        {/* Score */}
        <p className="mb-4">
          <strong>Risk Score:</strong> {risk.riskScore}
        </p>

        {/* Alerts */}
        <div className="mb-4">
          <strong>Alerts:</strong>

          <div className="d-flex flex-column gap-2 mt-2">
            {risk.alerts?.map((a, i) => (
              <div 
                key={i} 
                className="alert-card d-flex justify-content-between align-items-center p-3 rounded"
              >
                <span>{a.msg}</span>

                <span
                  className={`badge px-3 py-2 ${
                    a.type === "High"
                      ? "bg-danger"
                      : a.type === "Medium"
                      ? "bg-warning text-dark"
                      : "bg-success"
                  }`}
                >
                  {a.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* WRITE FEEDBACK BUTTON */}
        <button
          className="btn btn-primary d-flex align-items-center gap-2 mt-3"
          style={{ padding: "10px 16px", borderRadius: "10px" }}
          onClick={() => {
            setSelectedClient({
              _id: risk.ownerId,
              fullName: risk.ownerName,
            });
            setTab("feedback");
          }}
        >
          <FiEdit3 size={18} />
          Write Feedback
        </button>

      </div>
    </div>
  );
}
