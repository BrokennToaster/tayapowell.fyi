(function () {
	var root = document.getElementById("project-list");
	if (!root || !Array.isArray(window.PROJECTS)) return;

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text) node.textContent = text;
		return node;
	}

	function pad(n) { return n < 10 ? "0" + n : String(n); }

	// "Main title: Subtitle" renders as a headline plus a quieter subtitle
	function splitTitle(title) {
		var i = title.indexOf(": ");
		return i === -1 ? { main: title, sub: "" } : { main: title.slice(0, i), sub: title.slice(i + 2) };
	}

	function bullets(items) {
		var ul = el("ul", "project-list-items");
		items.forEach(function (item) { ul.appendChild(el("li", null, item)); });
		return ul;
	}

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
		function onKey(e) { if (e.key === "Escape") close(); }
		overlay.addEventListener("click", close);
		document.addEventListener("keydown", onKey);
		document.body.classList.add("project-lightbox-open");
		document.body.appendChild(overlay);
	}

	function gallery(images, extraClass) {
		var wrap = el("div", "project-gallery" + (extraClass ? " " + extraClass : ""));
		images.forEach(function (image) {
			var figure = el("figure", "project-figure");
			var img = el("img");
			img.src = image.src;
			img.alt = image.alt || "";
			img.loading = "eager";
			// Each figure's width follows its aspect ratio; the row height comes from --img-h in CSS
			function size() {
				var ratio = img.naturalWidth / img.naturalHeight;
				if (ratio) figure.style.setProperty("--r", ratio.toFixed(4));
				if (ratio && ratio < 1) figure.classList.add("is-portrait");
			}
			function done() { size(); img.classList.add("is-loaded"); }
			if (img.complete && img.naturalWidth) done(); else img.addEventListener("load", done);
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

	function render(project, index) {
		var parts = splitTitle(project.title);
		var card = el("article", "project-card");
		card.id = "project-" + (index + 1);

		var head = el("header", "project-head");
		head.appendChild(el("div", "project-number", pad(index + 1)));
		var headText = el("div", "project-head-text");
		var meta = el("div", "project-meta");
		[project.type, project.date].filter(Boolean).forEach(function (m) { meta.appendChild(el("span", "project-pill", m)); });
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

		var steps = [];
		if (project.functions && project.functions.length) steps.push({ label: "Required functions", items: project.functions });
		(project.sections || []).forEach(function (s) { steps.push(s); });
		if (project.details && project.details.length) steps.push({ label: "Details", items: project.details });

		if (steps.length) {
			var flow = el("div", "project-flow");
			steps.forEach(function (section, i) {
				var hasImages = section.images && section.images.length;
				var isGallery = hasImages && section.images.length >= 3;
				var row = el("section", "project-step" + (hasImages ? " has-images" : "") + (isGallery ? " is-gallery" : ""));
				var text = el("div", "project-step-text");
				var label = el("h5", "project-step-label");
				label.appendChild(el("span", "project-step-index", pad(i + 1)));
				label.appendChild(document.createTextNode(section.label));
				text.appendChild(label);
				if (section.text) text.appendChild(el("p", "project-section-text", section.text));
				if (section.items && section.items.length) text.appendChild(bullets(section.items));
				row.appendChild(text);
				if (hasImages) row.appendChild(gallery(section.images, "project-step-gallery"));
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
			project.tags.forEach(function (tag) { tags.appendChild(el("span", "project-tag", tag)); });
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

	window.PROJECTS.forEach(function (project, index) { root.appendChild(render(project, index)); });

	// Fade cards in as they scroll into view
	if ("IntersectionObserver" in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
			});
		}, { rootMargin: "0px 0px -8% 0px" });
		root.querySelectorAll(".project-card").forEach(function (c) { c.classList.add("will-reveal"); io.observe(c); });
	}
})();
