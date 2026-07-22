// -------------------------------
// Open All Hours POS — order.js
// -------------------------------
// Loads stock + regulars, builds orders, updates summary,
// and prepares payload for GitHub Actions.
// -------------------------------

// Load JSON files
async function loadJSON(path) {
    const response = await fetch(path);
    return await response.json();
}

let STOCK = [];
let REGULARS = [];

// Load stock + regulars on page load
document.addEventListener("DOMContentLoaded", async () => {
    STOCK = await loadJSON("stock.json");
    REGULARS = await loadJSON("regulars.json");

    populateItems();
});

// --------------------------------------
// Populate items dynamically from stock.json
// --------------------------------------
function populateItems() {
    const tbody = document.querySelector(".item-list tbody");
    tbody.innerHTML = "";

    STOCK.forEach(item => {
        const row = document.createElement("tr");
        row.dataset.item = item.item;
        row.dataset.price = item.price;

        row.innerHTML = `
            <td>${item.item}</td>
            <td>${item.price.toFixed(2)}</td>
            <td><input class="qty-input" type="number" min="0" value="0"></td>
        `;

        tbody.appendChild(row);
    });
}

// --------------------------------------
// Detect regular + auto payment type
// --------------------------------------
function detectRegular(name) {
    if (!name) return null;
    const reg = REGULARS.find(r => r.name.toLowerCase() === name.toLowerCase());
    return reg || null;
}

// --------------------------------------
// Build order object
// --------------------------------------
function buildOrder() {
    const rows = document.querySelectorAll(".item-list tbody tr");
    const items = [];
    let total = 0;

    rows.forEach(row => {
        const qty = parseInt(row.querySelector(".qty-input").value || "0");
        if (qty > 0) {
            const name = row.dataset.item;
            const price = parseFloat(row.dataset.price);
            const lineTotal = qty * price;

            items.push({
                item: name,
                qty,
                price,
                lineTotal
            });

            total += lineTotal;
        }
    });

    const customerName = document.getElementById("customerName").value.trim();
    const isRegular = document.getElementById("isRegular").checked;
    const paymentMethod = getPaymentMethod();

    let regularData = null;
    if (isRegular && customerName) {
        regularData = detectRegular(customerName);

        if (regularData) {
            // Auto‑apply credit/debit
            paymentMethod = regularData.auto_payment;
        }
    }

    return {
        timestamp: new Date().toISOString(),
        customer: customerName || null,
        isRegular: isRegular,
        regularData: regularData,
        paymentMethod: paymentMethod,
        items: items,
        total: total
    };
}

// --------------------------------------
// Payment method selection
// --------------------------------------
function getPaymentMethod() {
    const radios = document.querySelectorAll('input[name="paymentMethod"]');
    for (const r of radios) {
        if (r.checked) return r.value;
    }
    return "monzo_link";
}

// --------------------------------------
// Update summary panel
// --------------------------------------
function updateSummary() {
    const order = buildOrder();

    document.getElementById("itemsTotal").textContent = "£" + order.total.toFixed(2);
    document.getElementById("summaryCustomer").textContent = order.customer || "-";
    document.getElementById("summaryPayment").textContent = order.paymentMethod;
}

// --------------------------------------
// Complete order (for now: show JSON)
// Later: send to GitHub Actions
// --------------------------------------
function completeOrder() {
    const order = buildOrder();
    updateSummary();

    const log = document.getElementById("orderLog");
    log.textContent = JSON.stringify(order, null, 2);

    // -------------------------------
    // Later:
    // - POST order to GitHub Action
    // - Update stock.json
    // - Update regulars.json
    // - Append to sales.json
    // - Trigger Discord webhook
    // -------------------------------
}

// --------------------------------------
// Event listeners
// --------------------------------------
document.getElementById("updateSummaryBtn").addEventListener("click", updateSummary);
document.getElementById("completeOrderBtn").addEventListener("click", completeOrder);

// --------------------------------------
// SEND ORDER TO GITHUB ACTION
// --------------------------------------
async function sendOrderToGitHub(order) {
    const repoOwner = "YOUR_GITHUB_USERNAME";
    const repoName = "YOUR_REPO_NAME";

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`;

    const payload = {
        event_type: "pos_order",
        client_payload: {
            order: JSON.stringify(order)
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer YOUR_GITHUB_PAT",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    return response.ok;
}
