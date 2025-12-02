// src/components/AdivosrComponents/AnalyzerPanel.jsx
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

export default function AnalyzerPanel({ owners = [] }) {
  const [selectedOwnerId, setSelectedOwnerId] = useState(
    () => (owners[0]?._id || null)
  );

  const selectedOwner = useMemo(
    () => owners.find((o) => o._id === selectedOwnerId) || owners[0] || null,
    [owners, selectedOwnerId]
  );

  if (!owners || owners.length === 0) {
    return (
      <div className="container-xxl">
        <div className="alert alert-warning mt-3">
          No business owner linked yet. Once an owner is linked to this advisor,
          their business data will appear here for analysis.
        </div>
      </div>
    );
  }

  const fixedCosts = selectedOwner?.fixedCosts ?? 3000;
  const variableCost = selectedOwner?.variableCost ?? 10;
  const pricePerUnit = selectedOwner?.pricePerUnit ?? 20;
  const salesVolume = selectedOwner?.salesVolume ?? 400;

  const monthlyRevenue = selectedOwner?.monthlyRevenue ?? 12000;
  const monthlyExpenses = selectedOwner?.monthlyExpenses ?? 7000;
  const cashOnHand = selectedOwner?.cashOnHand ?? 3000;

  const breakEvenUnits =
    pricePerUnit - variableCost > 0
      ? Math.round(fixedCosts / (pricePerUnit - variableCost))
      : 0;

  const beData = [
    0.4,
    0.8,
    1.0,
    1.4
  ].map((mult, index) => {
    const units = Math.round(salesVolume * mult);
    return {
      units,
      cost: fixedCosts + variableCost * units,
      revenue: pricePerUnit * units
    };
  });

  const pricingData = [
    pricePerUnit - 2,
    pricePerUnit,
    pricePerUnit + 2
  ].map((p) => ({
    price: `${p} SAR`,
    profit: (p - variableCost) * salesVolume - fixedCosts
  }));

  const cashflowData = [
    {
      month: "Current",
      inflow: monthlyRevenue,
      outflow: monthlyExpenses
    },
    {
      month: "Optimistic",
      inflow: monthlyRevenue * 1.1,
      outflow: monthlyExpenses * 1.02
    },
    {
      month: "Pessimistic",
      inflow: monthlyRevenue * 0.9,
      outflow: monthlyExpenses * 1.05
    }
  ];

  const scenariosData = [
    {
      name: "Base",
      profit: monthlyRevenue - monthlyExpenses
    },
    {
      name: "Higher Price",
      profit:
        (pricePerUnit + 2 - variableCost) * salesVolume - fixedCosts
    }
  ];

  return (
    <div className="container-xxl">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Financial Analyzer</h4>

        <select
          className="form-select w-auto"
          value={selectedOwner?._id || ""}
          onChange={(e) => setSelectedOwnerId(e.target.value)}
        >
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.businessName || o.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Selected owner info */}
      <div className="card mb-4 p-3 shadow-sm">
        <h5 className="fw-semibold mb-2">
          {selectedOwner?.businessName || "Business"} Overview
        </h5>
        <div className="text-muted small">
          Owner: {selectedOwner?.fullName} — {selectedOwner?.email}
        </div>
        <div className="mt-3 row g-3">
          <div className="col-md-3">
            <div className="fw-semibold">Revenue</div>
            <div>{monthlyRevenue.toLocaleString()} SAR / month</div>
          </div>
          <div className="col-md-3">
            <div className="fw-semibold">Expenses</div>
            <div>{monthlyExpenses.toLocaleString()} SAR / month</div>
          </div>
          <div className="col-md-3">
            <div className="fw-semibold">Cash on hand</div>
            <div>{cashOnHand.toLocaleString()} SAR</div>
          </div>
          <div className="col-md-3">
            <div className="fw-semibold">Break-even units</div>
            <div>{breakEvenUnits}</div>
          </div>
        </div>
      </div>

      {/* 1) Break-even chart */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Break-even Analysis</h5>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={beData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="units" />
              <YAxis />
              <Tooltip />
              <Line dataKey="cost" stroke="#023e8a" strokeWidth={3} />
              <Line dataKey="revenue" stroke="#00b4d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2) Pricing simulation */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Pricing Simulation</h5>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={pricingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#0077b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3) Cashflow projection */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Cashflow Projection</h5>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={cashflowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="inflow" stroke="#0096c7" strokeWidth={3} />
              <Line dataKey="outflow" stroke="#d00000" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4) Scenario comparison */}
      <div className="card-neo p-4 mb-5">
        <h5 className="fw-bold mb-3">Scenario Comparison</h5>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={scenariosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#03045e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
