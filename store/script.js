var buyButtons = document.querySelectorAll('.buy-btn');

buyButtons.forEach(function(button) {
	button.addEventListener('click', function(e) {
		var checkoutLink = e.target.getAttribute('data-checkout-link');
		window.location.href = checkoutLink;
	});
});
