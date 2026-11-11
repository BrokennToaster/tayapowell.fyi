/*
 * Keep the original navigation and actions in place. On desktop, compact
 * counterparts appear only after their originals have scrolled above the page.
 */
(() => {
	if (new URLSearchParams(location.search).has("resume-viewer")) return;
	const topBar = document.querySelector(".top-bar");
	const sourceNav = document.querySelector(".resume-nav-links") || document.getElementById("project-index");
	const viewer = document.querySelector(".resume-print-button") || document.getElementById("portfolio-viewer-open");
	const resumeLink = document.getElementById("projects-resume-link");
	const portfolioLink = document.querySelector(".resume-portfolio-link");
	if (!topBar || !sourceNav || !viewer) return;

	// projects.js must render the project index before these links are copied.
	const rail = document.createElement("nav");
	rail.className = "desktop-rail";
	rail.setAttribute("aria-label", sourceNav.id === "project-index" ? "Project navigation" : "Resume navigation");
	rail.hidden = true;
	const toggle = document.createElement("button");
	toggle.type = "button";
	toggle.className = "desktop-rail-toggle";
	toggle.textContent = "Sections";
	toggle.setAttribute("aria-expanded", "false");
	toggle.setAttribute("aria-controls", "desktop-rail-links");
	const links = document.createElement("div");
	links.className = "desktop-rail-links";
	links.id = "desktop-rail-links";
	links.hidden = true;
	sourceNav.querySelectorAll("a").forEach((source) => {
		const link = document.createElement("a");
		link.href = source.getAttribute("href");
		link.textContent = source.querySelector(".project-index-title")?.textContent || source.textContent.trim();
		links.appendChild(link);
		// The profile button supplies the portfolio destination without duplicating it in the header menu.
		if (portfolioLink && source.getAttribute("href") === "#projects") {
			const portfolio = document.createElement("a");
			portfolio.href = portfolioLink.href;
			portfolio.textContent = "Project Portfolio";
			links.appendChild(portfolio);
		}
	});
	if (resumeLink) {
		const railResumeLink = document.createElement("a");
		railResumeLink.href = resumeLink.href;
		railResumeLink.textContent = resumeLink.textContent.trim();
		links.appendChild(railResumeLink);
	}
	rail.append(toggle, links);
	document.body.appendChild(rail);

	function setOpen(open) {
		toggle.setAttribute("aria-expanded", String(open));
		links.hidden = !open;
	}
	toggle.addEventListener("click", () => setOpen(links.hidden));
	links.addEventListener("click", (event) => {
		if (event.target.closest("a")) setOpen(false);
	});
	document.addEventListener("click", (event) => {
		if (!rail.contains(event.target)) setOpen(false);
	});
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !links.hidden) {
			setOpen(false);
			toggle.focus();
		}
	});

	const actions = document.createElement("div");
	actions.className = "desktop-actions";
	actions.hidden = true;
	let floatingResumeLink;
	if (resumeLink) {
		floatingResumeLink = document.createElement("a");
		floatingResumeLink.className = "desktop-action";
		floatingResumeLink.href = resumeLink.href;
		floatingResumeLink.textContent = resumeLink.textContent.trim();
		actions.appendChild(floatingResumeLink);
	}
	const viewerLink = document.createElement("a");
	viewerLink.className = "desktop-action";
	viewerLink.href = viewer.href;
	viewerLink.target = "_blank";
	viewerLink.textContent = viewer.textContent.trim();
	viewerLink.addEventListener("click", (event) => {
		if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
		// The original link owns the named viewer window and its return behavior.
		event.preventDefault();
		viewer.click();
	});
	actions.appendChild(viewerLink);

	const contactButton = document.querySelector("[data-contact-toggle]");
	const contactDetails = document.getElementById("contact-details");
	const contactSection = document.querySelector(".resume-contact");
	let contactWrap;
	let floatingContact;
	let floatingDetails;
	let expanded = false;
	if (contactButton && contactDetails && contactSection) {
		contactWrap = document.createElement("div");
		contactWrap.className = "desktop-contact";
		floatingContact = document.createElement("button");
		floatingContact.type = "button";
		floatingContact.className = "desktop-action";
		floatingContact.textContent = contactButton.textContent.trim();
		floatingContact.setAttribute("aria-controls", "desktop-contact-details");
		floatingContact.setAttribute("aria-expanded", "false");
		floatingDetails = document.createElement("div");
		floatingDetails.id = "desktop-contact-details";
		floatingDetails.className = "desktop-contact-details";
		floatingDetails.hidden = true;
		floatingContact.addEventListener("click", () => contactButton.click());
		contactWrap.append(floatingContact, floatingDetails);
		actions.appendChild(contactWrap);
		document.addEventListener("resume-contact-change", (event) => {
			expanded = event.detail.expanded;
			// Reuse the revealed links rather than storing another copy of the contact data.
			floatingDetails.replaceChildren(...Array.from(contactDetails.childNodes, (node) => node.cloneNode(true)));
			update();
		});
	}
	document.body.appendChild(actions);

	const desktop = matchMedia("(min-width: 768px)");
	function update() {
		const enabled = desktop.matches;
		const showRail = enabled && sourceNav.getBoundingClientRect().bottom <= 0;
		const showActions = enabled && topBar.getBoundingClientRect().bottom <= 0;
		if (!showRail && !rail.hidden) {
			if (rail.contains(document.activeElement)) sourceNav.querySelector("a")?.focus({ preventScroll: true });
			setOpen(false);
		}
		if (!showActions && !actions.hidden && actions.contains(document.activeElement)) {
			const original = document.activeElement === floatingResumeLink
				? resumeLink
				: contactWrap && contactWrap.contains(document.activeElement) ? contactButton : viewer;
			original?.focus({ preventScroll: true });
		}
		rail.hidden = !showRail;
		actions.hidden = !showActions;
		if (floatingDetails) {
			const showDetails = showActions && expanded && contactSection.getBoundingClientRect().bottom <= 0;
			if (!showDetails && showActions && floatingDetails.contains(document.activeElement)) {
				floatingContact.focus({ preventScroll: true });
			}
			floatingDetails.hidden = !showDetails;
			floatingContact.setAttribute("aria-expanded", String(!floatingDetails.hidden));
		}
	}
	let scheduled = false;
	function scheduleUpdate() {
		if (scheduled) return;
		scheduled = true;
		requestAnimationFrame(() => { scheduled = false; update(); });
	}
	window.addEventListener("scroll", scheduleUpdate, { passive: true });
	window.addEventListener("resize", scheduleUpdate);
	update();
})();
