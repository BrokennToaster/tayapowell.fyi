(() => {
	const encodedEmail = "dGF5YS5yLnBvd2VsbEBnbWFpbC5jb20=";
	const encodedPhone = "NTEyLTU1NC0xNDgz";
	window.getResumeContactDetails = () => ({
		email: atob(encodedEmail),
		phone: atob(encodedPhone)
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

	function setExpanded(expanded) {
		isExpanded = expanded;
		contactDetails.replaceChildren();

		if (expanded) {
			const email = atob(encodedEmail);
			const phone = atob(encodedPhone);

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