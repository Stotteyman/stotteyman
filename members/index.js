<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Members Area</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="top-bar">
        <h1>Members Area</h1>
        <a href="#" onclick="signOut();" class="logout-button">Sign out</a>
    </div>

    <div class="grid-container">
        <!-- Content goes here -->
    </div>

    <script src="https://apis.google.com/js/platform.js" async defer></script>
    <script src="script.js"></script>
    <script>
        function signOut() {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
                // Redirect to the logout page or perform additional actions if needed
            });
        }
    </script>
</body>
</html>
