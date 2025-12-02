// backend/src/utils/riskEngine.js

function evaluateOwnerRisk(owner) {
  const alerts = [];
  let score = 0;
  const revenue = Number(owner.revenue);
  const expenses = Number(owner.expenses);
  const profit = Number(owner.profit);
  const cashOnHand = Number(owner.cashOnHand);
  const variableCost = Number(owner.variableCost);
  const pricePerUnit = Number(owner.pricePerUnit);
  const salesVolume = Number(owner.salesVolume);
  const demand = Number(owner.demand);
  const fixedCosts = Number(owner.fixedCosts);

  /* ===========================================================
     1) CASH FLOW RISK 
  =========================================================== */
  let cashMonths = 0;
  if (expenses > 0) {
    cashMonths = cashOnHand / (expenses / 30); // days of survival
  }

  if (cashMonths < 15) {
    score += 40;
    alerts.push({
      type: "High",
      msg: `Cash reserves are critically low — enough for only ${cashMonths.toFixed(
        1
      )} days.`,
    });
  } else if (cashMonths < 30) {
    score += 20;
    alerts.push({
      type: "Medium",
      msg: `Cash reserves are low — enough for ${cashMonths.toFixed(
        1
      )} days only.`,
    });
  }

  /* ===========================================================
     2) DEMAND RISK 
  =========================================================== */
  let demandRatio = 1;
  if (salesVolume > 0) {
    demandRatio = demand / salesVolume;
  }

  if (demandRatio < 0.5) {
    score += 25;
    alerts.push({
      type: "High",
      msg: `Demand is very low (${(demandRatio * 100).toFixed(
        0
      )}% of expected sales).`,
    });
  } else if (demandRatio < 0.8) {
    score += 10;
    alerts.push({
      type: "Medium",
      msg: `Demand is below average (${(demandRatio * 100).toFixed(
        0
      )}% of expected sales).`,
    });
  }

  /* ===========================================================
     3) PROFITABILITY RISK 
  =========================================================== */
  let profitMargin = 0;
  if (revenue > 0) {
    profitMargin = profit / revenue;
  }

  if (profitMargin < 0) {
    score += 30;
    alerts.push({
      type: "High",
      msg: `Business is losing money (negative profit).`,
    });
  } else if (profitMargin < 0.1) {
    score += 15;
    alerts.push({
      type: "Medium",
      msg: `Profit margin is low (${(profitMargin * 100).toFixed(1)}%).`,
    });
  }

  /* ===========================================================
     4) BREAK EVEN RISK 
  =========================================================== */
  let breakEvenUnits = 0;
  if (pricePerUnit - variableCost > 0) {
    breakEvenUnits = fixedCosts / (pricePerUnit - variableCost);
  }

  let breakevenRatio = 1;
  if (breakEvenUnits > 0) {
    breakevenRatio = salesVolume / breakEvenUnits;
  }

  if (breakevenRatio < 0.8) {
    score += 25;
    alerts.push({
      type: "High",
      msg: `Sales are far below break-even (${(breakevenRatio * 100).toFixed(
        0
      )}%).`,
    });
  } else if (breakevenRatio < 1.0) {
    score += 10;
    alerts.push({
      type: "Medium",
      msg: `Sales are close to break-even (${(breakevenRatio * 100).toFixed(
        0
      )}%).`,
    });
  }

  /* ===========================================================
     RISK LEVEL RESULT
  =========================================================== */
  let level = "Low";
  if (score >= 60) level = "High";
  else if (score >= 30) level = "Medium";

  return {
    ownerId: owner._id,
    riskScore: score,
    level,
    alerts,
    stats: {
      cashMonths,
      demandRatio,
      profitMargin,
      breakEvenUnits,
      breakevenRatio,
    },
  };
}

module.exports = { evaluateOwnerRisk };
