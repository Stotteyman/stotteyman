var links = document.querySelectorAll('nav ul li a');
var currentLink = 0;

document.addEventListener('keydown', function(event) {
	if (event.keyCode == 38) {
		// Up arrow key
		event.preventDefault();
		if (currentLink > 0) {
			currentLink--;
		} else {
			currentLink = links.length - 1;
		}
	} else if (event.keyCode == 40) {
		// Down arrow key
		event.preventDefault();
		if (currentLink < links.length - 1) {
			currentLink++;
		} else {
			currentLink = 0;
		}
	}

	links[currentLink].focus();
});

for (var i = 0; i < links.length; i++) {
	links[i].addEventListener('click', function() {
		currentLink = Array.from(links).indexOf(this);
	});
}
