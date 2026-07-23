async function sendOrderToGitHub(order) {
    const repoOwner = "CleanUpStapleford";
    const repoName = "OpenAllHours";

async function sendOrderToGitHub(order) {
    const response = await fetch("https://openallhours-relay.cleanupstapleford.workers.dev", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ order })
    });

    console.log("Relay status:", response.status);
    return response.ok;
}


    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`;

    const payload = {
        event_type: "pos_order_raw",
        client_payload: { order }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github.everest-preview+json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify(payload)
    });

    const status = response.status;
    const text = await response.text();

    console.log("=== GITHUB DISPATCH DEBUG ===");
    console.log("Status:", status);
    console.log("Response:", text);
    console.log("=============================");

    return response.ok;
}
