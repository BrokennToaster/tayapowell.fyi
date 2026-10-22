(() => {
	const nav = document.querySelector(".resume-nav");
	const toggle = document.getElementById("resume-nav-toggle");
	const links = document.getElementById("resume-nav-links");

	if (!nav || !toggle || !links) {
		return;
	}

	// Only collapse the links once this script is running, so they stay reachable without JavaScript.
	nav.classList.add("is-enhanced");

	function setOpen(open) {
		toggle.setAttribute("aria-expanded", String(open));
		links.classList.toggle("is-open", open);
	}

	toggle.addEventListener("click", () => {
		setOpen(toggle.getAttribute("aria-expanded") !== "true");
	});

	links.addEventListener("click", (event) => {
		if (event.target.closest("a")) {
			setOpen(false);
		}
	});

	document.addEventListener("click", (event) => {
		if (!nav.contains(event.target)) {
			setOpen(false);
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
			setOpen(false);
			toggle.focus();
		}
	});
})();
