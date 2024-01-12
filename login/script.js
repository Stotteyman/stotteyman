function googleSignIn() {
    gapi.auth2.getAuthInstance().signIn({ scope: 'profile email openid offline_access' }).then(onSignIn);
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId());
    console.log('Name: ' + profile.getName());
    console.log('Email: ' + profile.getEmail());
    // You can now handle the user data as needed, like sending it to your server.

    // Redirect the user to the specified URL after successful login
    window.location.href = 'https://stotteyman.com/members/';
}

// Ensure that the redirect_uri matches the one registered in the Google API Console
gapi.auth2.init({
    client_id: '232342949144-u4amlu55qr6of2ps53vptgec2dv4m388.apps.googleusercontent.com',
    scope: 'profile email openid offline_access',
    redirect_uri: 'https://stotteyman.com/members/'
});
