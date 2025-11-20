export const bepTestData = {
    fixedCost: 25000,
    products: [
        {
            id: "espresso",
            name: "Espresso",
            pricePerUnit: 12,
            variableCostPerUnit: 7.5
        },
        {
            id: "latte",
            name: "Latte",
            pricePerUnit: 16,
            variableCostPerUnit: 9.2
        },
        {
            id: "iced-tea",
            name: "Iced Tea",
            pricePerUnit: 10,
            variableCostPerUnit: 5.3
        }
    ],
    cashFlow: [
        { date: "Jan 2025", description: "Sales Revenue", cashIn: 45000, cashOut: 0, runningBalance: 45000 },
        { date: "Feb 2025", description: "Operating Expenses", cashIn: 38000, cashOut: 42000, runningBalance: 41000 },
        { date: "Mar 2025", description: "Supplier Payment", cashIn: 50000, cashOut: 55000, runningBalance: 36000 },
        { date: "Apr 2025", description: "Sales & Payroll", cashIn: 35000, cashOut: 45000, runningBalance: 26000 },
        { date: "May 2025", description: "Low Season", cashIn: 25000, cashOut: 40000, runningBalance: 11000 },
        { date: "Jun 2025", description: "Critical Month", cashIn: 20000, cashOut: 35000, runningBalance: -4000 },
        { date: "Jul 2025", description: "Recovery", cashIn: 55000, cashOut: 30000, runningBalance: 21000 },
    ]
};