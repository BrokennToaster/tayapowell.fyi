(() => {
	const button = document.getElementById("back-to-top");

	if (!button) {
		return;
	}

	let isVisible = false;

	function getThreshold() {
		return Math.max(400, window.innerHeight);
	}

	function update() {
		const shouldShow = window.scrollY > getThreshold();

		if (shouldShow !== isVisible) {
			isVisible = shouldShow;
			button.classList.toggle("is-visible", isVisible);
		}
	}

	button.addEventListener("click", () => {
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
	});

	window.addEventListener("scroll", update, { passive: true });
	window.addEventListener("resize", update, { passive: true });
	update();
})();