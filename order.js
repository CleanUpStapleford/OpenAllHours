// ===============================
// OpenAllHours POS - Order Sender
// Cloudflare Worker Relay Version
// ===============================

async function sendOrderToGitHub(order) {
    try {
        const response = await fetch("https://openallhours-relay.cleanupstapleford.workers.dev", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ order })
        });

        console.log("=== RELAY DEBUG ===");
        console.log("Status:", response.status);

        const text = await response.text();
        console.log("Response:", text);
        console.log("===================");

        return response.ok;
    } catch (err) {
        console.error("Relay error:", err);
        return false;
    }
}

// ===============================
// Complete Order Button Handler
// ===============================

document.getElementById("completeOrderBtn").addEventListener("click", async () => {
    const order = buildOrderObject(); // Your existing function that builds the order

    console.log("Sending order:", order);

    const success = await sendOrderToGitHub(order);

    if (success) {
        alert("Order sent successfully!");
    } else {
        alert("Failed to send order. Check console.");
    }
});

// ===============================
// Your existing order builder
// ===============================

function buildOrderObject() {
    // Whatever your POS already uses — unchanged
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    const timestamp = new Date().toISOString();

    return {
        items,
        timestamp,
        total: calculateTotal(items)
    };
}

function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
