/*
 * Expose contact details on request and while printing. The resume viewer
 * reads the same decoded values when it builds the downloadable document.
 */
(() => {
	// Contact values are stored as scrambled fragments (split + reversed)
	// and reassembled only at runtime, so raw-source regex finds no
	// email/phone pattern and no single encoded blob to match against.
	// This is obfuscation, not encryption: visitors can still inspect the values.
	// To update a value, Base64-encode it, split that encoded string into
	// fragments, and store the fragments in reverse order as shown below.
	const fragments = {
		email: ["LnBvd2VsbEBnbWFpbC5jb20=", "dGF5YS5y"],
		phone: ["NDgz", "NTEyLTU1NC0x"]
	};
	const decodeFragment = (key) => atob(fragments[key].slice().reverse().join(""));
	window.getResumeContactDetails = () => ({
		email: decodeFragment("email"),
		phone: decodeFragment("phone")
	});
	const revealButtons = document.querySelectorAll("[data-contact-toggle]:not([data-contact-bottom]):not(.bottom-contact-hide)");
	const contactDetails = document.getElementById("contact-details");
	const bottomDetails = document.getElementById("bottom-contact-details");
	const bottomLinks = bottomDetails?.querySelector(".bottom-contact-links");
	const bottomButton = document.querySelector("[data-contact-bottom]");
	const bottomHide = bottomDetails?.querySelector("[data-contact-toggle]");
	const topDetails = document.getElementById("top-contact-details");
	const topLinks = topDetails?.querySelector(".top-contact-links");
	const topHide = topDetails?.querySelector(".top-contact-hide");
	const topButton = document.querySelector(".top-bar [data-contact-toggle]");
	let isExpanded = false;
	let wasExpandedBeforePrint = false;

	if (!contactDetails || revealButtons.length === 0) {
		return;
	}

	function addContactLink(container, label, href, value) {
		const row = document.createElement("div");
		const link = document.createElement("a");

		link.href = href;
		link.textContent = value;
		link.setAttribute("aria-label", `${label}: ${value}`);
		row.append(link);
		container.append(row);
	}

	// Rebuild the links when opening and synchronize the accessible button state.
	function setExpanded(expanded) {
		const restoreTopFocus = matchMedia("(min-width: 768px)").matches && (expanded
			? document.activeElement === topButton
			: topDetails?.contains(document.activeElement));
		isExpanded = expanded;
		contactDetails.replaceChildren();

		if (expanded) {
			const { email, phone } = window.getResumeContactDetails();

			addContactLink(contactDetails, "Email", `mailto:${email}`, email);
			addContactLink(contactDetails, "Phone", `tel:${phone}`, phone);
			contactDetails.hidden = false;
		} else {
			contactDetails.hidden = true;
		}
		if (topDetails && topLinks) {
			topLinks.replaceChildren(...Array.from(contactDetails.childNodes, (node) => node.cloneNode(true)));
			topDetails.hidden = !expanded;
		}

		revealButtons.forEach((button) => {
			button.setAttribute("aria-expanded", String(expanded));
		});
		if (restoreTopFocus) (expanded ? topHide : topButton)?.focus({ preventScroll: true });
		// Desktop navigation mirrors the actual links and reveal state after this update.
		document.dispatchEvent(new CustomEvent("resume-contact-change", { detail: { expanded } }));
	}

	function setBottomExpanded(expanded) {
		if (!bottomDetails || !bottomLinks || !bottomButton || !bottomHide) return;
		const restoreFocus = expanded
			? document.activeElement === bottomButton
			: bottomDetails.contains(document.activeElement);
		bottomLinks.replaceChildren();
		if (expanded) {
			const { email, phone } = window.getResumeContactDetails();
			addContactLink(bottomLinks, "Email", `mailto:${email}`, email);
			addContactLink(bottomLinks, "Phone", `tel:${phone}`, phone);
		}
		bottomDetails.hidden = !expanded;
		bottomButton.hidden = expanded;
		bottomButton.setAttribute("aria-expanded", String(expanded));
		bottomHide.setAttribute("aria-expanded", String(expanded));
		if (restoreFocus) (expanded ? bottomHide : bottomButton).focus({ preventScroll: true });
	}
	bottomButton?.addEventListener("click", () => setBottomExpanded(true));
	bottomHide?.addEventListener("click", () => setBottomExpanded(false));
	topHide?.addEventListener("click", () => setExpanded(false));

	revealButtons.forEach((button) => {
		button.addEventListener("click", () => {
			setExpanded(!isExpanded);
			if (isExpanded && button.closest(".top-bar") && matchMedia("(max-width: 767.98px)").matches) {
				contactDetails.scrollIntoView({
					block: "center",
					behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
				});
			}
		});
	});
	window.setResumeContactExpanded = setExpanded;

	// Show contact details on the printed page, then restore the previous state.
	window.addEventListener("beforeprint", () => {
		wasExpandedBeforePrint = isExpanded;
		if (!isExpanded) {
			setExpanded(true);
		}
	});

	window.addEventListener("afterprint", () => {
		if (!wasExpandedBeforePrint) {
			setExpanded(false);
		}
	});
})();