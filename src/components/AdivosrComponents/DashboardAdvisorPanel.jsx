// src/components/AdivosrComponents/DashboardAdvisorPanel.jsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { FiClock } from "react-icons/fi";

export default function DashboardAdvisorPanel({
  advisor,
  owners = [],
  tickets = [],
  activity = [],
  alerts = [],
  riskAlerts = [], // ← بيانات الريسك من الباكند
  setTab,
  setSelectedClient,
  setSelectedRisk,
}) {
  return (
    <div className="container-xxl">

      {/* =========================================
             CLIENTS WITH ACTIVE SIMULATIONS
      ========================================= */}
      <div className="card-neo p-4 mb-4">
        <h4 className="fw-bold mb-3">Clients with Active Simulations</h4>

        <div className="d-flex flex-column gap-3">
          {owners.slice(0, 2).map((o) => (
            <div
              key={o._id}
              className="d-flex justify-content-between p-3 rounded-3 card-neo"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedClient(o);
                setTab("simulation_details");
              }}
            >
              <div className="fw-semibold">{o.businessName || o.fullName}</div>
              <div className="text-muted small">Break-even Simulation</div>
              <div className="text-muted small">Updated recently</div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================
                 RISK ALERTS (FROM BACKEND)
      ========================================= */}
      <div className="card-neo p-4 mb-4">
        <h4 className="fw-bold">Risk Alerts</h4>
        <div className="text-muted mb-3">Important insights from your clients</div>

        {(!riskAlerts || riskAlerts.length === 0) && (
          <div className="text-muted">No risk alerts available</div>
        )}

        <div className="d-flex gap-3 flex-wrap">
          {riskAlerts?.map((r, i) => {
            const owner = owners.find((o) => o._id === r.ownerId);

            return (
              <div
                key={i}
                className="card shadow-sm p-3"
                style={{ width: 260, cursor: "pointer" }}
                onClick={() => {
                  // نجهز الداتا كاملة لصفحة Risk Details
                  setSelectedRisk({
                    ownerName: owner?.businessName || owner?.fullName || "Client",
                    riskLevel: r.level,
                    riskScore: r.riskScore,
                    alerts: r.alerts, // ← قائمة الرسائل
                  });

                  setTab("risk-details");
                }}
              >
                {/* Owner Name */}
                <strong className="mb-1 d-block">
                  {owner?.businessName || owner?.fullName || "Client"}
                </strong>

                {/* Alerts */}
                {r.alerts?.map((alert, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="fw-semibold">{alert.msg}</div>

                    <span
                      className={`badge mt-2 ${
                        alert.type === "High"
                          ? "bg-danger"
                          : alert.type === "Medium"
                          ? "bg-warning text-dark"
                          : alert.type === "Low"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {alert.type}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================
                 ADVISOR POINTS + RANK
      ========================================= */}
      <div className="mb-2">
        <span className="badge bg-danger-subtle text-danger p-3 rounded-3">
          Advisor Points: {advisor?.points ?? 0}
        </span>
        <div className="text-muted">
          Rank: {advisor?.rank ? `${advisor.rank}th` : "N/A"}
        </div>
      </div>

      {/* =========================================
                 WEEKLY ACTIVITY
      ========================================= */}
      <div className="card-neo p-4 mt-3">
        <h5 className="fw-bold mb-3">Weekly Activity</h5>

        {activity.length === 0 ? (
          <div className="text-muted">No activity data available</div>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valueA" fill="#00b4d8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="valueB" fill="#023e8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
