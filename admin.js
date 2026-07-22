// -------------------------------------------
// Open All Hours POS — admin.js
// -------------------------------------------
// Loads regulars.json, displays cards, allows
// balance adjustments, notes, adding/removing
// regulars, and prepares updated JSON.
// -------------------------------------------

async function loadRegulars() {
    const response = await fetch("regulars.json");
    return await response.json();
}

let REGULARS = [];

// Load regulars on page load
document.addEventListener("DOMContentLoaded", async () => {
    REGULARS = await loadRegulars();
    renderRegulars();
});

// -------------------------------------------
// Render all regulars into admin.html
// -------------------------------------------
function renderRegulars() {
    const container = document.getElementById("regularsContainer");
    container.innerHTML = "";

    REGULARS.forEach((reg, index) => {
        const card = document.createElement("div");
        card.className = "regular-card";

        card.innerHTML = `
            <h2>${reg.name}</h2>

            <div class="info-line">
                <strong>Auto payment:</strong> ${reg.auto_payment}
            </div>

            <div class="info-line">
                <strong>Balance:</strong>
                <span class="balance">£${reg.balance.toFixed(2)}</span>
            </div>

            <div class="info-line">
                <strong>Notes:</strong> ${reg.notes || "None"}
            </div>

            <div class="info-line">
                <strong>Trusted:</strong> ${reg.trusted ? "Yes" : "No"}
            </div>

            <button class="btn btn-add" onclick="adjustBalance(${index}, 1)">
                + £1 (Debit)
            </button>

            <button class="btn btn-add" onclick="adjustBalance(${index}, -1)">
                - £1 (Credit)
            </button>

            <button class="btn btn-note" onclick="editNotes(${index})">
                Edit Notes
            </button>

            <button class="btn btn-remove" onclick="removeRegular(${index})">
                Remove Regular
            </button>
        `;

        container.appendChild(card);
    });
}

// -------------------------------------------
// Adjust balance (credit/debit)
// -------------------------------------------
function adjustBalance(index, amount) {
    REGULARS[index].balance += amount;

    log(`Adjusted ${REGULARS[index].name}'s balance by £${amount}. New balance: £${REGULARS[index].balance.toFixed(2)}`);

    renderRegulars();
}

// -------------------------------------------
// Edit notes
// -------------------------------------------
function editNotes(index) {
    const newNotes = prompt("Enter new notes:", REGULARS[index].notes || "");
    if (newNotes !== null) {
        REGULARS[index].notes = newNotes;
        log(`Updated notes for ${REGULARS[index].name}`);
        renderRegulars();
    }
}

// -------------------------------------------
// Remove regular
// -------------------------------------------
function removeRegular(index) {
    const name = REGULARS[index].name;
    if (confirm(`Remove ${name} from regulars?`)) {
        REGULARS.splice(index, 1);
        log(`Removed regular: ${name}`);
        renderRegulars();
    }
}

// -------------------------------------------
// Add new regular
// -------------------------------------------
document.getElementById("addRegularBtn").addEventListener("click", () => {
    const name = document.getElementById("newName").value.trim();
    const auto_payment = document.getElementById("newPayment").value.trim();
    const balance = parseFloat(document.getElementById("newBalance").value.trim() || "0");
    const notes = document.getElementById("newNotes").value.trim();

    if (!name || !auto_payment) {
        alert("Name and auto_payment are required.");
        return;
    }

    REGULARS.push({
        name,
        auto_payment,
        balance,
        notes,
        discord: "",
        email: "",
        trusted: false
    });

    log(`Added new regular: ${name}`);

    // Clear fields
    document.getElementById("newName").value = "";
    document.getElementById("newPayment").value = "";
    document.getElementById("newBalance").value = "";
    document.getElementById("newNotes").value = "";

    renderRegulars();
});

// -------------------------------------------
// Save changes (later: send to GitHub Action)
// -------------------------------------------
document.getElementById("saveChangesBtn").addEventListener("click", () => {
    const updatedJSON = JSON.stringify(REGULARS, null, 2);

    log("Prepared updated regulars.json:");
    log(updatedJSON);

    // -------------------------------------------
    // Later:
    // - Send updatedJSON to GitHub Action
    // - Commit changes to regulars.json
    // - Trigger Discord notification
    // -------------------------------------------
});

// -------------------------------------------
// Log panel
// -------------------------------------------
function log(message) {
    const logBox = document.getElementById("adminLog");
    logBox.textContent += message + "\n";
}
