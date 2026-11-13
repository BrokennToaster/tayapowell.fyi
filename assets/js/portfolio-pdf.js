/*
 * Generate one letter-size page per project from the curated portfolioPdf
 * fields in projects-data.js. Missing content, images, or overflowing copy
 * stop the download instead of silently omitting a project or truncating text.
 */
(() => {
	const openViewer = document.getElementById("portfolio-viewer-open");
	if (openViewer) {
		openViewer.addEventListener("click", (event) => {
			if (window.open(openViewer.href, "portfolio-viewer-tab")) event.preventDefault();
		});
		return;
	}
	const status = document.getElementById("portfolio-status");
	const downloadLink = document.getElementById("portfolio-download");
	const openPdf = document.getElementById("portfolio-open-pdf");
	const sharePrint = document.getElementById("portfolio-share-print");
	const preview = document.getElementById("portfolio-preview");
	const mobilePreview = document.getElementById("portfolio-mobile-preview");
	const back = document.getElementById("portfolio-back");
	if (!status || !downloadLink || !openPdf || !sharePrint || !preview || !mobilePreview || !back) return;

	const ua = navigator.userAgent || "";
	const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(ua)
		|| (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
		|| !!(navigator.userAgentData && navigator.userAgentData.mobile);

	function printPreview() {
		if (typeof window.print !== "function") {
			window.alert("Printing is not available in this browser. Open this portfolio on another device to download the PDF.");
			return;
		}
		window.alert("Your browser cannot share the PDF directly. Printing will use the reflowed preview, which may have a different page layout.");
		try {
			window.print();
		} catch (error) {
			console.error("Portfolio preview could not be printed:", error);
			window.alert("This browser could not open the print dialog. Open this portfolio on another device to download the PDF.");
		}
	}

	function setupSharePrint(blob) {
		sharePrint.addEventListener("click", () => {
			const name = downloadLink.download;
			let file;
			try {
				if (window.File && navigator.canShare && navigator.share) {
					file = new File([blob], name, { type: "application/pdf" });
					if (navigator.canShare({ files: [file] })) {
						navigator.share({ files: [file], title: name }).catch((error) => {
							if (error && error.name === "AbortError") return;
							console.error("Portfolio PDF could not be shared:", error);
							printPreview();
						});
						return;
					}
				}
			} catch (error) {
				console.error("Portfolio PDF sharing is unavailable:", error);
			}
			printPreview();
		});
	}

	const pageWidth = 612;
	const margin = 40;
	const contentWidth = pageWidth - margin * 2;
	back.addEventListener("click", (event) => {
		event.preventDefault();
		const target = back.href;
		let opener;
		try {
			opener = window.opener;
			if (opener && !opener.closed) {
				const openerUrl = new URL(opener.location.href);
				if (openerUrl.origin === location.origin && openerUrl.pathname.endsWith("/projects.html")) {
					opener.focus();
					// focus() is only a request: browsers can ignore it. Do not close
					// until the projects tab confirms it actually received focus.
					setTimeout(() => {
						try {
							const currentUrl = new URL(opener.location.href);
							if (!opener.closed && currentUrl.origin === location.origin &&
								currentUrl.pathname.endsWith("/projects.html") &&
								opener.document.visibilityState === "visible" && opener.document.hasFocus()) {
								window.close();
								setTimeout(() => { location.href = target; }, 400);
								return;
							}
						} catch (error) {
							// The opener may have closed or navigated to another origin.
						}
						location.href = target;
					}, 200);
					return;
				}
			}
		} catch (error) {
			// An inaccessible opener cannot be confirmed as the projects page.
		}
		location.href = target;
	});

	function drawContactIcon(pdf, type, x, y) {
		pdf.setDrawColor("#405677");
		pdf.setTextColor("#405677");
		pdf.setLineWidth(0.8);
		if (type === "email") {
			pdf.roundedRect(x, y - 8, 11, 8, 1, 1);
			pdf.line(x, y - 8, x + 5.5, y - 4);
			pdf.line(x + 11, y - 8, x + 5.5, y - 4);
		} else if (type === "phone") {
			pdf.setFillColor("#405677");
			pdf.path([
				{ op: "m", c: [x + 2, y - 10] },
				{ op: "c", c: [x, y - 9, x + 1, y - 5, x + 3, y - 3] },
				{ op: "c", c: [x + 5, y - 1, x + 8, y + 1, x + 10, y - 1] },
				{ op: "l", c: [x + 11, y - 3] },
				{ op: "l", c: [x + 8, y - 5] },
				{ op: "l", c: [x + 6.5, y - 3.5] },
				{ op: "c", c: [x + 5, y - 4, x + 3.5, y - 5.5, x + 3, y - 7] },
				{ op: "l", c: [x + 4.5, y - 8] },
				{ op: "l", c: [x + 3, y - 10.5] },
				{ op: "h", c: [] }
			]).fill();
		} else if (type === "linkedin") {
			pdf.setFillColor("#405677");
			pdf.roundedRect(x, y - 10, 11, 11, 1, 1, "F");
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(7);
			pdf.setTextColor("#ffffff");
			pdf.text("in", x + 2.3, y - 1.5);
		} else {
			pdf.circle(x + 5.5, y - 4.5, 5);
			pdf.line(x + 0.8, y - 4.5, x + 10.2, y - 4.5);
			pdf.ellipse(x + 5.5, y - 4.5, 2.1, 5);
		}
		pdf.setTextColor("#111111");
		pdf.setFont("times", "normal");
		pdf.setFontSize(10);
	}

	function requireContent(project, index) {
		const content = project.portfolioPdf;
		const label = project.title || `Project ${index + 1}`;
		const hasText = (value) => typeof value === "string" && value.trim().length > 0;
		if (!content || !hasText(content.title) || !hasText(content.summary) ||
			!Array.isArray(content.highlights) || !content.highlights.length ||
			content.highlights.some((item) => !hasText(item)) ||
			!Array.isArray(content.images) || content.images.length < 1 || content.images.length > 6 ||
			content.images.some((image) => !image || !hasText(image.src) || !hasText(image.caption))) {
			throw new Error(`${label} needs a title, summary, highlights, and one to six captioned images in portfolioPdf.`);
		}
		return content;
	}

	function loadImage(image) {
		return new Promise((resolve, reject) => {
			const element = new Image();
			element.onload = () => resolve(element);
			element.onerror = () => reject(new Error(`Could not load portfolio image: ${image.src}`));
			element.src = image.src;
		});
	}

	function addWrappedText(pdf, text, x, y, width, size, lineHeight, maxY) {
		pdf.setFontSize(size);
		const lines = pdf.splitTextToSize(text, width);
		if (y + (lines.length - 1) * lineHeight > maxY) {
			throw new Error(`Portfolio text does not fit: "${text}". Shorten this project copy or caption.`);
		}
		pdf.text(lines, x, y, { lineHeightFactor: lineHeight / size });
		return y + lines.length * lineHeight;
	}

	function drawPage(pdf, project, content, images, index, total) {
		const contact = window.getResumeContactDetails();
		pdf.setTextColor("#111111");
		pdf.setFont("times", "bold");
		pdf.setFontSize(25);
		pdf.text("Taya Powell", margin, 63);
		pdf.setFont("times", "normal");
		pdf.setFontSize(10);
		drawContactIcon(pdf, "email", 334, 32);
		pdf.textWithLink(contact.email, 350, 32, { url: `mailto:${contact.email}` });
		drawContactIcon(pdf, "phone", 334, 47);
		pdf.textWithLink(contact.phone, 350, 47, { url: `tel:${contact.phone}` });
		drawContactIcon(pdf, "linkedin", 334, 62);
		pdf.textWithLink("linkedin.com/in/tayarpowell2828", 350, 62,
			{ url: "https://www.linkedin.com/in/tayarpowell2828/" });
		drawContactIcon(pdf, "website", 334, 77);
		pdf.textWithLink("tayapowell.fyi", 350, 77, { url: "https://tayapowell.fyi/" });
		pdf.setDrawColor("#111111");
		pdf.setLineWidth(0.8);
		pdf.line(margin, 91, pageWidth - margin, 91);

		pdf.setFont("times", "normal");
		let y = addWrappedText(pdf, content.title, margin, 117, contentWidth, 20, 23, 140);
		pdf.setTextColor("#444444");
		const metadata = [project.type, project.date].filter(Boolean).join(" | ").replace(/\s*·\s*/g, " | ");
		y = addWrappedText(pdf, metadata, margin, y + 1, contentWidth, 10, 12, 166);
		pdf.setTextColor("#111111");
		y = addWrappedText(pdf, `Project objective: ${content.summary}`, margin, y + 14, contentWidth, 12, 15, 238);
		const approach = content.highlights.slice(0, -1).join(" ");
		if (approach) {
			y = addWrappedText(pdf, `Approach: ${approach}`, margin, y + 5, contentWidth, 12, 15, 280);
		}
		const columns = images.length === 1 ? 1 : Math.min(3, images.length);
		const gap = 12;
		const width = (contentWidth - gap * (columns - 1)) / columns;
		const rows = Math.ceil(images.length / columns);
		const imageTop = y + 10;
		// Reserve space for each row's longest caption and the closing impact;
		// the remaining height is shared equally by the image rows.
		pdf.setFontSize(9);
		const captionLines = content.images.map((image) => pdf.splitTextToSize(image.caption, width).length);
		const rowCaptions = Array.from({ length: rows }, (_, row) =>
			Math.max(...captionLines.slice(row * columns, (row + 1) * columns)));
		pdf.setFontSize(12);
		const impactText = `Project impact: ${content.highlights[content.highlights.length - 1]}`;
		const impactLines = pdf.splitTextToSize(impactText, contentWidth).length;
		const impactEnd = 717;
		const gridEnd = impactEnd - (impactLines - 1) * 15 - 20;
		const captionHeight = rowCaptions.reduce((sum, lines) => sum + 12 + (lines - 1) * 10.5, 0);
		const imageHeight = (gridEnd - imageTop - captionHeight - (rows - 1) * 14) / rows;
		if (imageHeight < 75) throw new Error(`${content.title}: project copy and captions leave too little room for images.`);
		let rowTop = imageTop;
		images.forEach((image, imageIndex) => {
			const x = margin + (imageIndex % columns) * (width + gap);
			const row = Math.floor(imageIndex / columns);
			const scale = Math.min(width / image.naturalWidth, imageHeight / image.naturalHeight);
			const drawWidth = image.naturalWidth * scale;
			const drawHeight = image.naturalHeight * scale;
			pdf.addImage(image, undefined, x + (width - drawWidth) / 2,
				rowTop + (imageHeight - drawHeight) / 2, drawWidth, drawHeight);
			pdf.setFont("times", "normal");
			addWrappedText(pdf, content.images[imageIndex].caption, x, rowTop + imageHeight + 12,
				width, 9, 10.5, gridEnd);
			if (imageIndex % columns === columns - 1 || imageIndex === images.length - 1) {
				rowTop += imageHeight + 12 + (rowCaptions[row] - 1) * 10.5 + 14;
			}
		});

		pdf.setFont("times", "normal");
		addWrappedText(pdf, impactText, margin, rowTop + 6, contentWidth, 12, 15, impactEnd + 1);
		pdf.setFontSize(9);
		pdf.setTextColor("#444444");
		pdf.textWithLink("View the full project portfolio", margin, 752,
			{ url: `https://tayapowell.fyi/projects.html#${encodeURIComponent(project.id)}` });
		pdf.text(`${index + 1} / ${total}`, pageWidth - margin, 752, { align: "right" });
	}

	// Like the resume viewer, narrow screens use readable, reflowing HTML.
	// Use the same curated text, image order, and destinations as the PDF.
	function renderMobilePreview(projects, contents) {
		const contact = window.getResumeContactDetails();
		const fragment = document.createDocumentFragment();
		function add(parent, tag, className, text) {
			const node = document.createElement(tag);
			if (className) node.className = className;
			if (text) node.textContent = text;
			parent.appendChild(node);
			return node;
		}
		projects.forEach((project, index) => {
			const content = contents[index];
			const article = add(fragment, "article", "portfolio-sheet");
			const header = add(article, "header", "portfolio-sheet-header");
			add(header, "h2", "portfolio-name", "Taya Powell");
			const contacts = add(header, "div", "portfolio-contacts");
			[
				["Email", contact.email, `mailto:${contact.email}`],
				["Phone", contact.phone, `tel:${contact.phone}`],
				["LinkedIn", "linkedin.com/in/tayarpowell2828", "https://www.linkedin.com/in/tayarpowell2828/"],
				["Website", "tayapowell.fyi", "https://tayapowell.fyi/"]
			].forEach(([label, text, href]) => {
				const row = add(contacts, "div", "portfolio-contact");
				if (label !== "Email" && label !== "Phone") add(row, "strong", "", `${label}: `);
				const link = add(row, "a", "", text);
				link.href = href;
				if (label === "Email" || label === "Phone") link.setAttribute("aria-label", `${label}: ${text}`);
			});
			add(article, "h3", "portfolio-title", content.title);
			add(article, "p", "portfolio-meta", [project.type, project.date].filter(Boolean).join(" | ").replace(/\s*·\s*/g, " | "));
			add(article, "p", "", `Project objective: ${content.summary}`);
			const approach = content.highlights.slice(0, -1).join(" ");
			if (approach) add(article, "p", "", `Approach: ${approach}`);
			const gallery = add(article, "div", "portfolio-images");
			content.images.forEach((image) => {
				const figure = add(gallery, "figure");
				const picture = add(figure, "img");
				picture.src = image.src;
				picture.alt = image.caption;
				add(figure, "figcaption", "", image.caption);
			});
			add(article, "p", "", `Project impact: ${content.highlights[content.highlights.length - 1]}`);
			const footer = add(article, "footer", "portfolio-sheet-footer");
			add(footer, "a", "", "View the full project portfolio").href = `projects.html#${encodeURIComponent(project.id)}`;
			add(footer, "span", "", `${index + 1} / ${projects.length}`);
		});
		mobilePreview.replaceChildren(fragment);
	}

	async function renderPortfolio() {
		try {
			if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("The PDF library could not be loaded.");
			if (typeof window.getResumeContactDetails !== "function") throw new Error("Contact details could not be loaded.");
			if (!Array.isArray(window.PROJECTS) || !window.PROJECTS.length) {
				throw new Error("The project portfolio could not be loaded.");
			}
			const projects = window.PROJECTS;
			window.validateProjectIds(projects);
			const content = projects.map(requireContent);
			// Finish loading and validating every page before exposing any PDF.
			const images = await Promise.all(content.map((entry) => Promise.all(entry.images.map(loadImage))));
			const pdf = new window.jspdf.jsPDF({ unit: "pt", format: "letter", compress: true });
			projects.forEach((project, index) => {
				if (index) pdf.addPage();
				drawPage(pdf, project, content[index], images[index], index, projects.length);
			});
			renderMobilePreview(projects, content);
			const pdfBlob = pdf.output("blob");
			const downloadUrl = URL.createObjectURL(pdfBlob);
			downloadLink.href = downloadUrl;
			openPdf.href = downloadUrl;
			if (isMobileDevice) {
				setupSharePrint(pdfBlob);
				sharePrint.hidden = false;
			} else {
				downloadLink.hidden = false;
				openPdf.hidden = false;
			}
			mobilePreview.hidden = false;
			const mobileLayout = matchMedia("(max-width: 849.98px)");
			function updatePreview() {
				preview.hidden = mobileLayout.matches;
				if (!mobileLayout.matches) preview.src = downloadUrl;
				else preview.removeAttribute("src");
			}
			mobileLayout.addEventListener("change", updatePreview);
			updatePreview();
			status.textContent = isMobileDevice
				? "If the preview is unavailable, use Share / Print."
				: "If the preview is unavailable in your browser, use Open PDF / Print or Download PDF.";
			status.classList.add("portfolio-preview-help");
		} catch (error) {
			console.error("Portfolio PDF could not be generated:", error);
			status.textContent = `The portfolio PDF could not be generated. ${error.message}`;
		}
	}
	renderPortfolio();
})();
