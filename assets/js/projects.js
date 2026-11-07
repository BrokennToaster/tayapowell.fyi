/*
 * Render project-index links and case-study cards from window.PROJECTS.
 * projects.html loads projects-data.js first and provides #project-list and
 * #project-index. Text values become text nodes rather than HTML; change the
 * content in projects-data.js and the presentation in projects.css.
 */
(function () {
	var root = document.getElementById("project-list");
	if (!root) return;
	if (!Array.isArray(window.PROJECTS)) {
		console.error("Project portfolio data could not be loaded.");
		return;
	}

	// Create nodes with textContent so project copy cannot inject markup.
	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text) node.textContent = text;
		return node;
	}

	function pad(n) {
		return n < 10 ? "0" + n : String(n);
	}

	// "Main title: Subtitle" renders as a headline plus a quieter subtitle
	function splitTitle(title) {
		var i = title.indexOf(": ");
		return i === -1 ? { main: title, sub: "" } : { main: title.slice(0, i), sub: title.slice(i + 2) };
	}

	function bullets(items) {
		var ul = el("ul", "project-list-items");
		items.forEach(function (item) {
			ul.appendChild(el("li", null, item));
		});
		return ul;
	}

	// Click-to-zoom uses the source image and closes on an overlay click or Escape.
	function openLightbox(img, caption) {
		var overlay = el("div", "project-lightbox");
		overlay.setAttribute("role", "dialog");
		overlay.setAttribute("aria-modal", "true");
		var big = el("img");
		big.src = img.src;
		big.alt = img.alt;
		overlay.appendChild(big);
		if (caption) overlay.appendChild(el("div", "project-lightbox-caption", caption));
		function close() {
			overlay.remove();
			document.removeEventListener("keydown", onKey);
			document.body.classList.remove("project-lightbox-open");
		}
		function onKey(e) {
			if (e.key === "Escape") close();
		}
		overlay.addEventListener("click", close);
		document.addEventListener("keydown", onKey);
		document.body.classList.add("project-lightbox-open");
		document.body.appendChild(overlay);
	}

	// Each image produces a figure and optional caption. newRow inserts a
	// flex break for grouped desktop rows; CSS controls the mobile layout.
	function gallery(images, extraClass) {
		var wrap = el("div", "project-gallery" + (extraClass ? " " + extraClass : ""));
		images.forEach(function (image) {
			if (image.newRow) {
				wrap.classList.add("is-grouped");
				wrap.appendChild(el("div", "gallery-break"));
			}
			var figure = el("figure", "project-figure");
			var img = el("img");
			img.src = image.src;
			img.alt = image.alt || "";
			img.loading = "eager";
			// Once the image has loaded, CSS uses --r (width / height) with
			// --img-h to size the figure. Portraits get an extra layout class.
			function size() {
				var ratio = img.naturalWidth / img.naturalHeight;
				if (ratio) {
					figure.style.setProperty("--r", ratio.toFixed(4));
					if (ratio < 1) figure.classList.add("is-portrait");
				}
			}
			function done() {
				size();
				img.classList.add("is-loaded");
			}
			if (img.complete && img.naturalWidth) {
				done();
			} else {
				img.addEventListener("load", done);
			}
			img.addEventListener("click", function () { openLightbox(img, image.caption); });
			figure.appendChild(img);
			if (image.caption) figure.appendChild(el("figcaption", null, image.caption));
			wrap.appendChild(figure);
		});
		return wrap;
	}

	function summaryBlock(label, text) {
		var block = el("div", "project-summary-item");
		block.appendChild(el("div", "project-summary-label", label));
		block.appendChild(el("p", "project-summary-text", text));
		return block;
	}

	// A card's generated ID and its jump link both use its array position.
	// Reordering projects therefore changes their #project-N anchors.
	function render(project, index) {
		var parts = splitTitle(project.title);
		var card = el("article", "project-card");
		card.id = "project-" + (index + 1);

		var head = el("header", "project-head");
		head.appendChild(el("div", "project-number", pad(index + 1)));
		var headText = el("div", "project-head-text");
		var meta = el("div", "project-meta");
		[project.type, project.date].filter(Boolean).forEach(function (value) {
			meta.appendChild(el("span", "project-pill", value));
		});
		if (meta.childNodes.length) headText.appendChild(meta);
		headText.appendChild(el("h4", "project-title", parts.main));
		if (parts.sub) headText.appendChild(el("div", "project-subtitle", parts.sub));
		head.appendChild(headText);
		card.appendChild(head);

		var body = el("div", "project-body");

		if (project.stats && project.stats.length) {
			var stats = el("div", "project-stats");
			project.stats.forEach(function (stat) {
				var item = el("div", "project-stat");
				item.appendChild(el("div", "project-stat-value", stat.value));
				item.appendChild(el("div", "project-stat-label", stat.label));
				stats.appendChild(item);
			});
			body.appendChild(stats);
		}

		var summary = el("div", "project-summary");
		if (project.context) summary.appendChild(summaryBlock("Context", project.context));
		if (project.problem) summary.appendChild(summaryBlock("Problem", project.problem));
		if (project.objective) summary.appendChild(summaryBlock("Objective", project.objective));
		if (summary.childNodes.length) body.appendChild(summary);

		if (project.hero && project.hero.length) body.appendChild(gallery(project.hero, "project-hero"));

		// Required functions and details become steps around the authored
		// sections, keeping the numbered process in display order.
		var steps = [];
		if (project.functions && project.functions.length) steps.push({ label: "Required functions", items: project.functions });
		(project.sections || []).forEach(function (section) {
			steps.push(section);
		});
		if (project.details && project.details.length) steps.push({ label: "Details", items: project.details });

		if (steps.length) {
			var flow = el("div", "project-flow");
			steps.forEach(function (section, i) {
				var hasImages = section.images && section.images.length;
				// Larger groups, or sections explicitly marked stack, put text
				// above a gallery instead of beside a small image group.
				var isGallery = hasImages && (section.images.length >= 3 || section.stack);
				var row = el("section", "project-step" + (hasImages ? " has-images" : "") + (isGallery ? " is-gallery" : ""));
				var text = el("div", "project-step-text");
				var label = el("h5", "project-step-label");
				label.appendChild(el("span", "project-step-index", pad(i + 1)));
				label.appendChild(document.createTextNode(section.label));
				text.appendChild(label);
				if (section.text) text.appendChild(el("p", "project-section-text", section.text));
				if (section.items && section.items.length) text.appendChild(bullets(section.items));
				row.appendChild(text);
				if (hasImages) {
					row.appendChild(gallery(
						section.images,
						"project-step-gallery" + (section.layout ? " layout-" + section.layout : "")
					));
				}
				flow.appendChild(row);
			});
			body.appendChild(flow);
		}

		if (project.images && project.images.length) body.appendChild(gallery(project.images));

		if (project.impact) {
			var impact = el("div", "project-impact");
			impact.appendChild(el("div", "project-impact-label", "Impact"));
			impact.appendChild(el("p", "project-impact-text", project.impact));
			body.appendChild(impact);
		}

		if (project.tags && project.tags.length) {
			var tags = el("div", "project-tags");
			project.tags.forEach(function (tag) {
				tags.appendChild(el("span", "project-tag", tag));
			});
			body.appendChild(tags);
		}

		card.appendChild(body);
		return card;
	}

	var nav = document.getElementById("project-index");
	if (nav) {
		window.PROJECTS.forEach(function (project, index) {
			var parts = splitTitle(project.title);
			var link = el("a", "project-index-item");
			link.href = "#project-" + (index + 1);
			link.appendChild(el("span", "project-index-number", pad(index + 1)));
			var t = el("span", "project-index-text");
			t.appendChild(el("span", "project-index-title", parts.main));
			t.appendChild(el("span", "project-index-type", project.type));
			link.appendChild(t);
			nav.appendChild(link);
		});
	}

	window.PROJECTS.forEach(function (project, index) {
		root.appendChild(render(project, index));
	});

	// Only enable the fade when the browser supports observation. Without it,
	// cards stay visible; reduced-motion CSS also keeps them visible.
	if ("IntersectionObserver" in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (e.isIntersecting) {
					e.target.classList.add("is-visible");
					io.unobserve(e.target);
				}
			});
		}, { rootMargin: "0px 0px -8% 0px" });
		root.querySelectorAll(".project-card").forEach(function (c) { c.classList.add("will-reveal"); io.observe(c); });
	}
})();
