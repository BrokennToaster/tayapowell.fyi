(() => {
	const button = document.querySelector("[data-resume-pdf]");
	if (!button) {
		return;
	}

	const pageWidth = 612;
	const pageHeight = 792;
	const margin = 34;
	const contentWidth = pageWidth - margin * 2;
	const bottomLimit = pageHeight - margin;
	const pdfTemplateVersion = "2026-10-05-v6";
	const pdfCacheKey = "taya-powell-resume-pdf-v4";
	let lastFingerprint = "";
	let lastPdfBlob = null;

	function readPageContent() {
		const text = (selector) => document.querySelector(selector)?.innerText.trim() || "";
		const list = (selector) => Array.from(document.querySelectorAll(selector), (item) => item.innerText.trim());
		const contact = window.getResumeContactDetails?.() || {};
		const contactItems = Array.from(document.querySelectorAll(".resume-contact-list li"));
		const location = contactItems[0]?.innerText.trim() || "";
		const linkedIn = document.querySelector('.resume-contact-list a[href*="linkedin.com"]')?.href || "";
		const skills = list("#technical-skills li");
		const languages = list(".resume-lang-name");
		const certifications = list("#certifications li");
		const experience = Array.from(document.querySelectorAll("#experience article"), (article) => {
			const dates = article.querySelectorAll(".resume-timeline-item-header .resume-position-time");
			const allBullets = Array.from(article.querySelectorAll(".resume-timeline-item-desc > ul > li"));
			const selectedBullets = allBullets.filter((item) => item.hasAttribute("data-resume-pdf"));
			return {
				title: article.querySelector(".resume-position-title")?.innerText.trim() || "",
				company: article.querySelector(".resume-company-name")?.innerText.trim() || "",
				date: dates[0]?.innerText.trim() || "",
				location: dates[1]?.innerText.trim() || "",
				bullets: (selectedBullets.length ? selectedBullets : allBullets.slice(0, 3)).map((item) => item.innerText.trim())
			};
		});
		const projects = Array.from(document.querySelectorAll("#projects .resume-project-entry"), (article) => ({
			title: article.querySelector(".item-heading")?.innerText.trim() || "",
			type: article.querySelector(".resume-project-type")?.innerText.trim() || "",
			bullets: Array.from(article.querySelectorAll(".resume-timeline-list > li"), (item) => item.innerText.trim())
		}));
		const education = Array.from(document.querySelectorAll("#education li"))
			.map((item) => ({
				degree: item.querySelector(".resume-degree")?.innerText.trim() || "",
				organization: item.querySelector(".resume-degree-org")?.innerText.trim() || "",
					date: item.querySelector(".resume-degree-time")?.innerText.trim() || "",
					recognition: item.querySelector(".resume-degree-highlight")?.innerText.trim() || ""
			}))
			.filter((item) => item.degree.includes("Mechanical Engineering"));

		return {
			name: text(".resume-name"),
			role: text(".resume-role-title"),
			specialties: text(".resume-specialties").replace(/\s*·\s*/g, " | "),
			location,
			phone: contact.phone || "",
			email: contact.email || "",
			linkedIn: linkedIn.replace(/^https?:\/\//, "").replace(/\/$/, ""),
			website: "tayapowell.fyi",
			languages,
			summary: text(".resume-summary-desc"),
			skills,
			certifications,
			experience,
			projects,
			education
		};
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
				width: contentWidth - indent
			});
			y += lines.length * size * 1.18 + (options.after || 0) * scale;
		}

		function addSection(title) {
			y += 7 * scale;
			addText(title.toUpperCase(), { size: 9.6, style: "bold", align: "center", after: 6, color: "#161d28" });
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

		addText(content.name, { size: 16, style: "bold", align: "center", color: "#111820", after: 1 });
		const contactLine = [content.location, content.phone, content.email].filter(Boolean).join(" | ");
		const webLine = [content.linkedIn, content.website].filter(Boolean).join(" | ");
		addText(contactLine, { size: 7.8, align: "center", color: "#39485b", after: 0.8 });
		addText(webLine, { size: 7.6, align: "center", color: "#39485b", after: 4.2 });
		addText(getRoleLine(content), { size: 9, style: "bold", align: "center", color: "#111820", after: 5 });

		addSection("Professional Summary");
		addText(content.summary, { size: 8.1, after: 1 });

		addSection("Technical Skills");
		content.skills.forEach((skill) => addText(skill, { size: 7.8, after: 1.2 }));
		if (content.languages.length) {
			addText(`Languages: ${content.languages.join(", ")}`, { size: 7.8, after: 1.2 });
		}

		if (content.certifications.length) {
			addSection("Certifications");
			content.certifications.forEach(addBullet);
		}

		addSection("Engineering Experience");
		content.experience.forEach((job) => {
			addExperienceHeading(job);
			job.bullets.forEach(addBullet);
			y += 2.5 * scale;
		});

		addSection("Projects");
		content.projects.forEach((project) => {
			addSideLabel(project.title, project.type);
			project.bullets.forEach(addBullet);
			y += 2 * scale;
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

			if (operation.type === "bullet") {
				pdf.text("-", operation.bulletX, operation.y);
				pdf.text(operation.lines, operation.x, operation.y);
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

	function generatePdf(content) {
		const { jsPDF } = window.jspdf || {};
		if (!jsPDF) {
			throw new Error("The PDF library did not load.");
		}

		const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter", compress: true });
		let scale = 1.12;
		let layout = createLayout(pdf, content, scale);

		while (layout.endY > bottomLimit && scale > 0.74) {
			scale -= 0.02;
			layout = createLayout(pdf, content, scale);
		}

		if (layout.endY > bottomLimit) {
			throw new Error("The selected resume content no longer fits on one page.");
		}

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

	async function getCachedPdf(content) {
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

		lastPdfBlob = generatePdf(content);
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
	.resume-header h1 { margin: 0 0 8px; color: #111820; font-size: 30px; letter-spacing: 0.22em; text-transform: uppercase; }
	.contact-line { margin: 2px 0; color: #39485b; font-size: 12.8px; }
	.role-line { margin: 12px 0 0; color: #111820; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; }
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
		.resume-header h1 { font-size: 22px; letter-spacing: 0.14em; }
		.entry-head { flex-wrap: wrap; gap: 2px 16px; }
	}
	@media print {
		@page { size: letter; margin: 0.4in; }
		body { background: #fff; font-size: 12px; line-height: 1.28; }
		.viewer-bar { display: none !important; }
		.resume-sheet { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
		.resume-header h1 { margin-bottom: 5px; font-size: 24px; }
		.contact-line { font-size: 11px; }
		.role-line { margin-top: 7px; font-size: 12px; }
		.resume-section h2 { margin: 10px 0 4px; font-size: 13px; }
		.summary, .plain-list li, .bullet-list li, .edu-line { font-size: 11.4px; }
		.entry { margin-top: 8px; }
		.entry-title { font-size: 12.4px; }
		.entry-date, .entry-type { font-size: 11px; }
		.entry-location { margin-top: 1px; font-size: 10.5px; }
		.bullet-list { margin-top: 5px; }
		.bullet-list li { margin: 2.5px 0; }
		.entry, .resume-header { break-inside: avoid; page-break-inside: avoid; }
	}`;

	function buildResumeHtml(content, pdfDataUrl, siteUrl) {
		const esc = escapeHtml;
		const contactLine = [content.location, content.phone, content.email].filter(Boolean).join(" | ");
		const webLine = [content.linkedIn, content.website].filter(Boolean).join(" | ");
		const downloadName = `${(content.name || "Resume").trim().replace(/\s+/g, "_")}_Resume.pdf`;
		const section = (title, body) => (body ? `<section class="resume-section"><h2>${esc(title)}</h2>${body}</section>` : "");
		const listItems = (items) => items.map((item) => `<li>${esc(item)}</li>`).join("");
		const summaryBody = content.summary ? `<p class="summary">${esc(content.summary)}</p>` : "";
		const skillsBody = listItems([...content.skills, content.languages.length ? `Languages: ${content.languages.join(", ")}` : ""].filter(Boolean));
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
<body>
<div class="viewer-bar">
	<span class="brand">${esc(content.name)} &mdash; Resume</span>
	<div class="viewer-actions">
		<button class="vb-btn primary" id="resume-print-btn" type="button">Print</button>
		${pdfDataUrl ? `<a class="vb-btn secondary" id="resume-download-btn" href="${esc(pdfDataUrl)}" download="${esc(downloadName)}">Download PDF</a>` : `<span class="vb-btn secondary disabled" title="The PDF could not be generated in this browser. Use Print to save a PDF instead.">Download PDF</span>`}
		<a class="vb-btn ghost" href="${esc(siteUrl)}">Back to Website</a>
	</div>
</div>
<main class="resume-sheet">
	<header class="resume-header">
		<h1>${esc(content.name)}</h1>
		<p class="contact-line">${esc(contactLine)}</p>
		<p class="contact-line">${esc(webLine)}</p>
		<p class="role-line">${esc(getRoleLine(content))}</p>
	</header>
	${section("Professional Summary", summaryBody)}
	${section("Technical Skills", skillsBody ? `<ul class="plain-list">${skillsBody}</ul>` : "")}
	${section("Certifications", certificationsBody)}
	${section("Engineering Experience", experienceBody)}
	${section("Projects", projectsBody)}
	${section("Education", educationBody)}
</main>
<script>
	(function () {
		var printBtn = document.getElementById("resume-print-btn");
		var dl = document.getElementById("resume-download-btn");
		var dlName = (dl && dl.getAttribute("download")) || "Resume.pdf";
		var cachedBlob = null;
		var isTouch = !!(window.matchMedia && (window.matchMedia("(max-width: 640px)").matches || window.matchMedia("(pointer: coarse)").matches));
		if (isTouch && printBtn) {
			printBtn.textContent = "Share / Print";
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
		if (dl && window.fetch && window.URL && URL.createObjectURL) {
			var dlBlobPromise = null;
			var ensureBlobUrl = function () {
				if (dl.href.indexOf("data:") !== 0) {
					return Promise.resolve(dl.href);
				}
				if (!dlBlobPromise) {
					dlBlobPromise = fetch(dl.href).then(function (response) {
						return response.blob();
					}).then(function (blob) {
						cachedBlob = blob;
						var url = URL.createObjectURL(blob);
						dl.href = url;
						return url;
					});
					dlBlobPromise.catch(function () {
						dlBlobPromise = null;
					});
				}
				return dlBlobPromise;
			};
			ensureBlobUrl();
			dl.addEventListener("click", function (event) {
				if (dl.href.indexOf("data:") !== 0) {
					return;
				}
				// Android Chrome ignores the download attribute on top-frame
				// data: URLs and derives the filename from the URL itself (the
				// entire base64 PDF). Block the native download, finish the
				// Blob URL conversion, then download with the short filename.
				event.preventDefault();
				ensureBlobUrl().then(function (url) {
					var link = document.createElement("a");
					link.href = url;
					link.download = dlName;
					link.rel = "noopener";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}).catch(function () {
					var link = document.createElement("a");
					link.href = dl.getAttribute("href") || dl.href;
					link.download = dlName;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				});
			});
		}
	})();
</script>
</body>
</html>`;
	}

	button.addEventListener("click", async () => {
		let viewer = window.open("about:blank", "_blank");

		const writeViewer = (markup) => {
			if (!viewer || viewer.closed) {
				return false;
			}
			try {
				viewer.document.open();
				viewer.document.write(markup);
				viewer.document.close();
				return true;
			} catch (error) {
				console.error("Resume viewer write failed:", error);
				try {
					viewer.close();
				} catch (ignore) {
					// The window is already gone.
				}
				viewer = null;
				return false;
			}
		};

		writeViewer(resumeLoadingHtml);
		try {
			const content = readPageContent();
			let pdfDataUrl = "";
			try {
				const pdfBlob = await getCachedPdf(content);
				pdfDataUrl = `data:application/pdf;base64,${await blobToBase64(pdfBlob)}`;
			} catch (pdfError) {
				// The HTML resume and Print still work without the PDF download.
				console.error("Resume PDF unavailable:", pdfError);
			}
			const html = buildResumeHtml(content, pdfDataUrl, window.location.href.split("#")[0]);
			if (!writeViewer(html)) {
				const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
				window.location.assign(url);
				window.setTimeout(() => URL.revokeObjectURL(url), 60000);
			}
		} catch (error) {
			try {
				viewer?.close();
			} catch (ignore) {
				// The window is already gone.
			}
			console.error(error);
			const detail = error && error.message ? ` (${error.message})` : "";
			window.alert(`The resume could not be opened${detail}. Please reload the page and try again.`);
		}
	});
})();