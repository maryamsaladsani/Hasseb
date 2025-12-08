import React, { useEffect, useState } from "react";
import "./ScenarioComparison.css";

export default function ScenarioComparison({ ownerId }) {
    const [scenarios, setScenarios] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [advisorRecs, setAdvisorRecs] = useState([]);

    // Load scenarios for this owner
    useEffect(() => {
        async function loadScenarios() {
            try {
                const res = await fetch(
                    `http://localhost:5001/api/pricing-scenarios/${ownerId}`
                );

                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.message || "Failed to load scenarios");
                }

                setScenarios(data.scenarios || []);
            } catch (err) {
                console.error("Error fetching scenarios:", err);
                setError("There are no available scenarios.");
            } finally {
                setLoading(false);
            }
        }

        if (!ownerId) {
            setError("Missing ownerId.");
            setLoading(false);
            return;
        }

        loadScenarios();
    }, [ownerId]);
    useEffect(() => {
        async function loadRecs() {
            try {
                const res = await fetch(
                    `http://localhost:5001/api/advisor/recommendations/owner/${ownerId}`
                );
                const data = await res.json();
                setAdvisorRecs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error loading advisor recommendations:", err);
            }
        }

        if (ownerId) loadRecs();
    }, [ownerId]);


    function toggleSelection(id) {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((x) => x !== id);
            }
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    }

    const selectedScenarios = selectedIds
        .map((id) => scenarios.find((s) => s._id === id))
        .filter(Boolean);

    // ---------- METRICS ----------
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

        function marginFor(multiplier) {
            const newVarCost = variableCost * multiplier;
            const profitUnit = price - newVarCost - fixedCostPerUnit;
            return price > 0 ? (profitUnit / price) * 100 : 0;
        }

        return {
            marginPlus10: marginFor(1.1),
            marginPlus20: marginFor(1.2),
        };
    }

    function riskScore(margin, stress) {
        let score = 0;

        if (margin < 5) score += 0.8;
        else if (margin < 10) score += 0.6;
        else if (margin < 15) score += 0.4;
        else if (margin < 25) score += 0.2;
        else score += 0.1;

        if (stress.marginPlus20 < 0) score += 0.2;
        else if (stress.marginPlus20 < 5) score += 0.15;
        else if (stress.marginPlus20 < 10) score += 0.1;

        return Math.min(1, score);
    }

    // ---------- SCENARIO COMPARISON ----------
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

        const profitDiffPercent =
            ((profitA - profitB) / (Math.max(profitA, profitB) || 1)) * 100;
        const absProfitDiffPercent = Math.abs(profitDiffPercent);

        // bad margin case
        if (marginA < 5 && marginB >= 10) {
            explanations.push(
                "Scenario A has an extremely thin margin, which is very risky. Scenario B is safer."
            );
            return { best: b, other: a, reasoning: { explanations } };
        }

        if (marginB < 5 && marginA >= 10) {
            explanations.push(
                "Scenario B has an extremely thin margin, which is very risky. Scenario A is safer."
            );
            return { best: a, other: b, reasoning: { explanations } };
        }

        // margin vs profit case
        if (marginA >= 15 && marginB < 15 && profitDiffPercent <= 30) {
            explanations.push(
                "Scenario A has healthier margins and the profit difference isn't large enough to justify extra risk."
            );
            return { best: a, other: b, reasoning: { explanations } };
        }

        if (marginB >= 15 && marginA < 15 && -profitDiffPercent <= 30) {
            explanations.push(
                "Scenario B has healthier margins and the profit difference isn't large enough to justify extra risk."
            );
            return { best: b, other: a, reasoning: { explanations } };
        }

        // stress test case
        const survivesA20 = stressA.marginPlus20 > 5;
        const survivesB20 = stressB.marginPlus20 > 5;

        if (survivesA20 && !survivesB20) {
            explanations.push(
                "Scenario A remains profitable under a 20% cost increase while Scenario B does not."
            );
            return { best: a, other: b, reasoning: { explanations } };
        }

        if (survivesB20 && !survivesA20) {
            explanations.push(
                "Scenario B remains profitable under a 20% cost increase while Scenario A does not."
            );
            return { best: b, other: a, reasoning: { explanations } };
        }

        // very close profit
        if (absProfitDiffPercent < 10) {
            if (marginA > marginB) {
                explanations.push(
                    "Profits are close, but Scenario A has healthier margins."
                );
                return { best: a, other: b, reasoning: { explanations } };
            }
            if (marginB > marginA) {
                explanations.push(
                    "Profits are close, but Scenario B has healthier margins."
                );
                return { best: b, other: a, reasoning: { explanations } };
            }
        }

        // fallback: higher profit
        if (profitA >= profitB) {
            explanations.push(
                "Scenario A has higher profit without much higher risk."
            );
            return { best: a, other: b, reasoning: { explanations } };
        }

        explanations.push(
            "Scenario B has higher profit without much higher risk."
        );
        return { best: b, other: a, reasoning: { explanations } };
    }

    let recommendation = null;
    if (selectedScenarios.length === 2) {
        const [a, b] = selectedScenarios;
        recommendation = recommendScenario(a, b);
    }

    // ---------- LOADING UI ----------
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
                <p>No scenarios found. Try saving one in the Pricing Simulator.</p>
            )}

            {/* Scenario cards */}
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
                                    {s.productName} — {m.price.toFixed(2)} SAR
                                </div>

                                <div className="scenario-tags">
                                    <span className="tag">{marginClass.label}</span>
                                    {m.totalProfit > 0 && (
                                        <span className="tag tag--profit">Profitable</span>
                                    )}
                                    {m.profitMargin > 25 && (
                                        <span className="tag tag--strong">High Margin</span>
                                    )}
                                </div>
                            </div>

                            <div className="scenario-details">
                                <span>
                                    Profit:{" "}
                                    <strong>{m.totalProfit.toFixed(2)} SAR</strong>
                                </span>
                                <span>
                                    Margin:{" "}
                                    <strong>{m.profitMargin.toFixed(1)}%</strong> (
                                    {marginClass.label})
                                </span>
                                <span>
                                    Revenue:{" "}
                                    <strong>{m.totalRevenue.toFixed(2)} SAR</strong>
                                </span>
                                <span>
                                    Saved at: {new Date(s.timestamp).toLocaleString()}
                                </span>
                            </div>

                            <div className="risk-meter">
                                <div className="risk-meter-label">Risk level</div>
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
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Comparison grid */}
            {selectedScenarios.length === 2 && (
                <div className="comparison-grid">
                    {selectedScenarios.map((s) => {
                        const m = buildMetrics(s);
                        const marginClass = classifyMargin(m.profitMargin);
                        const stress = runStressTest(m);

                        return (
                            <div key={s._id} className="comparison-box">
                                <div className="comparison-title">
                                    {s.productName} @ {m.price.toFixed(2)} SAR
                                </div>

                                <div className="metric">
                                    <span>Profit</span>
                                    <strong>{m.totalProfit.toFixed(2)} SAR</strong>
                                </div>

                                <div className="metric">
                                    <span>Margin</span>
                                    <strong>
                                        {m.profitMargin.toFixed(1)}% ({marginClass.label})
                                    </strong>
                                </div>

                                <div className="metric">
                                    <span>Revenue</span>
                                    <strong>{m.totalRevenue.toFixed(2)} SAR</strong>
                                </div>

                                <div className="metric">
                                    <span>Margin (+10% cost)</span>
                                    <strong>{stress.marginPlus10.toFixed(1)}%</strong>
                                </div>

                                <div className="metric">
                                    <span>Margin (+20% cost)</span>
                                    <strong>{stress.marginPlus20.toFixed(1)}%</strong>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recommendation */}
            {recommendation && (
                <div className="recommendation-box">
                    <h3 className="recommendation-title">
                        Recommended Scenario
                    </h3>

                    <p>
                        Based on margin safety, stress resilience and total profit,
                        the model recommends:
                    </p>

                    <p>
                        <strong>
                            {recommendation.best.productName} @{" "}
                            {Number(recommendation.best.newPrice).toFixed(2)} SAR
                        </strong>
                    </p>

                    <ul className="recommendation-list">
                        {recommendation.reasoning.explanations.map((text, idx) => (
                            <li key={idx}>{text}</li>
                        ))}
                    </ul>

                    <p className="recommendation-footnote">
                        When profits are close, healthier margins and better stress
                        resistance take priority.
                    </p>
                </div>
            )}
            {advisorRecs.length > 0 && (
                <div className="recommendation-box" style={{ marginTop: "2rem" }}>
                    <h3 className="recommendation-title">Advisor Recommendation</h3>

                    <p style={{ marginBottom: "1rem" }}>
                        Your financial advisor has sent the following recommendation:
                    </p>

                    <div className="advisor-recommendation-text">
                        {advisorRecs[0].text}
                    </div>

                    <p className="recommendation-footnote">
                        Sent on: {new Date(advisorRecs[0].createdAt).toLocaleString()}
                    </p>
                </div>
            )}

        </div>
    );
}