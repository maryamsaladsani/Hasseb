// InsightEngine.js — FIXED FOR MONGODB STRUCTURE

export function generateDashboardInsights(baseData) {
    if (!baseData) return null;

    const contributionMargin = baseData.products || [];
    const cashFlow = baseData.cashFlow || [];
    const pricingSensitivity = baseData.pricingScenarios || [];

    // -----------------------------------------------------
    // BREAK-EVEN INSIGHTS (from products)
    // -----------------------------------------------------
    const bepInsights = [];

    if (Array.isArray(contributionMargin) && contributionMargin.length > 0) {
        contributionMargin.forEach((row) => {
            const cm = Number(row.cm) || 0;                    // CM per unit
            const breakUnits = Number(row.breakEvenUnits) || 0;

            if (cm <= 0) {
                bepInsights.push({
                    product: row.name,
                    issue: true,
                    message: `${row.name} cannot break even because CM is 0 or negative.`
                });
            } else {
                bepInsights.push({
                    product: row.name,
                    issue: false,
                    breakEvenUnits: breakUnits,
                    message: `${row.name} needs ${breakUnits.toLocaleString()} units to break even.`
                });
            }
        });
    }

    // -----------------------------------------------------
    // PRICING INSIGHTS (based on products)
    // -----------------------------------------------------
    const pricingInsights = (contributionMargin || []).map((row) => {
        const price = Number(row.pricePerUnit) || 0;
        const varCost = Number(row.variableCostPerUnit) || 0;
        const margin = price > 0 ? ((price - varCost) / price) * 100 : 0;

        return {
            product: row.name,
            margin,
            opportunity:
                margin < 30
                    ? "Low margin — consider raising price."
                    : margin > 60
                    ? "High margin — premium pricing viable."
                    : "Healthy margin."
        };
    });

    // -----------------------------------------------------
    // CASH FLOW INSIGHTS
    // -----------------------------------------------------
    const cashInsights = computeCashFlowMetrics(cashFlow);

    // -----------------------------------------------------
    // HEALTH SCORE
    // -----------------------------------------------------
    const healthScore =
        (pricingInsights.filter((p) => p.margin > 40).length * 5) +
        (cashInsights.isHealthy ? 60 : 20);

    return {
        bepInsights,
        pricingInsights,
        pricingSensitivity,
        cashInsights,
        healthScore: Math.min(100, healthScore),
        recommendations: buildRecommendations(
            bepInsights,
            pricingInsights,
            cashInsights
        )
    };
}

// -----------------------------------------------------
// CASH FLOW METRICS
// -----------------------------------------------------
function computeCashFlowMetrics(cashFlow = []) {
    if (!Array.isArray(cashFlow) || cashFlow.length === 0) {
        return {
            realBurnRate: 0,
            dangerMonths: 0,
            firstDangerMonth: null,
            isHealthy: true
        };
    }

    let running = Number(cashFlow[0].runningBalance || 0);
    const negatives = [];
    let sumNeg = 0, negCount = 0;

    cashFlow.forEach((row, i) => {
        const net = Number(row.netCashFlow || 0);

        if (i !== 0) running += net;

        if (net < 0) {
            sumNeg += net;
            negCount++;
        }
        if (running < 0) {
            negatives.push(row.date);
        }
    });

    return {
        realBurnRate: negCount ? Math.abs(sumNeg / negCount) : 0,
        dangerMonths: negatives.length,
        firstDangerMonth: negatives[0] || null,
        isHealthy: negatives.length === 0
    };
}

// -----------------------------------------------------
// RECOMMENDATIONS ENGINE
// -----------------------------------------------------
function buildRecommendations(bepInsights, pricingInsights, cashInsights) {
    const recs = [];

    if (cashInsights.dangerMonths > 0) {
        recs.push(
            `Cash may turn negative starting ${cashInsights.firstDangerMonth}.`
        );
    }

    pricingInsights.forEach((p) => {
        if (p.margin < 30) {
            recs.push(`${p.product} has a low margin — consider increasing price.`);
        }
    });

    bepInsights.forEach((b) => {
        if (b.issue) {
            recs.push(`Review cost structure for ${b.product}; cannot break even.`);
        }
    });

    if (recs.length === 0) {
        recs.push("Your business looks healthy. Keep going!");
    }

    return recs;
}
