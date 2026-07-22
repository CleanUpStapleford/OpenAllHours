// ------------------------------------------------------
// Open All Hours POS — dashboard.js
// ------------------------------------------------------
// Loads sales, stock, and regulars, then calculates:
// - Weekly profit
// - Monthly profit
// - Total profit
// - Credit/debit totals
// - Net balance
// - Reorder pot
// - Top sellers
// - Low stock alerts
// ------------------------------------------------------

async function loadJSON(path) {
    const response = await fetch(path);
    return await response.json();
}

let SALES = [];
let STOCK = [];
let REGULARS = [];

document.addEventListener("DOMContentLoaded", async () => {
    SALES = await loadJSON("sales.json");
    STOCK = await loadJSON("stock.json");
    REGULARS = await loadJSON("regulars.json");

    calculateProfit();
    calculateRegularBalances();
    calculateReorderPot();
    generateTopSellers();
    generateLowStockAlerts();

    log("Dashboard loaded successfully.");
});

// ------------------------------------------------------
// Logging helper
// ------------------------------------------------------
function log(msg) {
    const box = document.getElementById("dashboardLog");
    box.textContent += msg + "\n";
}

// ------------------------------------------------------
// PROFIT CALCULATIONS
// ------------------------------------------------------
function calculateProfit() {
    let weeklyProfit = 0;
    let monthlyProfit = 0;
    let totalProfit = 0;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    SALES.forEach(order => {
        const orderDate = new Date(order.timestamp);
        const revenue = order.total;

        // Calculate cost
        let cost = 0;
        order.items.forEach(item => {
            const stockItem = STOCK.find(s => s.item === item.item);
            if (stockItem) {
                cost += stockItem.cost * item.qty;
            }
        });

        const profit = revenue - cost;

        // Weekly
        if (orderDate >= oneWeekAgo) {
            weeklyProfit += profit;
        }

        // Monthly
        if (orderDate >= oneMonthAgo) {
            monthlyProfit += profit;
        }

        // Total
        totalProfit += profit;
    });

    document.getElementById("weeklyProfit").textContent = "£" + weeklyProfit.toFixed(2);
    document.getElementById("monthlyProfit").textContent = "£" + monthlyProfit.toFixed(2);
    document.getElementById("totalProfit").textContent = "£" + totalProfit.toFixed(2);

    log("Profit calculated.");
}

// ------------------------------------------------------
// REGULAR BALANCES
// ------------------------------------------------------
function calculateRegularBalances() {
    let totalCredit = 0;
    let totalDebit = 0;

    REGULARS.forEach(r => {
        if (r.balance < 0) totalCredit += Math.abs(r.balance);
        if (r.balance > 0) totalDebit += r.balance;
    });

    const netBalance = totalDebit - totalCredit;

    document.getElementById("totalCredit").textContent = "£" + totalCredit.toFixed(2);
    document.getElementById("totalDebit").textContent = "£" + totalDebit.toFixed(2);
    document.getElementById("netBalance").textContent = "£" + netBalance.toFixed(2);

    log("Regular balances calculated.");
}

// ------------------------------------------------------
// REORDER POT
// ------------------------------------------------------
function calculateReorderPot() {
    let refillAll = 0;
    let refillLow = 0;

    STOCK.forEach(item => {
        const costToRefill = item.cost * item.stock;

        refillAll += costToRefill;

        if (item.stock <= 5) {
            refillLow += costToRefill;
        }
    });

    document.getElementById("refillAll").textContent = "£" + refillAll.toFixed(2);
    document.getElementById("refillLow").textContent = "£" + refillLow.toFixed(2);

    log("Reorder pot calculated.");
}

// ------------------------------------------------------
// TOP SELLERS
// ------------------------------------------------------
function generateTopSellers() {
    const tally = {};

    SALES.forEach(order => {
        order.items.forEach(item => {
            tally[item.item] = (tally[item.item] || 0) + item.qty;
        });
    });

    const sorted = Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const tbody = document.querySelector("#topSellersTable tbody");
    tbody.innerHTML = "";

    sorted.forEach(([item, qty]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item}</td>
            <td>${qty}</td>
        `;
        tbody.appendChild(row);
    });

    log("Top sellers generated.");
}

// ------------------------------------------------------
// LOW STOCK ALERTS
// ------------------------------------------------------
function generateLowStockAlerts() {
    const tbody = document.querySelector("#lowStockTable tbody");
    tbody.innerHTML = "";

    STOCK.forEach(item => {
        if (item.stock <= 5) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.item}</td>
                <td>${item.stock}</td>
            `;
            tbody.appendChild(row);
        }
    });

    log("Low stock alerts generated.");
}
