// --------------------------------------
// SEND ORDER TO GITHUB ACTION (Relay Workflow)
// --------------------------------------
async function sendOrderToGitHub(order) {
    const repoOwner = "CleanUpStapleford";   // your GitHub username
    const repoName = "OpenAllHours";         // your repo name

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`;

    const payload = {
        event_type: "pos_order_raw",
        client_payload: {
            order: order
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    return response.ok;
}
