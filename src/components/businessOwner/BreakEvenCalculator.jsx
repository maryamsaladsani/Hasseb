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

    // Contribution Margin (CM) = money left per unit after covering variable cost (to cover fixed cost and gain profits)
    // Contribution Margin (CM) = price per unit - variable cost
    const cmPerUnit = p - v;
    if (cmPerUnit <= 0) {
        return {
            error:
                "Your business is not an nonprofit organization :) Price per unit must be greater than variable cost per unit to reach break-even.",
        };
    }

    // Units = Fixed Cost ÷ Contribution Margin
    const rawUnits = f / cmPerUnit;

    // How many to sale?
    const breakEvenUnits = Math.ceil(rawUnits);

    // By how much?
    const breakEvenSales = breakEvenUnits * p;

    return { breakEvenUnits, breakEvenSales, cmPerUnit};
}


export default function BreakEvenCalculator({ baseData }) {

    // mode: ["readOnly" (from Excel)] or ["whatIf" (user edits)]
    const [mode, setMode] = useState("readOnly");

    // which product is selected
    const [selectedProductId, setSelectedProductId] = useState(
        baseData?.products?.[0]?.id ?? null
    );


    // what-if values per product
    const [whatIfByProduct, setWhatIfByProduct] = useState({});

    // when baseData arrives, initialise what-if data for each product
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

    // values from Excel for the selected product
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

    const [result, setResult] = useState(null);

    function handleProductChange(id) {
        setSelectedProductId(id);
        setResult(null); // clear old result when switching products
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
        <div>
            <div className="bep-card">
                <h2 className="bep-title">BEP Calculator</h2>

                {/* ===== Product selection (radio) ===== */}
                {baseData?.products?.length > 0 ? (
                    <div className="bep-products">
                        <span className="bep-label">Choose product</span>

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
                    <p className="bep-helper-text">
                        No products found. Please upload your pricing sheet.
                    </p>
                )}
                {/* ===== Mode toggle ===== */}
                <div className="bep-toggle-wrapper">
                    <div className="bep-toggle">
                        <button
                            type="button"
                            className={
                                mode === "readOnly"
                                    ? "bep-toggle-btn bep-toggle-btn--active"
                                    : "bep-toggle-btn"
                            }
                            onClick={() => setMode("readOnly")}
                        >
                            From Data
                        </button>
                        <button
                            type="button"
                            className={
                                mode === "whatIf"
                                    ? "bep-toggle-btn bep-toggle-btn--active"
                                    : "bep-toggle-btn"
                            }
                            onClick={() => setMode("whatIf")}
                        >
                            What-if
                        </button>
                    </div>
                </div>

                {mode === "readOnly" && (
                    <p className="bep-helper-text">
                        Using prices and costs from your uploaded sheet. Fields are read-only.
                    </p>
                )}
                {mode === "whatIf" && (
                    <p className="bep-helper-text">
                        Change the numbers to simulate this product’s break-even.
                    </p>
                )}

                {/* ===== Form ===== */}
                <form className="bep-form" onSubmit={handleCalculate}>
                    <label className="bep-field">
                        <span className="bep-label">Fixed Cost</span>
                        <input
                            type="number"
                            name="fixedCost"
                            value={activeValues.fixedCost ?? ""}
                            onChange={mode === "whatIf" ? handleInputChange : undefined}
                            disabled={mode === "readOnly"}
                            className="bep-input"
                            placeholder="e.g. 25000"
                        />
                    </label>

                    <label className="bep-field">
                        <span className="bep-label">Variable Cost Per Unit</span>
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
                    </label>

                    <label className="bep-field">
                        <span className="bep-label">Price Per Unit</span>
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
                    </label>

                    <button type="submit" className="bep-submit-btn">
                        Calculate
                    </button>
                </form>

                {/* ===== Results ===== */}
                {result && (
                    <div className="bep-result">
                        {result.error ? (
                            <p className="bep-error">{result.error}</p>
                        ) : (
                            <>
                                <p className="bep-result-main">
                                    For <strong>{selectedProduct?.name}</strong>, you need to sell{" "}
                                    <strong>{result.breakEvenUnits.toLocaleString()}</strong> units
                                    to cover your costs.
                                </p>
                                <p className="bep-result-sub">
                                    Break-even sales:{" "}
                                    <strong>{result.breakEvenSales.toLocaleString()}</strong> SAR
                                </p>
                                <p className="bep-result-sub">
                                    Contribution per unit:{" "}
                                    <strong>{result.cmPerUnit.toFixed(2)}</strong> SAR
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}