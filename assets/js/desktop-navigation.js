/*
 * Keep the original navigation and actions in place. Compact
 * counterparts appear only after their originals have scrolled above the page.
 */
(() => {
	if (new URLSearchParams(location.search).has("resume-viewer")) return;
	const topBar = document.querySelector(".top-bar");
	const sourceNav = document.querySelector(".resume-nav-links") || document.getElementById("project-index");
	const railThreshold = document.querySelector(".resume-nav") || sourceNav;
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
	if (document.getElementById("get-in-touch")) {
		const bottomLink = document.createElement("a");
		bottomLink.href = "#get-in-touch";
		bottomLink.textContent = "Get in touch";
		links.appendChild(bottomLink);
	}
	const hideMenu = document.createElement("button");
	hideMenu.type = "button";
	hideMenu.className = "desktop-rail-hide";
	hideMenu.textContent = "Hide menu";
	links.appendChild(hideMenu);
	rail.append(toggle, links);
	document.body.appendChild(rail);

	function setOpen(open, restoreFocus = true) {
		if (!open && restoreFocus && !links.hidden && links.contains(document.activeElement)) {
			toggle.hidden = false;
			toggle.focus({ preventScroll: true });
		}
		toggle.setAttribute("aria-expanded", String(open));
		toggle.hidden = open;
		links.hidden = !open;
	}
	const mobileLayout = matchMedia("(max-width: 767.98px)");
	const content = document.querySelector(".resume-wrapper");
	const availableRailSpace = () => content ? Math.max(0, Math.floor(content.getBoundingClientRect().left) - 4) : 0;
	let isMobile = mobileLayout.matches;
	let wantsOpen = !isMobile && availableRailSpace() >= 120;
	function fitRail() {
		const mobile = mobileLayout.matches;
		const available = availableRailSpace();
		if (mobile !== isMobile) {
			isMobile = mobile;
			wantsOpen = !mobile && available >= 120;
		}
		rail.style.setProperty("--rail-space", `${available}px`);
		rail.classList.toggle("is-overlay", mobile || available < 120);
		setOpen(wantsOpen);
	}
	toggle.addEventListener("click", () => {
		wantsOpen = links.hidden;
		fitRail();
		if (!links.hidden) hideMenu.focus({ preventScroll: true });
	});
	hideMenu.addEventListener("click", () => {
		wantsOpen = false;
		setOpen(false);
	});
	links.addEventListener("click", (event) => {
		if (event.target.closest("a")) { wantsOpen = false; setOpen(false, false); }
	});
	document.addEventListener("click", (event) => {
		if (rail.hidden || links.hidden || rail.contains(event.target)) return;
		const overlapsContent = content && links.getBoundingClientRect().right > content.getBoundingClientRect().left;
		if (mobileLayout.matches || overlapsContent) {
			wantsOpen = false;
			setOpen(false, false);
		}
	});
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !links.hidden) {
			wantsOpen = false;
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
		floatingResumeLink.setAttribute("aria-label", resumeLink.textContent.trim());
		floatingResumeLink.innerHTML = '<i class="bi bi-arrow-left" aria-hidden="true"></i><span></span>';
		floatingResumeLink.querySelector("span").textContent = resumeLink.textContent.trim();
		actions.appendChild(floatingResumeLink);
	}
	const viewerLink = document.createElement("a");
	viewerLink.className = "desktop-action";
	viewerLink.href = viewer.href;
	viewerLink.target = "_blank";
	viewerLink.setAttribute("aria-label", viewer.textContent.trim());
	viewerLink.innerHTML = '<i class="bi bi-file-earmark-pdf" aria-hidden="true"></i><span></span>';
	viewerLink.querySelector("span").textContent = viewer.textContent.trim();
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
	let expanded = contactButton?.getAttribute("aria-expanded") === "true";
	let mobileContactOpen = false;
	let wasMobile = mobileLayout.matches;
	if (contactButton && contactDetails && contactSection) {
		contactWrap = document.createElement("div");
		contactWrap.className = "desktop-contact";
		floatingContact = document.createElement("button");
		floatingContact.type = "button";
		floatingContact.className = "desktop-action";
		floatingContact.setAttribute("aria-label", "Contact Me");
		floatingContact.innerHTML = '<i class="bi bi-envelope" aria-hidden="true"></i><span>Contact Me</span>';
		floatingContact.setAttribute("aria-controls", "desktop-contact-details");
		floatingContact.setAttribute("aria-expanded", "false");
		floatingDetails = document.createElement("div");
		floatingDetails.id = "desktop-contact-details";
		floatingDetails.className = "desktop-contact-details";
		floatingDetails.hidden = true;
		floatingContact.addEventListener("click", () => {
			if (!mobileLayout.matches) {
				window.setResumeContactExpanded(!expanded);
				return;
			}
			mobileContactOpen = !mobileContactOpen;
			if (mobileContactOpen && !expanded) window.setResumeContactExpanded(true);
			else update();
			if (mobileContactOpen) closeContact.focus({ preventScroll: true });
		});
		const closeContact = document.createElement("button");
		closeContact.type = "button";
		closeContact.className = "desktop-contact-close";
		closeContact.textContent = "Hide contact";
		closeContact.addEventListener("click", () => {
			mobileContactOpen = false;
			update();
			floatingContact.focus({ preventScroll: true });
		});
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && mobileContactOpen) closeContact.click();
		});
		const contactLinks = document.createElement("div");
		contactLinks.className = "desktop-contact-links";
		contactLinks.replaceChildren(...Array.from(contactDetails.childNodes, (node) => node.cloneNode(true)));
		floatingDetails.append(closeContact, contactLinks);
		contactWrap.append(floatingContact, floatingDetails);
		actions.appendChild(contactWrap);
		document.addEventListener("resume-contact-change", (event) => {
			expanded = event.detail.expanded;
			if (!expanded) mobileContactOpen = false;
			// Reuse the revealed links rather than storing another copy of the contact data.
			contactLinks.replaceChildren(...Array.from(contactDetails.childNodes, (node) => node.cloneNode(true)));
			update();
		});
	}
	document.body.appendChild(actions);

	function update() {
		fitRail();
		const mobile = mobileLayout.matches;
		if (mobile !== wasMobile) {
			mobileContactOpen = false;
			wasMobile = mobile;
		}
		const showRail = railThreshold.getBoundingClientRect().bottom <= 0;
		const showActions = topBar.getBoundingClientRect().bottom <= 0;
		const contactPassed = contactSection && (mobile
			? contactSection.getBoundingClientRect().bottom <= 0
			: showActions);
		if (!showRail && !rail.hidden) {
			if (rail.contains(document.activeElement)) {
				const original = document.querySelector(".resume-nav-toggle") || sourceNav.querySelector("a");
				original?.focus({ preventScroll: true });
			}
		}
		if (!showActions && !actions.hidden && actions.contains(document.activeElement)) {
			const original = document.activeElement === floatingResumeLink
				? resumeLink
				: contactWrap && contactWrap.contains(document.activeElement)
					? (!mobile && expanded ? document.querySelector(".top-contact-hide") : contactButton)
					: viewer;
			original?.focus({ preventScroll: true });
		}
		rail.hidden = !showRail;
		actions.hidden = !showActions;
		if (floatingDetails) {
			if (!showActions) mobileContactOpen = false;
			const bottomContact = document.getElementById("get-in-touch");
			const bottomRect = bottomContact?.getBoundingClientRect();
			const bottomVisible = bottomRect && bottomRect.top < window.innerHeight && bottomRect.bottom > 0;
			const showDetails = showActions && expanded && (mobile
				? mobileContactOpen
				: contactPassed && !bottomVisible);
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
	document.querySelectorAll("[data-resume-viewer]").forEach((link) => {
		link.addEventListener("click", (event) => {
			if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
			event.preventDefault();
			viewer.click();
		});
	});
	update();
})();
