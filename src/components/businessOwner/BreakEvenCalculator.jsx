import React, { useState, useEffect } from "react";
import "./BreakEvenCalculator.css";

// --- Core calculator logic ---
function calcBreakEven({ fixedCost, variableCostPerUnit, pricePerUnit }) {
    const f = Number(fixedCost);
    const v = Number(variableCostPerUnit);
    const p = Number(pricePerUnit);

    if ([f, v, p].some((x) => Number.isNaN(x))) {
        return { error: "Please provide valid numeric values." };
    }

    const cmPerUnit = p - v;
    if (cmPerUnit <= 0) {
        return {
            error:
                "Price per unit must be greater than variable cost per unit to reach break-even.",
        };
    }

    const rawUnits = f / cmPerUnit;
    const breakEvenUnits = Math.ceil(rawUnits);
    const breakEvenSales = breakEvenUnits * p;

    return { breakEvenUnits, breakEvenSales, cmPerUnit };
}

export default function BreakEvenCalculator({ baseData }) {
    const [mode, setMode] = useState("readOnly");
    const [selectedProductId, setSelectedProductId] = useState(
        baseData?.products?.[0]?.id ?? null
    );
    const [whatIfByProduct, setWhatIfByProduct] = useState({});
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!baseData || !baseData.products) return;

        const initial = {};
        baseData.products.forEach((p) => {
            initial[p.id] = {
                fixedCost: baseData.fixedCost ?? "",
                variableCostPerUnit: p.variableCostPerUnit ?? "",
                pricePerUnit: p.pricePerUnit ?? "",
            };
        });
        setWhatIfByProduct(initial);
        setSelectedProductId(baseData.products[0]?.id ?? null);
    }, [baseData]);

    const selectedProduct =
        baseData?.products?.find((p) => p.id === selectedProductId) || null;

    const baseValues = selectedProduct
        ? {
            fixedCost: baseData.fixedCost ?? "",
            variableCostPerUnit: selectedProduct.variableCostPerUnit ?? "",
            pricePerUnit: selectedProduct.pricePerUnit ?? "",
        }
        : {};

    const currentWhatIf =
        (selectedProductId && whatIfByProduct[selectedProductId]) || baseValues;

    const activeValues = mode === "readOnly" ? baseValues : currentWhatIf;

    function handleProductChange(id) {
        setSelectedProductId(id);
        setResult(null);
    }

    function handleInputChange(e) {
        if (!selectedProductId) return;
        const { name, value } = e.target;

        setWhatIfByProduct((prev) => ({
            ...prev,
            [selectedProductId]: {
                ...prev[selectedProductId],
                [name]: value,
            },
        }));
    }

    function handleCalculate(e) {
        e.preventDefault();

        if (!selectedProduct) {
            setResult({ error: "Please select a product first." });
            return;
        }

        const inputs = mode === "readOnly" ? baseValues : currentWhatIf;
        setResult(calcBreakEven(inputs));
    }

    return (
        <div className="bep-page">
            <div className="bep-card">
                {/* Header with icon */}
                <div className="bep-header">
                    <div className="bep-icon-wrapper">
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
                    <h2 className="bep-title">Break-Even Point Calculator</h2>
                </div>

                {/* Product selection */}
                {baseData?.products?.length > 0 ? (
                    <div className="bep-field">
                        <label className="bep-label">Select Product</label>
                        <select
                            className="bep-select"
                            value={selectedProductId}
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
                    <div className="bep-empty-state">
                        <p>No products found. Please upload your pricing sheet.</p>
                    </div>
                )}

                {/* Mode toggle */}
                <div className="bep-toggle-wrapper">
                    <div className="bep-toggle">
                        <button
                            type="button"
                            className={`bep-toggle-btn ${
                                mode === "readOnly" ? "bep-toggle-btn--active" : ""
                            }`}
                            onClick={() => setMode("readOnly")}
                        >
                            From Data
                        </button>
                        <button
                            type="button"
                            className={`bep-toggle-btn ${
                                mode === "whatIf" ? "bep-toggle-btn--active" : ""
                            }`}
                            onClick={() => setMode("whatIf")}
                        >
                            What-If Analysis
                        </button>
                    </div>
                </div>

                <p className="bep-helper-text">
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
                            Using data from your uploaded sheet
                        </>
                    ) : (
                        "Adjust values to simulate different scenarios"
                    )}
                </p>

                {/* Form */}
                <form className="bep-form" onSubmit={handleCalculate}>
                    <div className="bep-field">
                        <label className="bep-label">
                            <span className="bep-label-icon">💰</span>
                            Fixed Cost (SAR)
                        </label>
                        <input
                            type="number"
                            name="fixedCost"
                            value={activeValues.fixedCost ?? ""}
                            onChange={mode === "whatIf" ? handleInputChange : undefined}
                            disabled={mode === "readOnly"}
                            className="bep-input"
                            placeholder="e.g. 25000"
                        />
                    </div>

                    <div className="bep-field">
                        <label className="bep-label">
                            <span className="bep-label-icon">📦</span>
                            Variable Cost Per Unit (SAR)
                        </label>
                        <input
                            type="number"
                            name="variableCostPerUnit"
                            value={activeValues.variableCostPerUnit ?? ""}
                            onChange={mode === "whatIf" ? handleInputChange : undefined}
                            disabled={mode === "readOnly"}
                            className="bep-input"
                            placeholder="e.g. 7.5"
                            step="0.01"
                        />
                    </div>

                    <div className="bep-field">
                        <label className="bep-label">
                            <span className="bep-label-icon">💵</span>
                            Price Per Unit (SAR)
                        </label>
                        <input
                            type="number"
                            name="pricePerUnit"
                            value={activeValues.pricePerUnit ?? ""}
                            onChange={mode === "whatIf" ? handleInputChange : undefined}
                            disabled={mode === "readOnly"}
                            className="bep-input"
                            placeholder="e.g. 12"
                            step="0.01"
                        />
                    </div>

                    <button type="submit" className="bep-submit-btn">
                        Calculate Break-Even Point
                    </button>
                </form>

                {/* Results */}
                {result && (
                    <div className="bep-result">
                        {result.error ? (
                            <div className="bep-error">
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
                        ) : (
                            <>
                                <div className="bep-result-header">
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
                                    <p className="bep-result-main">
                                        For <strong>{selectedProduct?.name}</strong>, you need to
                                        sell{" "}
                                        <span className="bep-highlight">
                                            {result.breakEvenUnits.toLocaleString()} units
                                        </span>{" "}
                                        to break even
                                    </p>
                                </div>

                                <div className="bep-result-grid">
                                    <div className="bep-result-item">
                                        <span className="bep-result-label">Break-Even Sales</span>
                                        <span className="bep-result-value">
                                            {result.breakEvenSales.toLocaleString()} SAR
                                        </span>
                                    </div>
                                    <div className="bep-result-item">
                                        <span className="bep-result-label">
                                            Contribution Margin
                                        </span>
                                        <span className="bep-result-value">
                                            {result.cmPerUnit.toFixed(2)} SAR/unit
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
