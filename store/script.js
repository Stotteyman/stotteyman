var stripe = Stripe('pk_live_51MipdfCYfgL2SDGtEr49qYrKHNPdBTC8Rru3EzwAgXMoVmNvLFpaiy6l3gQuXK0spPwJNgyRSvKGB4WxZVTt9SZ100zJMInUfu');
document.querySelectorAll('button').forEach(function(button) {
	button.addEventListener('click', function(e) {
		var buyButtonId = e.target.getAttribute('id');
		var itemPrice = parseFloat(e.target.previousElementSibling.innerText.replace('$', ''));
		stripe.redirectToCheckout({
			items: [{sku: buyButtonId, quantity: 1}],
			successUrl: 'https://stotteyman.com/success',
			cancelUrl: 'https://stotteyman.com/canceled',
		}).then(function (result) {
			if (result.error) {
				console.log(result.error.message);
			}
		});
	});
});
