/*
 * The same script has two modes, selected by ?resume-viewer in the URL:
 * - Main page: coordinate opening and closing the separate viewer tab.
 * - Viewer: read the latest resume, build a printable HTML view, and generate
 *   or reuse a one-page PDF. The source content lives in index.html.
 *
 * Follow the resume editorial and validation procedure in README.md when
 * changing source content or regenerating the resume after new material.
 * When changing PDF layout or generation, increment pdfTemplateVersion so an
 * older cached PDF is not reused. Also bump this script's ?v= in index.html.
 */
(() => {
	const channelName = "taya-resume-viewer";
	if (!new URLSearchParams(window.location.search).has("resume-viewer")) {
		// Main site: open the viewer from script so this tab can always close it again.
		const button = document.querySelector(".resume-print-button");
		if (button && window.BroadcastChannel) {
			let viewerWindow = null;
			const channel = new BroadcastChannel(channelName);
			button.addEventListener("click", (event) => {
				const opened = window.open(button.href, "resume-viewer-tab");
				if (opened) {
					event.preventDefault();
					viewerWindow = opened;
				}
			});
			channel.addEventListener("message", (message) => {
				if (message.data === "close-viewer" && viewerWindow) {
					viewerWindow.close();
					viewerWindow = null;
					channel.postMessage("viewer-closed");
				}
			});
		}
		return;
	}

	// Letter-page geometry is measured in PDF points (72 points per inch).
	// The template version is part of the cache fingerprint, not a date check.
	const pageWidth = 612;
	const pageHeight = 792;
	const margin = 28;
	const contentWidth = pageWidth - margin * 2;
	const bottomLimit = pageHeight - margin;
	const pdfTemplateVersion = "2026-11-07-v26";
	const pdfCacheKey = "taya-powell-resume-pdf-v4";
	let lastFingerprint = "";
	let lastPdfBlob = null;

	// The selectors below are the contract with index.html. If its section IDs,
	// job structure, or class names change, update these selectors too.
	// Only marked experience bullets are used when any are marked; an attribute
	// value overrides the website text. Otherwise the first three are used.
	function readPageContent(root = document) {
		const text = (selector) => root.querySelector(selector)?.innerText.trim() || "";
		const list = (selector) => Array.from(root.querySelectorAll(selector), (item) => item.innerText.trim());
		const contact = window.getResumeContactDetails?.() || {};
		const contactItems = Array.from(root.querySelectorAll(".resume-contact-list li"));
		const location = contactItems[0]?.innerText.trim() || "";
		const linkedIn = root.querySelector('.resume-contact-list a[href*="linkedin.com"]')?.href || "";
		const skills = Array.from(root.querySelectorAll("#technical-skills li"),
			(item) => item.getAttribute("data-resume-pdf")?.trim() || item.innerText.trim());
		const languages = list(".resume-lang-name");
		const certifications = list("#certifications li");
		const experience = Array.from(root.querySelectorAll("#experience article"), (article) => {
			const dates = article.querySelectorAll(".resume-timeline-item-header .resume-position-time");
			const allBullets = Array.from(article.querySelectorAll(".resume-timeline-item-desc > ul > li"));
			const selectedBullets = allBullets.filter((item) => item.hasAttribute("data-resume-pdf"));
			return {
				title: article.querySelector(".resume-position-title")?.innerText.trim() || "",
				company: article.querySelector(".resume-company-name")?.innerText.trim() || "",
				date: dates[0]?.innerText.trim() || "",
				location: dates[1]?.innerText.trim() || "",
				bullets: (selectedBullets.length ? selectedBullets : allBullets.slice(0, 3))
					.map((item) => item.getAttribute("data-resume-pdf")?.trim() || item.innerText.trim())
			};
		});
		const projects = Array.from(root.querySelectorAll("#projects .resume-project-entry"), (article) => ({
			title: article.querySelector(".item-heading")?.innerText.trim() || "",
			type: article.querySelector(".resume-project-type")?.innerText.trim() || "",
			bullets: Array.from(article.querySelectorAll(".resume-timeline-list > li"), (item) => item.innerText.trim())
		}));
		const education = Array.from(root.querySelectorAll("#education li"))
			.map((item) => ({
				degree: item.querySelector(".resume-degree")?.innerText.trim() || "",
				organization: item.querySelector(".resume-degree-org")?.innerText.trim() || "",
				date: item.querySelector(".resume-degree-time")?.innerText.trim() || "",
				recognition: item.querySelector(".resume-degree-highlight")?.innerText.trim() || ""
			}))
			.filter((item) => item.degree.includes("Mechanical Engineering"));

		const polish = (value) => {
			if (typeof value === "string") {
				return value.replace(/(\w)'(\w)/g, "$1\u2019$2");
			}
			if (Array.isArray(value)) return value.map(polish);
			if (value && typeof value === "object") {
				return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, polish(item)]));
			}
			return value;
		};

		const content = polish({
			name: text(".resume-name"),
			role: text(".resume-role-title"),
			specialties: text(".resume-specialties").replace(/\s*·\s*/g, " | "),
			location,
			phone: contact.phone || "",
			email: contact.email || "",
			linkedIn,
			website: "tayapowell.fyi",
			languages,
			summary: text(".resume-summary-desc"),
			skills,
			certifications,
			experience,
			projects,
			education
		});
		// The summary is the site's text, not a separately edited PDF variant.
		content.summary = text(".resume-summary-desc");
		return content;
	}

	// Fetch a fresh same-origin page before checking the PDF cache. A unique
	// query parameter and no-store avoid reusing a stale response. If the fetch
	// fails, the already-loaded page remains the fallback source.
	async function readLatestPageContent() {
		try {
			const sourceUrl = new URL(window.location.href);
			sourceUrl.searchParams.delete("resume-viewer");
			sourceUrl.searchParams.delete("resume-version");
			sourceUrl.searchParams.set("_resume-check", Date.now().toString());
			const response = await fetch(sourceUrl.href, { cache: "no-store" });
			if (!response.ok) throw new Error("Resume source could not be refreshed.");
			const sourceDocument = new DOMParser().parseFromString(await response.text(), "text/html");
			if (!sourceDocument.querySelector(".resume-name")) throw new Error("Resume source was not found.");
			return readPageContent(sourceDocument);
		} catch (error) {
			return readPageContent(document);
		}
	}

	function escapeHtml(value) {
		return String(value ?? "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	function getRoleLine(content) {
		return `${content.role} | Product Development | Design & Prototyping`.toUpperCase();
	}

	// Measure text and collect drawing operations before creating the final PDF.
	// prepareLayout() repeats this plan at a smaller scale until it fits one page.
	function createLayout(pdf, content, scale) {
		const operations = [];
		let y = 28;

		function addText(value, options = {}) {
			if (!value) {
				return;
			}

			const size = (options.size || 8.2) * scale;
			const indent = (options.indent || 0) * scale;
			pdf.setFont("helvetica", options.style || "normal");
			pdf.setFontSize(size);
			const lines = pdf.splitTextToSize(value, contentWidth - indent);
			operations.push({
				type: "text",
				lines,
				x: margin + indent,
				y,
				size,
				style: options.style || "normal",
				color: options.color || "#202a38",
				align: options.align || "left",
				width: contentWidth - indent,
				headingLevel: options.headingLevel
			});
			y += lines.length * size * 1.18 + (options.after || 0) * scale;
		}

		function addSection(title) {
			y += 10 * scale;
			addText(title.toUpperCase(), { size: 9.6, style: "bold", align: "center", after: 5, color: "#161d28", headingLevel: 2 });
		}

		function addSkill(value) {
			const colon = value.indexOf(":");
			if (colon < 0) {
				addText(value, { size: 8.1, after: 1.2 });
				return;
			}
			const label = value.slice(0, colon + 1);
			const body = value.slice(colon + 1).trim();
			const size = 8.1 * scale;
			pdf.setFontSize(size);
			pdf.setFont("helvetica", "bold");
			const labelWidth = pdf.getTextWidth(label);
			pdf.setFont("helvetica", "normal");
			const indent = labelWidth + (body ? pdf.getTextWidth(" ") : 0);
			if (indent >= contentWidth) {
				addText(value, { size: 8.1, after: 1.2 });
				return;
			}
			const lines = body ? pdf.splitTextToSize(body, contentWidth, { textIndent: indent }) : [];
			operations.push({ type: "skill", label, lines, indent, x: margin, y, size, color: "#202a38" });
			y += Math.max(1, lines.length) * size * 1.18 + 1.2 * scale;
		}

		function addBullet(value) {
			if (!value) {
				return;
			}
			const size = 8.1 * scale;
			const indent = 10 * scale;
			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(size);
			const lines = pdf.splitTextToSize(value, contentWidth - indent);
			operations.push({
				type: "bullet",
				lines,
				x: margin + indent,
				bulletX: margin,
				y,
				size,
				color: "#202a38"
			});
			y += lines.length * size * 1.16 + 1.1 * scale;
		}

		function addSideLabel(title, label) {
			const size = 8.4 * scale;
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(size);
			const labelWidth = label ? pdf.getTextWidth(label) + 10 * scale : 0;
			const lines = pdf.splitTextToSize(title, contentWidth - labelWidth);
			operations.push({
				type: "side-label",
				lines,
				label,
				x: margin,
				rightX: margin + contentWidth,
				y,
				size,
				style: "bold",
				color: "#172131",
				labelColor: "#58677a"
			});
			y += lines.length * size * 1.17 + 1.4 * scale;
		}

		function addExperienceHeading(job) {
			const size = 8.6 * scale;
			const dateSize = 7.6 * scale;
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(size);
			pdf.setTextColor("#172131");
			pdf.setFontSize(dateSize);
			const dateWidth = pdf.getTextWidth(job.date) + 8 * scale;
			pdf.setFontSize(size);
			const title = `${job.title} | ${job.company}`;
			const lines = pdf.splitTextToSize(title, contentWidth - dateWidth);
			operations.push({
				type: "experience-heading",
				lines,
				date: job.date,
				x: margin,
				rightX: margin + contentWidth,
				y,
				size,
				dateSize,
				style: "bold",
				color: "#172131",
				dateColor: "#58677a"
			});
			y += lines.length * size * 1.16 + 1.2 * scale;
			if (job.location) {
				addText(job.location, { size: 7.3, color: "#58677a", after: 1.2 });
			}
		}

		addText(content.name, { size: 16, style: "bold", align: "center", color: "#111820", after: 1, headingLevel: 1 });
		const contactParts = [
			{ text: content.location },
			{ text: content.phone },
			{ text: content.email },
			{ text: content.linkedIn ? "LinkedIn" : "", url: content.linkedIn },
			{ text: content.website, url: content.website ? `https://${content.website}` : "" }
		].filter((part) => part.text);
		if (contactParts.length) {
			const contactSize = 7.8 * scale;
			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(contactSize);
			const parts = contactParts.map((part, index) => {
				const text = part.text + (index < contactParts.length - 1 ? " | " : "");
				return {
					text,
					url: part.url,
					width: pdf.getTextWidth(text),
					linkWidth: part.url ? pdf.getTextWidth(part.text) : 0
				};
			});
			operations.push({
				type: "contact",
				parts,
				width: parts.reduce((total, part) => total + part.width, 0),
				y,
				size: contactSize,
				color: "#39485b"
			});
			y += contactSize * 1.18 + 12 * scale;
		}
		addText(getRoleLine(content), { size: 9, style: "bold", align: "center", color: "#0f1a2c", after: 0.3 });

		addSection("Professional Summary");
		addText(content.summary, { size: 8.1, after: 1 });

		addSection("Engineering Experience");
		content.experience.forEach((job, index) => {
			if (index) y += 8 * scale;
			addExperienceHeading(job);
			job.bullets.forEach(addBullet);
		});

		addSection("Technical Skills");
		content.skills.forEach(addSkill);
		if (content.languages.length) {
			addSkill(`Languages: ${content.languages.join(", ")}`);
		}

		if (content.certifications.length) {
			addSection("Certifications");
			content.certifications.forEach(addBullet);
		}

		addSection("Projects");
		content.projects.forEach((project, index) => {
			if (index) y += 10 * scale;
			addSideLabel(project.title, project.type);
			project.bullets.forEach(addBullet);
		});

		if (content.education.length) {
			addSection("Education");
			content.education.forEach((item) => {
				addExperienceHeading({
					title: item.degree,
					company: item.organization,
					date: item.date,
					location: ""
				});
				if (item.recognition) {
					addBullet(item.recognition);
				}
				y += 2.5 * scale;
			});
		}

		return { operations, endY: y };
	}

	// Center the visible text vertically without changing its line breaks or
	// the spacing between sections. Measure the same Arial glyphs as the preview.
	function centerLayout(layout) {
		const context = document.createElement("canvas").getContext("2d");
		if (!context) throw new Error("Resume text could not be measured.");
		let top = Infinity;
		let bottom = -Infinity;
		function measure(value, y, size, bold = false) {
			if (!value) return;
			context.font = `${bold ? "bold" : "normal"} ${size}px Arial`;
			const bounds = context.measureText(value);
			top = Math.min(top, y - bounds.actualBoundingBoxAscent);
			bottom = Math.max(bottom, y + bounds.actualBoundingBoxDescent);
		}
		layout.operations.forEach((operation) => {
			if (operation.lines) {
				const bold = operation.style === "bold";
				operation.lines.forEach((line, index) =>
					measure(line, operation.y + index * operation.size * 1.15, operation.size, bold));
			}
			if (operation.type === "contact") {
				operation.parts.forEach((part) => measure(part.text, operation.y, operation.size));
			} else if (operation.type === "skill") {
				measure(operation.label, operation.y, operation.size, true);
			} else if (operation.type === "experience-heading") {
				measure(operation.date, operation.y, operation.dateSize);
			} else if (operation.type === "side-label") {
				measure(operation.label, operation.y, operation.size - 0.7);
			}
		});
		if (!Number.isFinite(top) || !Number.isFinite(bottom)) {
			throw new Error("Resume text bounds could not be measured.");
		}
		const offset = (pageHeight - top - bottom) / 2;
		layout.operations.forEach((operation) => { operation.y += offset; });
	}

	// Render the measured operations using jsPDF's text, link, and line primitives.
	function drawLayout(pdf, operations) {
		operations.forEach((operation) => {
			if (operation.type === "rule") {
				pdf.setDrawColor(172, 181, 192);
				pdf.setLineWidth(0.35);
				pdf.line(operation.x, operation.y, operation.x + operation.width, operation.y);
				return;
			}

			pdf.setFont("helvetica", operation.style || "normal");
			pdf.setFontSize(operation.size);
			pdf.setTextColor(operation.color || "#202a38");

			if (operation.type === "contact") {
				let x = (pageWidth - operation.width) / 2;
				pdf.setDrawColor(operation.color);
				pdf.setLineWidth(0.45);
				operation.parts.forEach((part) => {
					pdf.text(part.text, x, operation.y);
					if (part.url) {
						const underlineY = operation.y + operation.size * 0.15;
						pdf.line(x, underlineY, x + part.linkWidth, underlineY);
						pdf.link(x, operation.y - operation.size, part.linkWidth, operation.size * 1.2, { url: part.url });
					}
					x += part.width;
				});
				return;
			}

			if (operation.type === "bullet") {
				pdf.text("-", operation.bulletX, operation.y);
				pdf.text(operation.lines, operation.x, operation.y);
				return;
			}

			if (operation.type === "skill") {
				pdf.setFont("helvetica", "bold");
				pdf.text(operation.label, operation.x, operation.y);
				pdf.setFont("helvetica", "normal");
				operation.lines.forEach((line, index) => {
					pdf.text(line, operation.x + (index === 0 ? operation.indent : 0),
						operation.y + index * operation.size * 1.15);
				});
				return;
			}

			if (operation.type === "experience-heading") {
				pdf.text(operation.lines, operation.x, operation.y);
				pdf.setFont("helvetica", "normal");
				pdf.setFontSize(operation.dateSize);
				pdf.setTextColor(operation.dateColor);
				pdf.text(operation.date, operation.rightX, operation.y, { align: "right" });
				return;
			}

			if (operation.type === "side-label") {
				pdf.text(operation.lines, operation.x, operation.y);
				if (operation.label) {
					pdf.setFont("helvetica", "normal");
					pdf.setFontSize(operation.size - 0.7);
					pdf.setTextColor(operation.labelColor);
					pdf.text(operation.label, operation.rightX, operation.y, { align: "right" });
				}
				return;
			}

			pdf.text(operation.lines, operation.align === "center" ? pageWidth / 2 : operation.x, operation.y, {
				align: operation.align || "left",
				maxWidth: operation.width
			});
		});
	}

	// Use one measured layout for the PDF, full-width preview, and print view.
	// If it cannot fit, retain the responsive HTML fallback rather than dropping content.
	function prepareLayout(content) {
		const { jsPDF } = window.jspdf || {};
		if (!jsPDF) {
			throw new Error("The PDF library did not load.");
		}

		const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter", compress: true });
		let scale = 1.25;
		let layout = createLayout(pdf, content, scale);

		while (layout.endY > bottomLimit && scale > 0.74) {
			scale -= 0.02;
			layout = createLayout(pdf, content, scale);
		}

		if (layout.endY > bottomLimit) {
			throw new Error("The selected resume content no longer fits on one page.");
		}
		centerLayout(layout);
		return { pdf, layout };
	}

	function generatePdf(content, pdf, layout) {
		drawLayout(pdf, layout.operations);
		if (pdf.internal.getNumberOfPages() !== 1) {
			throw new Error("The generated resume must be exactly one page.");
		}
		pdf.setProperties({
			author: content.name,
			title: `${content.name} | ${content.role}`,
			subject: "Engineering resume"
		});
		return pdf.output("blob");
	}

	// SVG uses the same text baselines, line breaks, and link bounds as jsPDF.
	// Its scalable letter page is shown on desktop and used for browser printing.
	function renderLayoutSvg(layout) {
		const esc = escapeHtml;
		const text = (value, x, y, size, color, options = {}) => {
			const anchor = options.align === "center" ? "middle" : options.align === "right" ? "end" : "start";
			const weight = options.bold ? "bold" : "normal";
			const lines = Array.isArray(value) ? value : [value];
			const spans = lines.map((line, index) =>
				`<tspan x="${x}" y="${y + index * size * 1.15}">${esc(line)}</tspan>`).join("");
			const heading = options.headingLevel ? ` role="heading" aria-level="${options.headingLevel}"` : "";
			return `<text font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" aria-label="${esc(lines.join(" "))}"${heading} xml:space="preserve">${spans}</text>`;
		};
		const elements = layout.operations.map((operation) => {
			if (operation.type === "contact") {
				let x = (pageWidth - operation.width) / 2;
				return operation.parts.map((part) => {
					const label = text(part.text, x, operation.y, operation.size, operation.color);
					let link = "";
					if (part.url) {
						const underlineY = operation.y + operation.size * 0.15;
						link = `<a href="${esc(part.url)}" target="_blank" rel="noopener" aria-label="${esc(part.text.trim().replace(/\s*\|$/, ""))}"><line x1="${x}" y1="${underlineY}" x2="${x + part.linkWidth}" y2="${underlineY}" stroke="${operation.color}" stroke-width="0.45"/><rect x="${x}" y="${operation.y - operation.size}" width="${part.linkWidth}" height="${operation.size * 1.2}" fill="transparent"/></a>`;
					}
					x += part.width;
					return label + link;
				}).join("");
			}
			if (operation.type === "bullet") {
				return text("-", operation.bulletX, operation.y, operation.size, operation.color)
					+ text(operation.lines, operation.x, operation.y, operation.size, operation.color);
			}
			if (operation.type === "skill") {
				return text(operation.label, operation.x, operation.y, operation.size, operation.color, { bold: true })
					+ operation.lines.map((line, index) => text(line, operation.x + (index === 0 ? operation.indent : 0),
						operation.y + index * operation.size * 1.15, operation.size, operation.color)).join("");
			}
			if (operation.type === "experience-heading" || operation.type === "side-label") {
				const heading = text(operation.lines, operation.x, operation.y, operation.size, operation.color, { bold: true });
				const label = operation.type === "experience-heading" ? operation.date : operation.label;
				const size = operation.type === "experience-heading" ? operation.dateSize : operation.size - 0.7;
				const color = operation.dateColor || operation.labelColor;
				return heading + (label ? text(label, operation.rightX, operation.y, size, color, { align: "right" }) : "");
			}
			if (operation.type === "text") {
				const x = operation.align === "center" ? pageWidth / 2 : operation.x;
				return text(operation.lines, x, operation.y, operation.size, operation.color,
					{ align: operation.align, bold: operation.style === "bold", headingLevel: operation.headingLevel });
			}
			return "";
		}).join("");
		return `<svg class="resume-page" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pageWidth} ${pageHeight}" font-family="Arial, Helvetica, sans-serif" aria-label="Resume">${elements}</svg>`;
	}

	// Cache identity includes both normalized resume content and template version.
	// SHA-256 is preferred; the smaller fallback hash supports older browsers.
	async function getContentFingerprint(content) {
		const source = JSON.stringify({ version: pdfTemplateVersion, content });
		if (window.crypto?.subtle && window.TextEncoder) {
			const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
			return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
		}

		let hash = 2166136261;
		for (let index = 0; index < source.length; index += 1) {
			hash ^= source.charCodeAt(index);
			hash = Math.imul(hash, 16777619);
		}
		return `${source.length}-${(hash >>> 0).toString(16)}`;
	}

	async function blobToBase64(blob) {
		const bytes = new Uint8Array(await blob.arrayBuffer());
		let binary = "";
		for (let offset = 0; offset < bytes.length; offset += 0x8000) {
			binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
		}
		return btoa(binary);
	}

	function base64ToPdfBlob(encoded) {
		const binary = atob(encoded);
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index += 1) {
			bytes[index] = binary.charCodeAt(index);
		}
		return new Blob([bytes], { type: "application/pdf" });
	}

	// First check the in-memory PDF, then persistent browser storage. A matching
	// fingerprint permits reuse; any content or template change regenerates it.
	// If storage is unavailable, the in-memory PDF still works for this view.
	async function getCachedPdf(content, pdf, layout) {
		const fingerprint = await getContentFingerprint(content);
		if (fingerprint === lastFingerprint && lastPdfBlob) {
			return lastPdfBlob;
		}

		try {
			const cached = JSON.parse(window.localStorage.getItem(pdfCacheKey) || "null");
			if (cached?.fingerprint === fingerprint && cached.pdf) {
				lastFingerprint = fingerprint;
				lastPdfBlob = base64ToPdfBlob(cached.pdf);
				return lastPdfBlob;
			}
		} catch (error) {
			// Storage can be unavailable for local files or private browsing.
		}

		lastPdfBlob = generatePdf(content, pdf, layout);
		lastFingerprint = fingerprint;
		try {
			const encodedPdf = await blobToBase64(lastPdfBlob);
			window.localStorage.setItem(pdfCacheKey, JSON.stringify({ fingerprint, pdf: encodedPdf }));
		} catch (error) {
			// Keep the in-memory cache when persistent storage is unavailable.
		}
		return lastPdfBlob;
	}

	const resumeLoadingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Resume</title>
<style>
	body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #e9edf2; color: #111820; font-family: Arial, Helvetica, sans-serif; }
	main { text-align: center; }
	.spinner { width: 36px; height: 36px; margin: 0 auto 14px; border: 4px solid #cfd6e0; border-top-color: #fe655c; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	h1 { margin: 0 0 6px; font-size: 15px; letter-spacing: 0.18em; text-transform: uppercase; }
	p { margin: 0; font-size: 13px; color: #58677a; }
</style>
</head>
<body>
<main><div class="spinner"></div><h1>Taya Powell</h1><p>Preparing your resume&hellip;</p></main>
</body>
</html>`;

	// Desktop and print use the measured page; narrow screens and PDF failures
	// retain a reflowing HTML resume that can be read without sideways scrolling.
	const resumeViewCss = `
	* { box-sizing: border-box; }
	html, body { margin: 0; padding: 0; }
	body { background: #e9edf2; color: #202a38; font-family: Arial, Helvetica, "Helvetica Neue", sans-serif; font-size: 13.5px; line-height: 1.45; }
	.viewer-bar { position: sticky; top: 0; z-index: 20; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 20px; background: #111820; color: #fff; box-shadow: 0 2px 10px rgba(17, 24, 32, 0.35); }
	.viewer-bar .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
	.viewer-actions { display: flex; flex-wrap: wrap; gap: 10px; }
	.vb-btn { display: inline-flex; align-items: center; justify-content: center; padding: 9px 18px; border: 1px solid transparent; border-radius: 6px; font-family: Arial, Helvetica, sans-serif; font-size: 13.5px; font-weight: 700; line-height: 1; text-decoration: none; cursor: pointer; }
	.vb-btn.primary { background: #fe655c; color: #fff; }
	.vb-btn.secondary { background: #4f6591; color: #fff; }
	.vb-btn.ghost { background: transparent; color: #cfd6e0; border-color: #39485b; }
	.vb-btn:hover { filter: brightness(1.08); }
	.vb-btn.disabled { background: #8b97ad; color: #e8ecf3; cursor: not-allowed; }
	.resume-sheet { width: 8.5in; max-width: 100%; min-height: 11in; margin: 28px auto; padding: 0.55in 0.62in; background: #fff; box-shadow: 0 8px 30px rgba(17, 24, 32, 0.18); }
	.resume-header { text-align: center; }
	.resume-header h1 { margin: 0 0 8px; color: #111820; font-size: 30px; letter-spacing: normal; }
	.resume-page { display: none; }
	.contact-line { margin: 0; color: #39485b; font-size: 12.8px; }
	.contact-line a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
	.role-line { margin: 24px 0 0; color: #0f1a2c; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; }
	.resume-section h2 { margin: 24px 0 10px; color: #161d28; font-size: 15px; letter-spacing: 0.1em; text-align: center; text-transform: uppercase; }
	.summary { margin: 0; font-size: 13.2px; }
	.plain-list { margin: 0; padding: 0; list-style: none; }
	.plain-list li { margin: 3px 0; font-size: 12.8px; }
	.bullet-list { margin: 8px 0 0; padding-left: 18px; }
	.bullet-list li { margin: 4px 0; font-size: 12.8px; }
	.entry { margin-top: 14px; }
	.entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
	.entry-title { color: #172131; font-size: 14px; font-weight: 700; }
	.entry-date, .entry-type { color: #58677a; font-size: 12.5px; white-space: nowrap; }
	.entry-location { margin: 2px 0 0; color: #58677a; font-size: 12px; }
	.edu-line { margin: 0; font-size: 13px; }
	.education-entry .bullet-list { margin-top: 6px; }
	@media (max-width: 640px) {
		.viewer-bar { padding: 8px 10px; gap: 8px; }
		.viewer-bar .brand { font-size: 11px; }
		.resume-sheet { margin: 0; padding: 18px 14px; box-shadow: none; }
		.resume-header h1 { font-size: 22px; }
		.entry-head { flex-wrap: wrap; gap: 2px 16px; }
		.entry-title { min-width: 0; overflow-wrap: normal; word-break: normal; }
		.entry-date, .entry-type { max-width: 100%; overflow-wrap: normal; word-break: normal; white-space: normal; }
	}
	@media (max-width: 360px) {
		.entry-head { display: block; }
		.entry-date, .entry-type { display: block; margin-top: 2px; }
	}
	@media (max-width: 180px) {
		.viewer-bar { padding: 6px; gap: 4px; }
		.viewer-bar .brand { font-size: 8px; letter-spacing: 0; }
		.viewer-actions { gap: 4px; }
		.vb-btn { padding: 6px; font-size: 9px; }
		.resume-sheet { padding: 8px; }
		.resume-header h1 { font-size: 14px; letter-spacing: 0; }
		.contact-line { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 4px; font-size: 9px; }
		.role-line { font-size: 9px; letter-spacing: 0; }
		.resume-section h2 { font-size: 10px; letter-spacing: 0; }
		.summary, .plain-list li, .bullet-list li, .edu-line,
		.entry-title, .entry-date, .entry-type, .entry-location {
			font-size: 9px;
		}
	}
	@media screen and (min-width: 850px) {
		.has-page .resume-sheet { display: none; }
		.has-page .resume-page { display: block; width: 8.5in; max-width: 100%; height: auto; margin: 28px auto; background: #fff; box-shadow: 0 8px 30px rgba(17, 24, 32, 0.18); }
	}
	/* The HTML fallback still prints if PDF generation is unavailable. */
	@media print {
		@page { size: letter; margin: 0; }
		body { background: #fff; font-size: 11px; line-height: 1.18; }
		.viewer-bar { display: none !important; }
		.resume-sheet { width: auto; min-height: 0; margin: 0; padding: 0.4in; box-shadow: none; }
		.has-page .resume-sheet { display: none; }
		.has-page .resume-page { display: block; width: 8.5in; height: 11in; margin: 0; }
		.resume-header h1 { margin-bottom: 5px; font-size: 24px; }
		.contact-line { font-size: 11px; }
		.role-line { margin-top: 10px; font-size: 11px; letter-spacing: 0.06em; }
		.resume-section h2 { margin: 13px 0 5px; font-size: 12px; }
		.summary, .plain-list li, .bullet-list li, .edu-line { font-size: 10.5px; }
		.plain-list li { margin: 1px 0; }
		.entry { margin-top: 8px; }
		.entry-head { display: flex; flex-wrap: nowrap; gap: 16px; }
		.entry-title { font-size: 11.5px; }
		.entry-date, .entry-type { display: inline; margin-top: 0; font-size: 10px; white-space: nowrap; }
		.entry-location { margin-top: 1px; font-size: 10px; }
		.bullet-list, .education-entry .bullet-list { margin-top: 3px; }
		.bullet-list li { margin: 1px 0; }
		.entry, .resume-header { break-inside: avoid; page-break-inside: avoid; }
	}`;

	// Escape resume text before inserting it into this generated document.
	// Punctuation provides optional contact-line break points on small screens.
	function buildResumeHtml(content, pdfDataUrl, siteUrl, pageSvg) {
		const esc = escapeHtml;
		const breakAtPunctuation = (value) => esc(value).replace(/([.@])/g, "$1<wbr>");
		const contactParts = [content.location, content.phone, content.email]
			.filter(Boolean)
			.map((part) => `<span>${breakAtPunctuation(part)}</span>`);
		if (content.linkedIn) {
			contactParts.push(`<span><a href="${esc(content.linkedIn)}" target="_blank" rel="noopener">LinkedIn</a></span>`);
		}
		if (content.website) {
			contactParts.push(`<span><a href="https://${esc(content.website)}" target="_blank" rel="noopener">${breakAtPunctuation(content.website)}</a></span>`);
		}
		const contactLine = contactParts.join(' <span aria-hidden="true">|</span> ');
		const downloadName = `${(content.name || "Resume").trim().replace(/\s+/g, "_")}_Resume.pdf`;
		const section = (title, body) => (body ? `<section class="resume-section"><h2>${esc(title)}</h2>${body}</section>` : "");
		const listItems = (items) => items.map((item) => `<li>${esc(item)}</li>`).join("");
		const summaryBody = content.summary ? `<p class="summary">${esc(content.summary)}</p>` : "";
		const skillsBody = [...content.skills, content.languages.length ? `Languages: ${content.languages.join(", ")}` : ""]
			.filter(Boolean).map((skill) => {
				const colon = skill.indexOf(":");
				return colon < 0 ? `<li>${esc(skill)}</li>`
					: `<li><strong>${esc(skill.slice(0, colon + 1))}</strong>${esc(skill.slice(colon + 1))}</li>`;
			}).join("");
		const certificationsBody = content.certifications.length ? `<ul class="bullet-list">${listItems(content.certifications)}</ul>` : "";
		const experienceBody = content.experience.map((job) => `<article class="entry">
			<div class="entry-head">
				<span class="entry-title">${esc([job.title, job.company].filter(Boolean).join(" | "))}</span>
				${job.date ? `<span class="entry-date">${esc(job.date)}</span>` : ""}
			</div>
			${job.location ? `<p class="entry-location">${esc(job.location)}</p>` : ""}
			<ul class="bullet-list">${listItems(job.bullets)}</ul>
		</article>`).join("");
		const projectsBody = content.projects.map((project) => `<article class="entry">
			<div class="entry-head">
				<span class="entry-title">${esc(project.title)}</span>
				${project.type ? `<span class="entry-type">${esc(project.type)}</span>` : ""}
			</div>
			<ul class="bullet-list">${listItems(project.bullets)}</ul>
		</article>`).join("");
		const educationBody = content.education.map((item) => `<div class="entry education-entry">
			<div class="entry-head">
				<span class="entry-title">${esc([item.degree, item.organization].filter(Boolean).join(" | "))}</span>
				${item.date ? `<span class="entry-date">${esc(item.date)}</span>` : ""}
			</div>
			${item.recognition ? `<ul class="bullet-list"><li>${esc(item.recognition)}</li></ul>` : ""}
		</div>`).join("");

		return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(content.name)} | Resume</title>
<style>${resumeViewCss}</style>
</head>
<body${pageSvg ? ' class="has-page"' : ""}>
<div class="viewer-bar">
	<span class="brand">${esc(content.name)} &mdash; Resume</span>
	<div class="viewer-actions">
		<button class="vb-btn primary" id="resume-print-btn" type="button">Print</button>
		${pdfDataUrl ? `<a class="vb-btn secondary" id="resume-download-btn" href="${esc(pdfDataUrl)}" download="${esc(downloadName)}">Download PDF</a>` : `<span class="vb-btn secondary disabled" title="The PDF could not be generated in this browser. Use Print to save a PDF instead.">Download PDF</span>`}
		<a class="vb-btn ghost" id="resume-back-btn" href="${esc(siteUrl)}">Back to Website</a>
	</div>
</div>
${pageSvg}
<main class="resume-sheet">
	<header class="resume-header">
		<h1>${esc(content.name)}</h1>
		<p class="contact-line">${contactLine}</p>
		<p class="role-line">${esc(getRoleLine(content))}</p>
	</header>
	${section("Professional Summary", summaryBody)}
	${section("Engineering Experience", experienceBody)}
	${section("Technical Skills", skillsBody ? `<ul class="plain-list">${skillsBody}</ul>` : "")}
	${section("Certifications", certificationsBody)}
	${section("Projects", projectsBody)}
	${section("Education", educationBody)}
</main>
<script>
	(function () {
		var printBtn = document.getElementById("resume-print-btn");
		var dl = document.getElementById("resume-download-btn");
		var dlName = (dl && dl.getAttribute("download")) || "Resume.pdf";
		var cachedBlob = null;
		// Detect an actual phone/tablet (not window width or touchscreen laptops), so desktop keeps Download PDF.
		var ua = navigator.userAgent || "";
		var isTouch = /Android|iPhone|iPad|iPod/i.test(ua)
			|| (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
			|| !!(navigator.userAgentData && navigator.userAgentData.mobile);
		if (isTouch && printBtn) {
			printBtn.textContent = "Share / Print";
		}
		if (isTouch && dl) {
			// Large data: URL downloads crash some mobile browsers; Share / Print covers it.
			dl.style.display = "none";
			dl.removeAttribute("download");
		}
		var fallbackPrint = function () {
			try {
				if (!window.print) {
					throw new Error("Printing is not available in this browser.");
				}
				window.print();
			} catch (error) {
				if (dl) {
					dl.click();
				} else {
					window.alert("This browser blocked printing. Use Download PDF instead.");
				}
			}
		};
		if (printBtn) {
			printBtn.addEventListener("click", function () {
				// Touch devices: open the native share sheet with the finished
				// PDF - Android and iOS both offer a Print target in it.
				// Desktop: print this view directly.
				var file = null;
				if (isTouch && cachedBlob && window.File && navigator.canShare) {
					try {
						file = new File([cachedBlob], dlName, { type: "application/pdf" });
					} catch (ignore) {
						file = null;
					}
				}
				if (file && navigator.canShare({ files: [file] })) {
					try {
						navigator.share({ files: [file], title: dlName }).catch(function (error) {
							// A dismissed sheet is fine; anything else falls back
							// to the print dialog.
							if (!error || error.name !== "AbortError") {
								fallbackPrint();
							}
						});
					} catch (error) {
						fallbackPrint();
					}
					return;
				}
				fallbackPrint();
			});
		}
		var backBtn = document.getElementById("resume-back-btn");
		if (backBtn) {
			backBtn.addEventListener("click", function (event) {
				// Ask the site tab that opened this one to close it. If no site tab
				// answers (it was closed), load the site in this tab instead.
				event.preventDefault();
				var target = backBtn.href;
				try {
					if (window.opener && !window.opener.closed) {
						window.opener.focus();
					}
				} catch (ignore) {
					// Opener is not reachable.
				}
				if (window.BroadcastChannel) {
					new BroadcastChannel("taya-resume-viewer").postMessage("close-viewer");
				}
				window.close();
				setTimeout(function () {
					window.location.href = target;
				}, 400);
			});
		}
		if (dl && window.fetch && dl.href.indexOf("data:") === 0) {
			fetch(dl.href)
				.then(function (response) {
					return response.blob();
				})
				.then(function (blob) {
					cachedBlob = blob;
				})
				.catch(function (error) {
					console.error("Resume PDF could not be prepared for sharing:", error);
				});
		}
	})();
</script>
</body>
</html>`;
	}

	// Build HTML even if PDF generation fails; in that case Download is disabled
	// but the viewer's Print action remains available.
	async function renderResumeViewer() {
		try {
			const content = await readLatestPageContent();
			let pdfDataUrl = "";
			let pageSvg = "";
			try {
				const { pdf, layout } = prepareLayout(content);
				const pdfBlob = await getCachedPdf(content, pdf, layout);
				pdfDataUrl = `data:application/pdf;base64,${await blobToBase64(pdfBlob)}`;
				pageSvg = renderLayoutSvg(layout);
			} catch (pdfError) {
				// The HTML resume and Print still work without the PDF download.
				console.error("Resume PDF unavailable:", pdfError);
			}
			const siteUrl = new URL(window.location.href);
			siteUrl.searchParams.delete("resume-viewer");
			siteUrl.hash = "";
			const html = buildResumeHtml(content, pdfDataUrl, siteUrl.href, pageSvg);
			document.open();
			document.write(html);
			document.close();
		} catch (error) {
			console.error(error);
			const detail = error && error.message ? ` (${error.message})` : "";
			window.alert(`The resume could not be opened${detail}. Please reload the page and try again.`);
		}
	}

	renderResumeViewer();
})();