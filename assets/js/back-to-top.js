/*
 * Show #back-to-top after one viewport of scrolling (at least 400px).
 * resume-overrides.css controls its visibility and animation. Reduced-motion
 * users jump to the top without the smooth scroll.
 */
(() => {
	const button = document.getElementById("back-to-top");
	const bottomLink = document.getElementById("scroll-to-bottom");
	const bottomTarget = bottomLink && document.getElementById(bottomLink.hash.slice(1));

	if (!button) {
		return;
	}

	let isVisible = false;

	function getThreshold() {
		return Math.max(400, window.innerHeight);
	}

	// Change the class only when the visibility state actually changes.
	function update() {
		const shouldShow = window.scrollY > getThreshold();

		if (shouldShow !== isVisible) {
			isVisible = shouldShow;
			button.classList.toggle("is-visible", isVisible);
		}
		if (bottomLink && bottomTarget) {
			const targetVisible = bottomTarget.getBoundingClientRect().top < window.innerHeight;
			const showBottomLink = window.scrollY > 200 && !targetVisible;
			if (!showBottomLink && document.activeElement === bottomLink) {
				bottomTarget.focus({ preventScroll: true });
			}
			bottomLink.classList.toggle("is-visible", showBottomLink);
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