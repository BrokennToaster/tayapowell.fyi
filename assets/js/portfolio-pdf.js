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
	const preview = document.getElementById("portfolio-preview");
	const back = document.getElementById("portfolio-back");
	if (!status || !downloadLink || !openPdf || !preview || !back) return;

	const pageWidth = 612;
	const margin = 40;
	const contentWidth = pageWidth - margin * 2;
	back.addEventListener("click", (event) => {
		event.preventDefault();
		try {
			if (window.opener && !window.opener.closed) {
				const openerUrl = new URL(window.opener.location.href);
				if (openerUrl.origin === location.origin && openerUrl.pathname.endsWith("/projects.html")) {
					window.opener.focus();
					window.close();
					setTimeout(() => { location.href = back.href; }, 400);
					return;
				}
			}
		} catch (error) {
			// A cross-origin opener cannot be used as the projects page.
		}
		location.href = back.href;
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
			{ url: `https://tayapowell.fyi/projects.html#project-${index + 1}` });
		pdf.text(`${index + 1} / ${total}`, pageWidth - margin, 752, { align: "right" });
	}

	async function renderPortfolio() {
		try {
			if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("The PDF library could not be loaded.");
			if (typeof window.getResumeContactDetails !== "function") throw new Error("Contact details could not be loaded.");
			if (!Array.isArray(window.PROJECTS) || !window.PROJECTS.length) {
				throw new Error("The project portfolio could not be loaded.");
			}
			const projects = window.PROJECTS;
			const content = projects.map(requireContent);
			// Finish loading and validating every page before exposing any PDF.
			const images = await Promise.all(content.map((entry) => Promise.all(entry.images.map(loadImage))));
			const pdf = new window.jspdf.jsPDF({ unit: "pt", format: "letter", compress: true });
			projects.forEach((project, index) => {
				if (index) pdf.addPage();
				drawPage(pdf, project, content[index], images[index], index, projects.length);
			});
			const downloadUrl = URL.createObjectURL(pdf.output("blob"));
			downloadLink.href = downloadUrl;
			downloadLink.hidden = false;
			openPdf.href = downloadUrl;
			openPdf.hidden = false;
			preview.src = downloadUrl;
			preview.hidden = false;
			status.textContent = "If the preview is unavailable in your browser, use Open PDF / Print or Download PDF.";
		} catch (error) {
			console.error("Portfolio PDF could not be generated:", error);
			status.textContent = `The portfolio PDF could not be generated. ${error.message}`;
		}
	}
	renderPortfolio();
})();
