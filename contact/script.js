// script.js

function sendMessage() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;

    // Prepare data to send to the Discord webhook with formatting
    var discordData = {
        content: `@here **New message from ${name} (${email}):**\n${message}`
    };

    // Discord webhook URL (replace with your actual webhook URL)
    var webhookUrl = "https://discord.com/api/webhooks/1199319139014152192/wZjX7TAn_Sbu3ZjocRwuaa_GKsfxY7AOjrvwzRnH58g4vCfgReFQ1AKy3UVu62tuUtQy";

    // Make an AJAX request to the Discord webhook
    var xhr = new XMLHttpRequest();
    xhr.open("POST", webhookUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                console.log("Message sent to Discord successfully!");
            } else {
                console.error("Failed to send message to Discord. Status code: " + xhr.status);
            }
        }
    };

    // Convert data to JSON and send it to the Discord webhook
    xhr.send(JSON.stringify(discordData));
}
