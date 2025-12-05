import React, { useEffect, useState } from "react";
import "./ScenarioComparison.css";

export default function ScenarioComparison({ username }) {
    const [scenarios, setScenarios] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadScenarios() {
            try {
                const res = await fetch(
                    `http://localhost:5001/api/pricing-scenarios/${username}`
                );
                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.message || "Failed to load scenarios");
                }
                setScenarios(data.scenarios || []);
            } catch (err) {
                console.error("Error fetching scenarios:", err);
                setError("Could not load scenarios.");
            } finally {
                setLoading(false);
            }
        }

        if (username) {
            loadScenarios();
        } else {
            setError("Missing username.");
            setLoading(false);
        }
    }, [username]);

    function toggleSelection(id) {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((x) => x !== id);
            }
            if (prev.length >= 2) {
                return prev;
            }
            return [...prev, id];
        });
    }

    const selectedScenarios = selectedIds
        .map((id) => scenarios.find((s) => s._id === id))
        .filter(Boolean);

    // ---------- METRICS HELPERS ----------
    function buildMetrics(scenario) {
        const price = Number(scenario.newPrice ?? 0);
        const variableCost = Number(scenario.variableCost ?? 0);
        const fixedCostPerUnit = Number(scenario.fixedCostPerUnit ?? 0);
        const profitPerUnit = Number(scenario.profitPerUnit ?? 0);
        const profitMargin = Number(scenario.profitMargin ?? 0);
        const totalProfit = Number(scenario.totalProfit ?? 0);
        const totalRevenue = Number(scenario.totalRevenue ?? 0);

        return {
            price,
            variableCost,
            fixedCostPerUnit,
            profitPerUnit,
            profitMargin,
            totalProfit,
            totalRevenue,
        };
    }

    function classifyMargin(margin) {
        if (margin < 0) return { label: "Loss-making", risk: "critical" };
        if (margin < 10) return { label: "Dangerously thin", risk: "high" };
        if (margin < 15) return { label: "Low safety", risk: "elevated" };
        if (margin < 30) return { label: "Healthy", risk: "normal" };
        if (margin < 40) return { label: "Strong", risk: "low" };
        return { label: "Excellent", risk: "very-low" };
    }

    function runStressTest(metrics) {
        const { price, variableCost, fixedCostPerUnit } = metrics;

        function marginForCostMultiplier(multiplier) {
            const newVarCost = variableCost * multiplier;
            const profitUnit = price - newVarCost - fixedCostPerUnit;
            const marginPct = price > 0 ? (profitUnit / price) * 100 : 0;
            return marginPct;
        }

        const marginPlus10 = marginForCostMultiplier(1.1);
        const marginPlus20 = marginForCostMultiplier(1.2);

        return { marginPlus10, marginPlus20 };
    }

    // simple 0–1 risk score (0 = safe, 1 = very risky)
    function riskScore(margin, stress) {
        let score = 0;

        // base on margin
        if (margin < 5) score += 0.8;
        else if (margin < 10) score += 0.6;
        else if (margin < 15) score += 0.4;
        else if (margin < 25) score += 0.2;
        else score += 0.1;

        // stress penalty if under stress margin goes near zero or negative
        if (stress.marginPlus20 < 0) score += 0.2;
        else if (stress.marginPlus20 < 5) score += 0.15;
        else if (stress.marginPlus20 < 10) score += 0.1;

        return Math.min(1, score);
    }

    // ---------- REALISTIC RECOMMENDATION ----------
    function recommendScenario(a, b) {
        const A = buildMetrics(a);
        const B = buildMetrics(b);

        const marginA = A.profitMargin;
        const marginB = B.profitMargin;
        const profitA = A.totalProfit;
        const profitB = B.totalProfit;

        const stressA = runStressTest(A);
        const stressB = runStressTest(B);

        const riskA = riskScore(marginA, stressA);
        const riskB = riskScore(marginB, stressB);

        const explanations = [];

        // profit diff in %
        const profitDiffPercent =
            ((profitA - profitB) / (Math.max(profitA, profitB) || 1)) * 100;
        const absProfitDiffPercent = Math.abs(profitDiffPercent);

        // 1) Extremely bad margin
        if (marginA < 5 && marginB >= 10) {
            explanations.push(
                "Scenario A has an extremely thin margin (<5%), which is very risky. Scenario B has safer margins."
            );
            return {
                best: b,
                other: a,
                reasoning: {
                    basis: "margin_safety",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        }
        if (marginB < 5 && marginA >= 10) {
            explanations.push(
                "Scenario B has an extremely thin margin (<5%), which is very risky. Scenario A has safer margins."
            );
            return {
                best: a,
                other: b,
                reasoning: {
                    basis: "margin_safety",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        }

        // 2) One has clearly safer margin band & profit not dramatically worse
        if (
            marginA >= 15 &&
            marginB < 15 &&
            profitDiffPercent <= 30 // A's profit <=30% higher than B
        ) {
            explanations.push(
                "Scenario A sits in a healthier margin band, while Scenario B stays in a riskier low-margin zone. The profit gap is not large enough to justify taking that extra risk."
            );
            return {
                best: a,
                other: b,
                reasoning: {
                    basis: "margin_vs_profit",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    profitDiffPercent,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        }
        if (
            marginB >= 15 &&
            marginA < 15 &&
            -profitDiffPercent <= 30 // B's profit <=30% higher than A
        ) {
            explanations.push(
                "Scenario B sits in a healthier margin band, while Scenario A stays in a riskier low-margin zone. The profit gap is not large enough to justify taking that extra risk."
            );
            return {
                best: b,
                other: a,
                reasoning: {
                    basis: "margin_vs_profit",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    profitDiffPercent,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        }

        // 3) Stress-test survival
        const survivesA20 = stressA.marginPlus20 > 5;
        const survivesB20 = stressB.marginPlus20 > 5;

        if (survivesA20 && !survivesB20) {
            explanations.push(
                "Under a 20% increase in variable costs, Scenario A still keeps a positive margin, while Scenario B almost loses profitability."
            );
            return {
                best: a,
                other: b,
                reasoning: {
                    basis: "stress_test",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        }
        if (survivesB20 && !survivesA20) {
            explanations.push(
                "Under a 20% increase in variable costs, Scenario B still keeps a positive margin, while Scenario A almost loses profitability."
            );
            return {
                best: b,
                other: a,
                reasoning: {
                    basis: "stress_test",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        }

        // 4) If profits are very close, prefer healthier margin
        if (absProfitDiffPercent < 10) {
            if (marginA > marginB) {
                explanations.push(
                    "Total profits are very close between both scenarios, so the model prefers Scenario A because its margins are healthier."
                );
                return {
                    best: a,
                    other: b,
                    reasoning: {
                        basis: "close_profit_margin_pref",
                        marginA,
                        marginB,
                        profitA,
                        profitB,
                        stressA,
                        stressB,
                        riskA,
                        riskB,
                        explanations,
                    },
                };
            }
            if (marginB > marginA) {
                explanations.push(
                    "Total profits are very close between both scenarios, so the model prefers Scenario B because its margins are healthier."
                );
                return {
                    best: b,
                    other: a,
                    reasoning: {
                        basis: "close_profit_margin_pref",
                        marginA,
                        marginB,
                        profitA,
                        profitB,
                        stressA,
                        stressB,
                        riskA,
                        riskB,
                        explanations,
                    },
                };
            }
        }

        // 5) Fallback: higher profit, with note
        if (profitA >= profitB) {
            explanations.push(
                "Scenario A delivers higher total profit, and its margin and stress behavior are not significantly worse than Scenario B, so the extra profit is considered worth it."
            );
            return {
                best: a,
                other: b,
                reasoning: {
                    basis: "higher_profit_fallback",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        } else {
            explanations.push(
                "Scenario B delivers higher total profit, and its margin and stress behavior are not significantly worse than Scenario A, so the extra profit is considered worth it."
            );
            return {
                best: b,
                other: a,
                reasoning: {
                    basis: "higher_profit_fallback",
                    marginA,
                    marginB,
                    profitA,
                    profitB,
                    stressA,
                    stressB,
                    riskA,
                    riskB,
                    explanations,
                },
            };
        }
    }

    let recommendation = null;
    if (selectedScenarios.length === 2) {
        const [a, b] = selectedScenarios;
        recommendation = recommendScenario(a, b);
    }

    if (loading) {
        return (
            <div className="scenario-wrapper">
                <h2 className="scenario-title">Pricing Scenarios</h2>
                <p>Loading scenarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="scenario-wrapper">
                <h2 className="scenario-title">Pricing Scenarios</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="scenario-wrapper">
            <h2 className="scenario-title">Pricing Scenarios</h2>

            {scenarios.length === 0 && (
                <p>
                    No scenarios saved yet. Go to the Pricing Simulator, run a
                    What-If analysis and click <strong>Save Scenario</strong>.
                </p>
            )}

            {/* LIST OF SCENARIOS */}
            <div className="scenario-list">
                {scenarios.map((s) => {
                    const isSelected = selectedIds.includes(s._id);
                    const m = buildMetrics(s);
                    const marginClass = classifyMargin(m.profitMargin);
                    const stress = runStressTest(m);
                    const risk = riskScore(m.profitMargin, stress);

                    return (
                        <div
                            key={s._id}
                            className={
                                "scenario-card" + (isSelected ? " selected" : "")
                            }
                            onClick={() => toggleSelection(s._id)}
                        >
                            <div className="scenario-card-header">
                                <div className="scenario-product">
                                    {s.productName} —{" "}
                                    {m.price.toFixed(2)} SAR
                                </div>
                                <div className="scenario-tags">
                                    <span className="tag">
                                        {marginClass.label}
                                    </span>
                                    {m.totalProfit > 0 && (
                                        <span className="tag tag--profit">
                                            Profitable
                                        </span>
                                    )}
                                    {m.profitMargin > 25 && (
                                        <span className="tag tag--strong">
                                            High Margin
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="scenario-details">
                                <span>
                                    Profit:{" "}
                                    <strong>
                                        {m.totalProfit.toFixed(2)} SAR
                                    </strong>
                                </span>
                                <span>
                                    Margin:{" "}
                                    <strong>
                                        {m.profitMargin.toFixed(1)}%
                                    </strong>{" "}
                                    ({marginClass.label})
                                </span>
                                <span>
                                    Revenue:{" "}
                                    <strong>
                                        {m.totalRevenue.toFixed(2)} SAR
                                    </strong>
                                </span>
                                {s.timestamp && (
                                    <span>
                                        Saved at:{" "}
                                        {new Date(
                                            s.timestamp
                                        ).toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <div className="risk-meter">
                                <div className="risk-meter-label">
                                    Risk level
                                </div>
                                <div className="risk-meter-bar">
                                    <div
                                        className={
                                            "risk-meter-fill " +
                                            (risk > 0.7
                                                ? "risk-meter-fill--high"
                                                : risk > 0.4
                                                ? "risk-meter-fill--medium"
                                                : "risk-meter-fill--low")
                                        }
                                        style={{ width: `${risk * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SIDE-BY-SIDE BOXES */}
            {selectedScenarios.length === 2 && (
                <div className="comparison-grid">
                    {selectedScenarios.map((s) => {
                        const m = buildMetrics(s);
                        const marginClass = classifyMargin(m.profitMargin);
                        const stress = runStressTest(m);

                        return (
                            <div key={s._id} className="comparison-box">
                                <div className="comparison-title">
                                    {s.productName} @{" "}
                                    {m.price.toFixed(2)} SAR
                                </div>
                                <div className="metric">
                                    <span>Profit</span>
                                    <strong>
                                        {m.totalProfit.toFixed(2)} SAR
                                    </strong>
                                </div>
                                <div className="metric">
                                    <span>Margin</span>
                                    <strong>
                                        {m.profitMargin.toFixed(1)}% (
                                        {marginClass.label})
                                    </strong>
                                </div>
                                <div className="metric">
                                    <span>Revenue</span>
                                    <strong>
                                        {m.totalRevenue.toFixed(2)} SAR
                                    </strong>
                                </div>
                                <div className="metric">
                                    <span>Margin (+10% cost)</span>
                                    <strong>
                                        {stress.marginPlus10.toFixed(1)}%
                                    </strong>
                                </div>
                                <div className="metric">
                                    <span>Margin (+20% cost)</span>
                                    <strong>
                                        {stress.marginPlus20.toFixed(1)}%
                                    </strong>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* RECOMMENDATION */}
            {recommendation && (
                <div className="recommendation-box">
                    <h3 className="recommendation-title">
                        Recommended Scenario
                    </h3>

                    <p>
                        Based on margin safety, cost stress and total profit,
                        the model recommends:
                    </p>

                    <p>
                        <strong>
                            {recommendation.best.productName} at{" "}
                            {Number(
                                recommendation.best.newPrice
                            ).toFixed(2)}{" "}
                            SAR
                        </strong>
                    </p>

                    <p>
                        This choice is made on a logical basis, not just by
                        picking the highest profit. Key reasons:
                    </p>

                    <ul className="recommendation-list">
                        {recommendation.reasoning.explanations.map(
                            (text, idx) => (
                                <li key={idx}>{text}</li>
                            )
                        )}
                    </ul>

                    <p className="recommendation-footnote">
                        When profit differences are small, the model prefers
                        healthier margins and better resilience to cost
                        increases. Only when margin and risk are similar does it
                        fall back to the scenario with higher total profit.
                    </p>
                </div>
            )}
        </div>
    );
}