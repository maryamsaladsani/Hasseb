// CashFlowTool.jsx
import React, { useState, useEffect } from "react";
import "./CashFlowTool.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// --- Process cash flow data ---
function processCashFlowData(cashFlowData, dangerZone) {
  if (!cashFlowData || cashFlowData.length === 0) {
    return { error: "No cash flow data available." };
  }

  let runningBalance = 0;

  const processedData = cashFlowData.map((entry, index) => {
    const hasCashColumns =
      entry.cashIn != null || entry.cashOut != null || entry.CashIn != null || entry.CashOut != null;

    let cashIn = 0;
    let cashOut = 0;
    let netCashFlow = 0;

    if (hasCashColumns) {
      cashIn = Number(entry.cashIn ?? entry.CashIn) || 0;
      cashOut = Number(entry.cashOut ?? entry.CashOut) || 0;
      netCashFlow = cashIn - cashOut;
    } else {
      // fallback: use Net Cash Flow column only
      netCashFlow = Number(entry.netCashFlow ?? entry.NetCashFlow) || 0;

      if (netCashFlow >= 0) {
        cashIn = netCashFlow;
        cashOut = 0;
      } else {
        cashIn = 0;
        cashOut = Math.abs(netCashFlow);
      }
    }
    if (index === 0) {
      if (entry.runningBalance != null || entry.RunningBalance != null) {
        runningBalance =
          Number(entry.runningBalance ?? entry.RunningBalance) || 0;
      } else if (entry.openingBalance != null || entry.OpeningBalance != null) {
        runningBalance =
          Number(entry.openingBalance ?? entry.OpeningBalance) || 0;
      } else {
        runningBalance = netCashFlow;
      }
    } else {
      runningBalance += netCashFlow;
    }

    const isDanger = runningBalance < dangerZone;
    const isWarning =
      runningBalance < dangerZone * 1.2 && runningBalance >= dangerZone;

    return {
      date: entry.date || entry.Date,
      description: entry.description || entry.Description,
      cashIn,
      cashOut,
      netCashFlow,
      runningBalance,
      isDanger,
      isWarning,
      status: isDanger ? "danger" : isWarning ? "warning" : "safe",
    };
  });

  // Calculate summary metrics
  const lowestBalance = Math.min(
    ...processedData.map((d) => d.runningBalance)
  );
  const currentBalance =
    processedData[processedData.length - 1]?.runningBalance || 0;
  const dangerMonths = processedData.filter((d) => d.isDanger);
  const avgCashOut =
    processedData.reduce((sum, d) => sum + d.cashOut, 0) /
    processedData.length;

  return {
    data: processedData,
    summary: {
      currentBalance,
      lowestBalance,
      dangerMonthsCount: dangerMonths.length,
      firstDangerMonth: dangerMonths[0]?.date || null,
      avgMonthlyBurn: avgCashOut,
    },
  };
}

// --- Build summary for dashboard ---
function buildCashFlowSummary(result, dangerZone) {
  if (!result || result.error || !result.summary) return null;
  const {
    currentBalance,
    lowestBalance,
    dangerMonthsCount,
    firstDangerMonth,
    avgMonthlyBurn,
  } = result.summary;

  return {
    currentBalance,
    lowestBalance,
    dangerMonthsCount,
    firstDangerMonth,
    avgMonthlyBurn,
    dangerZone,
  };
}

export default function CashFlowTool({ baseData, onUpdate }) {
  const [dangerZone, setDangerZone] = useState(10000);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (baseData?.cashFlow) {
      const processed = processCashFlowData(baseData.cashFlow, dangerZone);
      setResult(processed);
      if (onUpdate) {
        const summary = buildCashFlowSummary(processed, dangerZone);
        onUpdate(summary);
      }
    }
  }, [baseData, dangerZone, onUpdate]);

  const handleDangerZoneChange = (e) => {
    const value = Number(e.target.value);
    setDangerZone(value);
  };

  if (!baseData?.cashFlow || baseData.cashFlow.length === 0) {
    return (
      <div className="cashflow-card">
        <div className="cashflow-header">
          <div className="cashflow-icon-wrapper">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h2 className="cashflow-title">Cash Flow Tool</h2>
        </div>
        <div className="cashflow-empty-state">
          <p>No cash flow data found. Please upload your Cash Flow sheet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cashflow-card">
      {/* Header */}
      <div className="cashflow-header">
        <div className="cashflow-icon-wrapper">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <h2 className="cashflow-title">Cash Flow Tool</h2>
      </div>

      {/* Top Section - Danger Zone + Warning Banner (Horizontal) */}
      <div className="cashflow-top-section">
        {/* Danger Zone Setting */}
        <div className="danger-zone-section tooltip-wrapper">
          <div className="danger-zone-header">
            <label className="cashflow-label">
              Set Your Danger Zone Threshold
              <svg
                className="info-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </label>
            <span className="danger-zone-value">
              {dangerZone.toLocaleString()} SAR
            </span>
          </div>
          <span className="tooltip-text">
            Haseeb lets you set your minimum comfortable cash balance. He'll
            warn you when your balance falls below this threshold so you can
            take action early.
          </span>
          <input
            type="range"
            min="0"
            max="50000"
            step="1000"
            value={dangerZone}
            onChange={handleDangerZoneChange}
            className="danger-zone-slider"
          />
          <p className="danger-zone-hint">
            You'll be alerted when your cash balance falls below this amount
          </p>
        </div>

        {/* Warning Banner (or empty div if no warnings) */}
        {result?.summary?.dangerMonthsCount > 0 ? (
          <div className="warning-banner-cashflow tooltip-wrapper">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>
              <p className="warning-title-cashflow">
                Cash Shortfall Alert!
                <svg
                  className="info-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </p>
              <p className="warning-text-cashflow">
                Your balance will fall below the danger zone in{" "}
                <strong>{result.summary.firstDangerMonth}</strong>. Total danger
                months:{" "}
                <strong>{result.summary.dangerMonthsCount}</strong>
              </p>
            </div>
            <span className="tooltip-text">
              Haseeb alerts you when your cash will drop below the danger zone
              you set. This gives you time to arrange financing or cut costs.
            </span>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* Summary Cards - 4 in a row */}
      {result?.summary && (
        <div className="summary-cards">
          <div className="summary-card tooltip-wrapper">
            <span className="summary-label">
              Current Balance
              <svg
                className="info-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <span
              className={`summary-value ${
                result.summary.currentBalance < dangerZone ? "danger-value" : ""
              }`}
            >
              {result.summary.currentBalance.toLocaleString()} SAR
            </span>
            <span className="tooltip-text">
              Haseeb shows you your latest cash position from your most recent
              transaction. This is where you stand right now financially.
            </span>
          </div>

          <div className="summary-card tooltip-wrapper">
            <span className="summary-label">
              Projected Lowest
              <svg
                className="info-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <span
              className={`summary-value ${
                result.summary.lowestBalance < dangerZone ? "danger-value" : ""
              }`}
            >
              {result.summary.lowestBalance.toLocaleString()} SAR
            </span>
            <span className="tooltip-text">
              Haseeb warns you about the lowest point your cash will reach in
              the coming months. If this number is negative or below your
              comfort zone, you need to plan ahead.
            </span>
          </div>

          <div className="summary-card tooltip-wrapper">
            <span className="summary-label">
              Avg Monthly Burn
              <svg
                className="info-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <span className="summary-value">
              {result.summary.avgMonthlyBurn.toLocaleString()} SAR
            </span>
            <span className="tooltip-text">
              Haseeb calculates your average monthly spending. This helps you
              understand how much cash you typically use each month to run your
              business.
            </span>
          </div>

          <div className="summary-card tooltip-wrapper">
            <span className="summary-label">
              Danger Months
              <svg
                className="info-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <span
              className={`summary-value ${
                result.summary.dangerMonthsCount > 0
                  ? "danger-value"
                  : "safe-value"
              }`}
            >
              {result.summary.dangerMonthsCount}
            </span>
            <span className="tooltip-text">
              Haseeb identifies how many months your balance will fall below
              your danger zone. Zero means you're safe throughout the period.
            </span>
          </div>
        </div>
      )}

      {/* Main Content - Chart and Table Side by Side */}
      {result?.data && (
        <div className="cashflow-main-content">
          {/* Chart Section */}
          <div className="chart-section">
            <h3 className="chart-title">Cash Flow Timeline</h3>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={result.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#14748A" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: "#14748A" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #1AC6C6",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <ReferenceLine
                  y={dangerZone}
                  stroke="#FF5757"
                  strokeDasharray="5 5"
                  label={{
                    value: "Danger Zone",
                    position: "right",
                    fill: "#FF5757",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cashIn"
                  stroke="#0ACF83"
                  strokeWidth={2}
                  name="Cash In"
                  dot={{ fill: "#0ACF83", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="cashOut"
                  stroke="#FF5757"
                  strokeWidth={2}
                  name="Cash Out"
                  dot={{ fill: "#FF5757", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="runningBalance"
                  stroke="#1AC6C6"
                  strokeWidth={3}
                  name="Running Balance"
                  dot={{ fill: "#1AC6C6", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table Section */}
          <div className="table-section">
            <h3 className="table-title">Detailed Cash Flow</h3>
            <div className="table-wrapper">
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Cash In</th>
                    <th>Cash Out</th>
                    <th>Net Flow</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row, index) => (
                    <tr
                      key={index}
                      className={
                        row.isDanger
                          ? "row-danger"
                          : row.isWarning
                          ? "row-warning"
                          : ""
                      }
                    >
                      <td>{row.date}</td>
                      <td>{row.description}</td>
                      <td className="cash-in">
                        {row.cashIn.toLocaleString()} SAR
                      </td>
                      <td className="cash-out">
                        {row.cashOut.toLocaleString()} SAR
                      </td>
                      <td
                        className={
                          row.netCashFlow >= 0 ? "positive" : "negative"
                        }
                      >
                        {row.netCashFlow.toLocaleString()} SAR
                      </td>
                      <td className={row.isDanger ? "danger-value" : ""}>
                        {row.runningBalance.toLocaleString()} SAR
                      </td>
                      <td>
                        {row.isDanger ? (
                          <span className="status-badge danger">
                            🚨 Danger
                          </span>
                        ) : row.isWarning ? (
                          <span className="status-badge warning">
                            ⚠️ Warning
                          </span>
                        ) : (
                          <span className="status-badge safe">✅ Safe</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
