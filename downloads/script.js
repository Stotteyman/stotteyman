document.addEventListener('DOMContentLoaded', function() {
    var downloads = document.getElementById('downloads');
    var store = document.getElementById('store');

    downloads.addEventListener('click', function() {
        // Redirect to the downloads page or trigger a specific download action
        window.location.href = '/downloads'; // Replace '/downloads' with your actual downloads page URL
    });

    store.addEventListener('click', function() {
        // Redirect to the store page or perform a specific action related to your store
        window.location.href = '/store'; // Replace '/store' with your actual store page URL
    });
});
