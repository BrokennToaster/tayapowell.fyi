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
	const revealButtons = document.querySelectorAll("[data-contact-toggle]");
	const contactDetails = document.getElementById("contact-details");
	let isExpanded = false;
	let wasExpandedBeforePrint = false;

	if (!contactDetails || revealButtons.length === 0) {
		return;
	}

	function addContactLink(label, href, value) {
		const row = document.createElement("div");
		const text = document.createElement("strong");
		const link = document.createElement("a");

		text.textContent = `${label}: `;
		link.href = href;
		link.textContent = value;
		row.append(text, link);
		contactDetails.append(row);
	}

	// Rebuild the links when opening and synchronize the accessible button state.
	function setExpanded(expanded) {
		isExpanded = expanded;
		contactDetails.replaceChildren();

		if (expanded) {
			const { email, phone } = window.getResumeContactDetails();

			addContactLink("Email", `mailto:${email}`, email);
			addContactLink("Phone", `tel:${phone}`, phone);
			contactDetails.hidden = false;
		} else {
			contactDetails.hidden = true;
		}

		revealButtons.forEach((button) => {
			button.setAttribute("aria-expanded", String(expanded));
		});
	}

	revealButtons.forEach((button) => {
		button.addEventListener("click", () => setExpanded(!isExpanded));
	});

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