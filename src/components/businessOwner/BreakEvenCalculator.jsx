import React, { useState, useEffect } from "react";
import "./BreakEvenCalculator.css";

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

  return {
    breakEvenUnits,
    breakEvenSales,
    cmPerUnit,
    pricePerUnit: p,
    variableCostPerUnit: v,
    fixedCost: f,
  };
}

function buildBreakEvenSummary(result, productName) {
  if (!result || result.error) return null;

  const {
    breakEvenUnits,
    breakEvenSales,
    cmPerUnit,
    pricePerUnit,
    variableCostPerUnit,
  } = result;

  const cmRatio =
    pricePerUnit && pricePerUnit > 0
      ? ((pricePerUnit - variableCostPerUnit) / pricePerUnit) * 100
      : null;

  return {
    productName: productName || null,
    breakEvenUnits,
    breakEvenSales,
    contributionMarginPerUnit: cmPerUnit,
    contributionMarginRatio: cmRatio,
  };
}

export default function BreakEvenCalculator({ baseData, onUpdate }) {
  const [mode, setMode] = useState("readOnly");
  const [selectedProductId, setSelectedProductId] = useState(
    baseData?.products?.[0]?._id ?? null
  );

  const [whatIfByProduct, setWhatIfByProduct] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!baseData || !baseData.products) return;

    const initial = {};
    baseData.products.forEach((p) => {
      const key = p._id || p.id;
      initial[key] = {
        fixedCost: p.fixedCost ?? baseData.fixedCost ?? "",
        variableCostPerUnit: p.variableCostPerUnit ?? "",
        pricePerUnit: p.pricePerUnit ?? "",
      };
    });

    setWhatIfByProduct(initial);
    setSelectedProductId(baseData.products[0]?._id || baseData.products[0]?.id);
    setResult(null);
    if (onUpdate) onUpdate(null);
  }, [baseData, onUpdate]);

  const selectedProduct =
    baseData?.products?.find(
      (p) => (p._id || p.id) === selectedProductId
    ) || null;

  const baseValues = selectedProduct
    ? {
        fixedCost: selectedProduct.fixedCost ?? baseData.fixedCost ?? "",
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
    if (onUpdate) onUpdate(null);
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
      if (onUpdate) onUpdate(null);
      return;
    }

    const inputs = mode === "readOnly" ? baseValues : currentWhatIf;
    const calc = calcBreakEven(inputs);
    setResult(calc);

    if (onUpdate) {
      const summary = buildBreakEvenSummary(calc, selectedProduct.name);
      onUpdate(summary);
    }
  }
    async function saveScenario() {
        if (!result || result.error || !selectedProduct) return;

        const user = JSON.parse(localStorage.getItem("loggedUser"));

        const scenario = {
            ownerId: user.userId,
            productName: selectedProduct.name,
            fixedCost: result.fixedCost,
            variableCostPerUnit: result.variableCostPerUnit,
            pricePerUnit: result.pricePerUnit,
            breakEvenUnits: result.breakEvenUnits,
            breakEvenSales: result.breakEvenSales,
            cmPerUnit: result.cmPerUnit,
            createdAt: new Date()
        };

        try {
            const res = await fetch("http://localhost:5001/api/break-even-scenarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                ownerId: user.userId,
                scenario
            })
            });

            const data = await res.json();
            if (!data.success) throw new Error();

            alert("Scenario saved successfully!");
        } catch (err) {
            alert("Failed to save scenario.");
        }
    }


  return (
    <div className="bep-page">
      <div className="bep-card">
        <div className="bep-header">
          <div className="bep-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h2 className="bep-title">Break-Even Point Calculator</h2>
        </div>

        {baseData?.products?.length > 0 ? (
          <div className="bep-field">
            <label className="bep-label">Select Product</label>
            <select
              className="bep-select"
              value={selectedProductId || ""}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              {baseData.products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
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

        <div className="bep-toggle-wrapper">
          <div className="bep-toggle">
            <button
              type="button"
              className={`bep-toggle-btn ${
                mode === "readOnly" ? "bep-toggle-btn--active" : ""
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
              className={`bep-toggle-btn ${
                mode === "whatIf" ? "bep-toggle-btn--active" : ""
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

        <p className="bep-helper-text">
          {mode === "readOnly"
            ? "Using data from your uploaded sheet"
            : "Adjust values to simulate different scenarios"}
        </p>

        <form className="bep-form" onSubmit={handleCalculate}>
          <div className="bep-field">
            <label className="bep-label">Fixed Cost (SAR)</label>
            <input
              type="number"
              name="fixedCost"
              value={activeValues.fixedCost ?? ""}
              onChange={mode === "whatIf" ? handleInputChange : undefined}
              disabled={mode === "readOnly"}
              className="bep-input"
            />
          </div>

          <div className="bep-field">
            <label className="bep-label">Variable Cost Per Unit (SAR)</label>
            <input
              type="number"
              name="variableCostPerUnit"
              value={activeValues.variableCostPerUnit ?? ""}
              onChange={mode === "whatIf" ? handleInputChange : undefined}
              disabled={mode === "readOnly"}
              className="bep-input"
              step="0.01"
            />
          </div>

          <div className="bep-field">
            <label className="bep-label">Price Per Unit (SAR)</label>
            <input
              type="number"
              name="pricePerUnit"
              value={activeValues.pricePerUnit ?? ""}
              onChange={mode === "whatIf" ? handleInputChange : undefined}
              disabled={mode === "readOnly"}
              className="bep-input"
              step="0.01"
            />
          </div>

          <button type="submit" className="bep-submit-btn">
            Calculate Break-Even Point
          </button>
        </form>

        {result && (
          <div className="bep-result">
            {result.error ? (
              <div className="bep-error">
                <p>{result.error}</p>
              </div>
            ) : (
              <>
                <div className="bep-result-header">
                  <p className="bep-result-main">
                    For <strong>{selectedProduct?.name}</strong>, you need to
                    sell{" "}
                    <span className="bep-highlight">
                      {result.breakEvenUnits.toLocaleString()}
                    </span>{" "}
                    units to break even
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
                {mode === "whatIf" && (
                    <button
                        onClick={saveScenario}
                        className="bep-submit-btn"
                        style={{ marginTop: "20px" }}
                    >
                        Save Scenario
                    </button>
                )}

              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
