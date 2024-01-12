function googleSignIn() {
    gapi.auth2.getAuthInstance().signIn({ scope: 'profile email openid offline_access' }).then(onSignIn);
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId());
    console.log('Name: ' + profile.getName());
    console.log('Email: ' + profile.getEmail());
    // You can now handle the user data as needed, like sending it to your server.
}
