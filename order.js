async function sendOrderToGitHub(order) {
    const repoOwner = "CleanUpStapleford";
    const repoName = "OpenAllHours";

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`;

    const payload = {
        event_type: "pos_order_raw",
        client_payload: { order }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github.everest-preview+json",
            "Content-Type": "application/json"
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