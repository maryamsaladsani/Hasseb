// PricingSimulator.jsx
import React, { useState, useEffect } from "react";
import "./PricingSimulator.css";

// --- Core calculator logic ---
function calcPricing({ fixedCost, variableCostPerUnit, pricePerUnit, newPrice }) {
    const f = Number(fixedCost);
    const v = Number(variableCostPerUnit);
    const currentP = Number(pricePerUnit);
    const newP = Number(newPrice);

    if ([f, v, currentP, newP].some((x) => Number.isNaN(x))) {
        return { error: "Please provide valid numeric values." };
    }

    if (newP <= v) {
        return {
            error: "Price must be greater than variable cost per unit.",
        };
    }

    // Calculate break-even units for fixed cost allocation
    const currentContributionMargin = currentP - v;
    if (currentContributionMargin <= 0) {
        return { error: "Current price must be greater than variable cost." };
    }

    const breakEvenUnits = Math.ceil(f / currentContributionMargin);
    const fixedCostPerUnit = f / breakEvenUnits;

    // Current metrics
    const currentProfitPerUnit = currentContributionMargin - fixedCostPerUnit;
    const currentRevenue = currentP * breakEvenUnits;
    const currentTotalProfit = currentProfitPerUnit * breakEvenUnits;
    const currentProfitMargin = ((currentP - v - fixedCostPerUnit) / currentP) * 100;

    // New price metrics
    const newContributionMargin = newP - v;
    const newProfitPerUnit = newContributionMargin - fixedCostPerUnit;
    const newRevenue = newP * breakEvenUnits;
    const newTotalProfit = newProfitPerUnit * breakEvenUnits;
    const newProfitMargin = ((newP - v - fixedCostPerUnit) / newP) * 100;

    // Differences
    const revenueDifference = newRevenue - currentRevenue;
    const profitDifference = newTotalProfit - currentTotalProfit;
    const profitPerUnitDifference = newProfitPerUnit - currentProfitPerUnit;

    // Optimal price (50% markup on total cost)
    const totalCostPerUnit = v + fixedCostPerUnit;
    const optimalPrice = totalCostPerUnit * 1.5;

    return {
        breakEvenUnits,
        fixedCostPerUnit,
        current: {
            price: currentP,
            revenue: currentRevenue,
            profitPerUnit: currentProfitPerUnit,
            totalProfit: currentTotalProfit,
            profitMargin: currentProfitMargin,
        },
        new: {
            price: newP,
            revenue: newRevenue,
            profitPerUnit: newProfitPerUnit,
            totalProfit: newTotalProfit,
            profitMargin: newProfitMargin,
        },
        differences: {
            revenue: revenueDifference,
            profit: profitDifference,
            profitPerUnit: profitPerUnitDifference,
        },
        optimalPrice,
    };
}

// --- Build summary for dashboard ---
function buildPricingSummary(result, productName) {
    if (!result || result.error) return null;

    const { current, new: newMetrics, optimalPrice, breakEvenUnits, fixedCostPerUnit } = result;

    return {
        productName: productName || null,
        currentPrice: current.price,
        currentMarginPercent: current.profitMargin,
        newPrice: newMetrics.price,
        newMarginPercent: newMetrics.profitMargin,
        optimalPrice,
        breakEvenUnits,
        fixedCostPerUnit,
        profitDelta: result.differences.profit,
        revenueDelta: result.differences.revenue,
    };
}

export default function PricingSimulator({ baseData, onUpdate }) {
    const [mode, setMode] = useState("readOnly");
    const [selectedProductId, setSelectedProductId] = useState(
        baseData?.products?.[0]?.id ?? null
    );
    const [sliderValue, setSliderValue] = useState(0);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!baseData || !baseData.products) return;
        setSelectedProductId(baseData.products[0]?.id ?? null);
        setResult(null);
        if (onUpdate) onUpdate(null);
    }, [baseData, onUpdate]);

    const selectedProduct =
        baseData?.products?.find((p) => p.id === selectedProductId) || null;

    const baseValues = selectedProduct
        ? {
              fixedCost: baseData.fixedCost ?? "",
              variableCostPerUnit: selectedProduct.variableCostPerUnit ?? "",
              pricePerUnit: selectedProduct.pricePerUnit ?? "",
          }
        : {};

    // Initialize slider to current price
    useEffect(() => {
        if (selectedProduct && mode === "whatIf") {
            setSliderValue(Number(selectedProduct.pricePerUnit));
        }
    }, [selectedProduct, mode]);

    // Calculate optimal price in "From Data" mode
    useEffect(() => {
        if (mode === "readOnly" && selectedProduct && baseValues.fixedCost) {
            const optimal = calcPricing({
                fixedCost: baseValues.fixedCost,
                variableCostPerUnit: baseValues.variableCostPerUnit,
                pricePerUnit: baseValues.pricePerUnit,
                newPrice: baseValues.pricePerUnit,
            });
            setResult(optimal);

            if (onUpdate) {
                const summary = buildPricingSummary(optimal, selectedProduct.name);
                onUpdate(summary);
            }
        }
    }, [mode, selectedProduct, baseValues.fixedCost, baseValues.variableCostPerUnit, baseValues.pricePerUnit, onUpdate]);

    function handleProductChange(id) {
        setSelectedProductId(id);
        setResult(null);
        if (onUpdate) onUpdate(null);
    }

    function handleSliderChange(e) {
        const newPrice = Number(e.target.value);
        setSliderValue(newPrice);

        if (!selectedProduct) return;

        const calculated = calcPricing({
            fixedCost: baseValues.fixedCost,
            variableCostPerUnit: baseValues.variableCostPerUnit,
            pricePerUnit: baseValues.pricePerUnit,
            newPrice: newPrice,
        });

        setResult(calculated);

        if (onUpdate) {
            const summary = buildPricingSummary(calculated, selectedProduct.name);
            onUpdate(summary);
        }
    }

    const minPrice = selectedProduct
        ? Math.floor(Number(selectedProduct.variableCostPerUnit))
        : 0;
    const maxPrice = selectedProduct
        ? Math.ceil(Number(selectedProduct.pricePerUnit) * 3)
        : 100;

    return (
        <div className="pricing-card">
            {/* Header */}
            <div className="pricing-header">
                <div className="pricing-icon-wrapper">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <h2 className="pricing-title">Pricing Simulator</h2>
            </div>

            {/* Product selection */}
            {baseData?.products?.length > 0 ? (
                <div className="pricing-field">
                    <label className="pricing-label">Select Product</label>
                    <select
                        className="pricing-select"
                        value={selectedProductId || ""}
                        onChange={(e) => handleProductChange(e.target.value)}
                    >
                        {baseData.products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="pricing-empty-state">
                    <p>No products found. Please upload your pricing sheet.</p>
                </div>
            )}

            {/* Mode toggle */}
            <div className="pricing-toggle-wrapper">
                <div className="pricing-toggle">
                    <button
                        type="button"
                        className={`pricing-toggle-btn ${
                            mode === "readOnly" ? "pricing-toggle-btn--active" : ""
                        }`}
                        onClick={() => {
                            setMode("readOnly");
                            setResult(null);
                            if (onUpdate) onUpdate(null);
                        }}
                    >
                        From Data
                    </button>
                    <button
                        type="button"
                        className={`pricing-toggle-btn ${
                            mode === "whatIf" ? "pricing-toggle-btn--active" : ""
                        }`}
                        onClick={() => {
                            setMode("whatIf");
                            setResult(null);
                            if (onUpdate) onUpdate(null);
                        }}
                    >
                        What-If Analysis
                    </button>
                </div>
            </div>

            <p className="pricing-helper-text">
                {mode === "readOnly" ? (
                    <>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ verticalAlign: "middle", marginRight: "4px" }}
                        >
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                        </svg>
                        Showing current pricing and optimal recommendation
                    </>
                ) : (
                    "Adjust price to see impact on revenue and profit"
                )}
            </p>

            {/* From Data Mode - Show Optimal Price */}
            {mode === "readOnly" && selectedProduct && result && !result.error && (
                <div className="pricing-optimal-card">
                    <div className="optimal-header">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h3>Optimal Price Recommendation</h3>
                    </div>

                    <div className="optimal-price-display">
                        <span className="optimal-label">Recommended Price</span>
                        <span className="optimal-value">
                            {result.optimalPrice.toFixed(2)} SAR/unit
                        </span>
                    </div>

                    {/* Projected metrics at optimal price */}
                    <div className="optimal-projections">
                        <h4 className="projections-title">If You Follow This Price:</h4>
                        <div className="projections-grid">
                            <div className="projection-item">
                                <span className="projection-label">Profit Per Unit</span>
                                <span className="projection-value optimal-highlight">
                                    {(
                                        result.optimalPrice -
                                        baseValues.variableCostPerUnit -
                                        result.fixedCostPerUnit
                                    ).toFixed(2)}{" "}
                                    SAR
                                </span>
                            </div>
                            <div className="projection-item">
                                <span className="projection-label">Profit Margin</span>
                                <span className="projection-value optimal-highlight">
                                    {(
                                        ((result.optimalPrice -
                                            baseValues.variableCostPerUnit -
                                            result.fixedCostPerUnit) /
                                            result.optimalPrice) *
                                        100
                                    ).toFixed(1)}
                                    %
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Current pricing comparison */}
                    <h4 className="comparison-title">Your Current Pricing:</h4>
                    <div className="optimal-comparison">
                        <div className="comparison-item">
                            <span className="comparison-label">Current Price</span>
                            <span className="comparison-value">
                                {result.current.price.toFixed(2)} SAR
                            </span>
                        </div>
                        <div className="comparison-item">
                            <span className="comparison-label">Current Profit/Unit</span>
                            <span className="comparison-value">
                                {result.current.profitPerUnit.toFixed(2)} SAR
                            </span>
                        </div>
                        <div className="comparison-item">
                            <span className="comparison-label">Current Margin</span>
                            <span className="comparison-value">
                                {result.current.profitMargin.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    <p className="optimal-note">
                        Based on your cost structure. Fixed costs allocated across{" "}
                        {result.breakEvenUnits.toLocaleString()} units.
                    </p>
                </div>
            )}

            {/* What-If Mode - Price Slider */}
            {mode === "whatIf" && selectedProduct && (
                <>
                    <div className="pricing-slider-section">
                        <div className="slider-header">
                            <label className="pricing-label">Adjust Selling Price</label>
                            <span className="slider-value">{sliderValue.toFixed(2)} SAR</span>
                        </div>

                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            step="0.5"
                            value={sliderValue}
                            onChange={handleSliderChange}
                            className="pricing-slider"
                        />

                        <div className="slider-labels">
                            <span className="slider-label-min">Min: {minPrice} SAR</span>
                            <span className="slider-label-max">Max: {maxPrice} SAR</span>
                        </div>
                    </div>

                    {/* Results */}
                    {result && !result.error && (
                        <div className="pricing-results">
                            <div className="results-grid">
                                <div className="result-card">
                                    <span className="result-label">Profit Per Unit</span>
                                    <span className="result-value">
                                        {result.new.profitPerUnit.toFixed(2)} SAR
                                    </span>
                                    <span
                                        className={`result-change ${
                                            result.differences.profitPerUnit >= 0
                                                ? "positive"
                                                : "negative"
                                        }`}
                                    >
                                        {result.differences.profitPerUnit >= 0 ? "↑" : "↓"}{" "}
                                        {Math.abs(result.differences.profitPerUnit).toFixed(2)} SAR
                                    </span>
                                </div>

                                <div className="result-card">
                                    <span className="result-label">Profit Margin</span>
                                    <span className="result-value">
                                        {result.new.profitMargin.toFixed(1)}%
                                    </span>
                                    <span
                                        className={`result-change ${
                                            result.new.profitMargin >= result.current.profitMargin
                                                ? "positive"
                                                : "negative"
                                        }`}
                                    >
                                        {result.new.profitMargin >= result.current.profitMargin
                                            ? "↑"
                                            : "↓"}{" "}
                                        {Math.abs(
                                            result.new.profitMargin - result.current.profitMargin
                                        ).toFixed(1)}
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {result && result.error && (
                        <div className="pricing-error">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <p>{result.error}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}