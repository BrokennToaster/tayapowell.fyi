/*
 * Add a project object at the TOP of this array (newest first). Keep the comma
 * between objects. `id` and `title` are required; use lowercase letters,
 * numbers, and hyphens for ids. Keep each id unique and
 * unchanged so links continue to work when projects are reordered.
 * The part of a title after ": " appears as a subtitle.
 *
 *   title, type, date, context   - short text
 *   problem, objective, impact   - short paragraphs
 *   functions, details           - arrays of bullet strings
 *   stats                        - [{ value, label }] headline metrics row
 *   sections                     - [{ label, text, items: [bullets], images: [...] }] report-style groups;
 *                                  put images in the section they illustrate
 *                                  Optional `stack` promotes a short image group to a gallery;
 *                                  `layout` selects a gallery layout defined in projects.css.
 *   hero, images                 - image arrays; hero follows the intro, images is the closing gallery
 *   tags                         - array of short labels
 *   gallery image                - { src, alt, caption, newRow }; `newRow` starts a desktop gallery row.
 *   portfolioPdf                - { title, summary, highlights, images }; curated
 *                                  one-page application portfolio content.
 *                                  images: [{ src, caption }] (one to six).
 *
 * Example (add this inside the array and replace its placeholder details):
 *
 *   {
 *     id: "project-name",
 *     title: "Project name: Short subtitle",
 *     type: "Personal project",
 *     date: "2026",
 *     objective: "What the project was intended to accomplish.",
 *     portfolioPdf: {
 *       title: "Project name",
 *       summary: "The project's objective in one or two sentences.",
 *       highlights: ["What was done.", "The resulting impact."],
 *       images: [{ src: "assets/images/projects/example.jpg", caption: "What the image shows" }]
 *     },
 *     sections: [{
 *       label: "Design process",
 *       items: ["A concise description of the work."],
 *       images: [{
 *         src: "assets/images/projects/example.jpg",
 *         alt: "Description of the image",
 *         caption: "What the image shows"
 *       }]
 *     }],
 *     impact: "The result or lesson learned.",
 *     tags: ["CAD", "Prototyping"]
 *   },
 *
 * Use repository-relative paths and put image files in assets/images/projects/.
 * Three or more section images automatically form a gallery; set stack: true
 * to use the same presentation for one or two images. Layout options include
 * feature, pair, pair-narrow, fit, large, focus, justified, and justified-wide;
 * their sizing and breakpoints are defined in projects.css. Test the chosen
 * layout with the actual photos on both desktop and mobile.
 * Text is rendered as text, not HTML. After edits, update the ?v= value for
 * projects-data.js in projects.html and portfolio-viewer.html so returning
 * browsers load the new data.
 * For the downloadable portfolio, add a portfolioPdf object to every project.
 * Keep its claims and captions consistent with the full case study.
 */
window.PROJECTS = [
	{
		id: "ansol-containers",
		title: "ANSOL Production Containers: 3D Scan-to-Model Package",
		type: "Professional · REDD Engineering & Construction, Inc.",
		date: "2025 - 2026",
		portfolioPdf: {
			title: "ANSOL Production Containers",
			summary: "Rebuilt existing conditions for two portable production containers from 3D laser scans, creating as-built documentation before transport.",
			highlights: [
				"Processed point clouds and modeled the containers in AutoCAD Plant 3D.",
				"Produced piping isometrics with bills of materials, updated P&IDs, and structural and architectural layouts.",
				"Delivered client-ready drawing packages for both containers."
			],
			images: [
				{ src: "assets/images/projects/ansol-redd-spotlight.jpg", caption: "REDD project spotlight featuring the container's as-built Plant 3D model." }
			]
		},
		context: "Two portable production containers were scheduled for transport, and the client needed updated as-built documentation of their current condition.",
		objective: "Convert 3D laser scan point clouds into verified AutoCAD Plant 3D as-built models and client-ready drawing packages for both containers prior to transport.",
		hero: [
			{ src: "assets/images/projects/ansol-redd-spotlight.jpg", alt: "REDD Engineering & Construction project spotlight showing the Plant 3D model of an ANSOL production container", caption: "REDD project spotlight: the as-built Plant 3D model of an ANSOL production container" }
		],
		functions: [
			"Processed 3D laser scan point clouds and rebuilt existing conditions as updated Plant 3D models",
			"Generated piping ISOs with Bills of Materials (BOMs)",
			"Produced updated P&IDs",
			"Produced structural and architectural layouts"
		],
		impact: "Delivered accurate, client-ready as-built documentation for both containers before they were moved.",
		tags: ["AutoCAD Plant 3D", "3D Laser Scanning", "Point Clouds", "P&IDs", "Piping ISOs"]
	},
	{
		id: "statics-demonstrations",
		title: "Statics Lab Demonstrations: Hands-On Teaching Aids for ME 201",
		type: "4-person team · Capstone project",
		date: "Winter 2025",
		portfolioPdf: {
			title: "Statics Lab Demonstrations",
			summary: "Designed, built, and validated three hands-on teaching aids that let students visualize statics concepts and measure forces.",
			highlights: [
				"Modeled and fabricated demonstrations using aluminum, laser-cut birch, pulleys, and luggage scales.",
				"Used FEA, FMEA, and repeated testing to refine and evaluate the designs. The triangle demo averaged about 1.5% error, with a 0.05% best result.",
				"Delivered the set for under half the budget. The project received ASME's Best Calculations award."
			],
			images: [
				{ src: "assets/images/projects/statics-cad-1-top.png", caption: "CAD: arm and rubber-lined clamps." },
				{ src: "assets/images/projects/statics-cad-2-iso.png", caption: "CAD: triangle tension and compression model." },
				{ src: "assets/images/projects/statics-cad-3-iso.png", caption: "CAD: linked machine demonstration." },
				{ src: "assets/images/projects/statics-demo-moment.jpg", caption: "Moment demo: rubber-lined clamps resist rotation while a scale measures force." },
				{ src: "assets/images/projects/statics-demo-tension.jpg", caption: "Triangle demo: scales measure forces in a 3D tension and compression problem." },
				{ src: "assets/images/projects/statics-demo-machine.jpg", caption: "Machine demo: linked components illustrate reaction-force directions." }
			]
		},
		stats: [
			{ value: "0.05%", label: "lowest measured force error" },
			{ value: "~1.5%", label: "average error, triangle demo" },
			{ value: "< ½", label: "of budget spent" },
			{ value: "3 to 4 ft", label: "accidental drop survived" }
		],
		context: "ME 201 Statics is a challenging course, and new students struggle to visualize how its concepts apply to real structures and machines.",
		objective: "Design, build, and validate lab demonstrations that let students see statics concepts and check their own homework answers with real force measurements.",
		hero: [
			{ src: "assets/images/projects/statics-demo-moment.jpg", alt: "Moment demonstration with rubber tube clamps resisting the moment and a luggage scale measuring force", caption: "Moment about an axis: rubber tube clamps resist the moment" },
			{ src: "assets/images/projects/statics-demo-tension.jpg", alt: "3D tension and compression demonstration clamped to a table with luggage scales", caption: "3D tension and compression, read out with luggage scales" },
			{ src: "assets/images/projects/statics-demo-machine.jpg", alt: "Machine demonstration held between two luggage scales", caption: "Machine demonstration: luggage scales measure the forces" }
		],
		functions: [
			"Demonstrate three historically difficult homework problems: moment about an axis, 3D tension and compression, and machines",
			"Measure and display forces with no wiring or programming, using luggage scales as force gauges",
			"Originally targeted accuracy within 10%, results readable in seconds, and setup and takedown in under 120 seconds",
			"Fit within a 48in x 15.5in x 12.3in storage envelope and survive student handling"
		],
		sections: [
			{
				label: "Design process",
				items: [
					"Ran a blue-sky concept session, then organized the ideas into a concept table covering modularity, instrument placement, size, and results display",
					"Used Pugh decision matrices to compare concepts for the carrier, component material, and instrument attachment subsystems",
					"Built proof-of-concept prototypes (modular pegboard, string-and-frame, and large multi-problem box) and learned that restricted access, limited visibility, and fixed hole spacing outweighed their flexibility",
					"Narrowed scope from 5 to 6 problems down to 3 demonstrations to protect quality, which also relaxed the storage envelope"
				],
				images: [
					{ src: "assets/images/projects/statics-proto-paper.jpg", alt: "Early paper and string proof-of-concept prototype", caption: "Proof of concept: paper and string frame" },
					{ src: "assets/images/projects/statics-proto-cardboard.jpg", alt: "Cardboard proof-of-concept prototype of the linkage demonstration", caption: "Proof of concept: cardboard linkage" }
				]
			},
			{
				label: "CAD modeling",
				items: [
					"Modeled every demo and base in CAD, with pulleys keeping force alignment correct and partially threaded bolts acting as pivots"
				],
				images: [
					{ src: "assets/images/projects/statics-cad-1-top.png", alt: "CAD top view of the arm demonstration with rubber-lined clamps", caption: "Arm demo: top view" },
					{ src: "assets/images/projects/statics-cad-1-back.png", alt: "CAD rear view of the arm demonstration", caption: "Arm demo: rear view" },
					{ src: "assets/images/projects/statics-cad-2-iso.png", alt: "CAD isometric view of the triangle demonstration, two tubes meeting at a peak", caption: "Triangle demo: isometric view", newRow: true },
					{ src: "assets/images/projects/statics-cad-2-side.png", alt: "CAD side view of the triangle demonstration", caption: "Triangle demo: side view" },
					{ src: "assets/images/projects/statics-cad-3-top.png", alt: "CAD top view of the clamp demonstration, linked bars", caption: "Clamp demo: top view", newRow: true },
					{ src: "assets/images/projects/statics-cad-3-iso.png", alt: "CAD isometric view of the clamp demonstration", caption: "Clamp demo: isometric view" }
				]
			},
			{
				label: "Analysis and design changes",
				stack: true,
				layout: "pair",
				items: [
					"Ran ANSYS FEA on the arm; deformation exceeded accepted values at first, so the components were thickened",
					"Ran an FMEA that identified fracture from excessive stress as the most likely and most damaging failure mode",
					"Added four rubber tube clamps to the arm to resist larger moments and make testing easier"
				],
				images: [
					{ src: "assets/images/projects/statics-fea-clamp.jpg", alt: "ANSYS stress analysis of the arm demonstration", caption: "ANSYS stress analysis of the arm" },
					{ src: "assets/images/projects/statics-fea-triangle-tube.jpg", alt: "ANSYS stress analysis of the triangle demonstration", caption: "ANSYS stress analysis of the triangle" }
				]
			},
			{
				label: "Fabrication",
				layout: "feature",
				items: [
					"Welded and laser-cut aluminum for the triangle and arm demos, and two-layer laser-cut 6mm birch for the clamp demo, all on stained and filleted wooden bases",
					"Designed custom storage boxes: 33x14x4.5in side by side, 13x14x13.5in stacked"
				],
				images: [
					{ src: "assets/images/projects/statics-fab-triangle.jpg", alt: "Aluminum triangle tube mounted on its wooden base", caption: "Triangle: tube mounted on its base" },
					{ src: "assets/images/projects/statics-fab-engraving.jpg", alt: "Laser-engraved BYU-Idaho emblem and lettering on stained boards", caption: "Laser-engraved and stained bases" },
					{ src: "assets/images/projects/statics-fab-clamp-weld.jpg", alt: "Welded aluminum tube with rubber-lined clamps", caption: "Arm: welded tube with rubber-lined clamps" },
					{ src: "assets/images/projects/statics-fab-arm.jpg", alt: "Laser-cut birch linkage assembled with bolts and spacers", caption: "Clamp: laser-cut birch linkage" }
				]
			},
			{
				label: "Testing and results",
				stack: true,
				layout: "fit",
				items: [
					"Triangle demo: 2.45% error in the recorded test (1.80 lb expected, 1.78 lb measured), about 1.5% on average, and 0.05% at best; found that both scales must be tared with no tension for best accuracy",
					"Arm demo: 11% error (2.18 lb expected, 1.94 lb measured), accepted as sufficiently close for its instructional purpose; tested by finding the point where the arm starts to move, with a bubble level for calibration",
					"Clamp demo: 34.4% error (1.68 lb expected, 1.10 lb measured). Team review found that the mechanism is not static and its force readings are the least accurate, so it works best as a visual aid for reaction-force direction and machine function",
					"Results were consistent across more than 10 repeated trials, and the demos survived an accidental 3 to 4 ft drop",
					"Final cost came in at just under half of the project budget"
				],
				images: [
					{ src: "assets/images/projects/statics-arm-in-use.jpg", alt: "Student pulling a luggage scale to load the arm demonstration", caption: "Arm demo in use: the scale reads the force directly" },
					{ src: "assets/images/projects/statics-clamp-in-use.jpg", alt: "Clamp demonstration being loaded with two luggage scales", caption: "Clamp demo under load, read with two scales" }
				]
			}
		],
		impact: "Delivered a reusable, wireless, and durable lab set that supports student engagement and understanding of statics concepts in ME 201 recitations. The team met the revised performance requirements, and the project received a \"Best Calculations\" award from ASME.",
		tags: ["Statics", "Fabrication", "FEA (ANSYS)", "FMEA", "Pugh Matrices", "Design Validation", "Instructional Design"]
	},
	{
		id: "ergonomic-mouse",
		title: "Custom Ergonomic Computer Mouse: Rapid Prototyping & Manufacturing",
		type: "Individual & 10-person team",
		portfolioPdf: {
			title: "Custom Ergonomic Computer Mouse",
			summary: "Explored ergonomic form and rapid prototyping, from hands-on models to surfaced CAD and a 3D-printed fit prototype.",
			highlights: [
				"Tested individual forms in paper, clay, and cardboard before modeling the organic shell and internal chassis in SolidWorks.",
				"3D printed the model to validate fit and collect user feedback.",
				"Personally hand injection-molded an individual blue-and-green marbled housing for the team design, paired with a 3D-printed internal chassis for electronics and snap-on housing."
			],
			images: [
				{ src: "assets/images/projects/mouse-cardboard-contour.jpg", caption: "Cardboard contour-slice prototype used to test the ergonomic form." },
				{ src: "assets/images/projects/mouse-3-cad-surfacing.jpg", caption: "Individual mouse concept modeled with SolidWorks surfacing." },
				{ src: "assets/images/projects/mouse-print-top.jpg", caption: "3D-printed shell used to assess fit and gather feedback." },
				{ src: "assets/images/projects/mouse-chassis-internals.jpg", caption: "CAD layout of the internal chassis." },
				{ src: "assets/images/projects/mouse-5-hex-shell-cad.jpg", caption: "Selected team concept with a hexagonal shell." },
				{ src: "assets/images/projects/mouse-cast-emblem.jpg", caption: "Cast metal accent emblem." }
			]
		},
		problem: "Commercial mice lack a custom ergonomic fit, causing strain during long CAD sessions.",
		objective: "Complete a full rapid prototyping lifecycle, from low-fidelity testing to SolidWorks organic surfacing and multi-material manufacturing.",
		sections: [
			{
				label: "Low-fidelity concept and ergonomic prototyping",
				layout: "justified",
				stack: true,
				items: [
					"Prototyped individual ergonomic forms in paper, clay, and cardboard contour slices to test the form in hand before committing to CAD"
				],
				images: [
					{ src: "assets/images/projects/mouse-sketch-concepts.jpg", alt: "Early mouse concept sketches: spaceship and spiral forms", caption: "Early concept sketches" },
					{ src: "assets/images/projects/mouse-sketch-interim.jpg", alt: "Interim design sketch of the mouse with ventilation and palm-rest notes", caption: "Interim design sketch" },
					{ src: "assets/images/projects/mouse-paper-top.jpg", alt: "Paper and tape form study", caption: "Paper and tape form study" },
					{ src: "assets/images/projects/mouse-paper-side.jpg", alt: "Paper form, side view", caption: "Paper form, side view", newRow: true },
					{ src: "assets/images/projects/mouse-paper-profile.jpg", alt: "Paper form, profile", caption: "Paper form, profile" },
					{ src: "assets/images/projects/mouse-clay.jpg", alt: "Clay model", caption: "Clay model" },
					{ src: "assets/images/projects/mouse-cardboard-contour.jpg", alt: "Cardboard contour slices from above, with numbered slices", caption: "Contoured cardboard slices", newRow: true },
					{ src: "assets/images/projects/mouse-cardboard-side.jpg", alt: "Cardboard contour slices, side profile", caption: "Contour profile, side view" },
					{ src: "assets/images/projects/mouse-cardboard-grid.jpg", alt: "Interlocking honeycomb of the cardboard slices", caption: "Interlocking honeycomb structure" }
				]
			},
			{
				label: "Organic CAD surfacing",
				stack: true,
				items: [
					"Modeled the organic form with SolidWorks surfacing and laid out the internal chassis"
				],
				images: [
					{ src: "assets/images/projects/mouse-1-concept-cad.jpg", alt: "Initial concept CAD", caption: "Initial concept CAD" },
					{ src: "assets/images/projects/mouse-3-cad-surfacing.jpg", alt: "SolidWorks surfacing model", caption: "SolidWorks surfacing model" },
					{ src: "assets/images/projects/mouse-chassis-internals.jpg", alt: "Internal chassis layout", caption: "Internal chassis layout", newRow: true },
					{ src: "assets/images/projects/mouse-exploded-assembly.jpg", alt: "Exploded assembly", caption: "Exploded assembly" }
				]
			},
			{
				label: "3D-printed validation",
				layout: "justified-wide",
				stack: true,
				items: [
					"3D printed the model to validate fit and gathered user feedback"
				],
				images: [
					{ src: "assets/images/projects/mouse-slicer-supports.jpg", alt: "Slicer error view showing support structures", caption: "Slicer error view: support structures" },
					{ src: "assets/images/projects/mouse-print-top.jpg", alt: "Printed shell, top", caption: "Printed shell, top" },
					{ src: "assets/images/projects/mouse-print-inside.jpg", alt: "Printed shell, interior", caption: "Printed shell, interior" }
				]
			},
			{
				label: "Team concept and multi-material manufacturing",
				layout: "justified-wide",
				stack: true,
				items: [
					"Evaluated team concepts and selected a two-tone hexagonal shell made with two-part silicone molds and dual-stage polymer resin overmolding",
					"Used investment casting for the accent emblem"
				],
				images: [
					{ src: "assets/images/projects/mouse-5-hex-shell-cad.jpg", alt: "Selected hexagonal shell CAD", caption: "Selected hexagonal shell CAD" },
					{ src: "assets/images/projects/mouse-6-emblem-cad.jpg", alt: "Cast metal accent emblem CAD", caption: "Cast metal accent emblem CAD" },
					{ src: "assets/images/projects/mouse-cast-emblem.jpg", alt: "Cast metal emblem piece held in hand", caption: "Cast metal piece" }
				]
			},
			{
				label: "Individual mouse fabrication",
				items: [
					"Personally hand injection-molded an individual housing with a marbled blue-and-green pattern for the team design, paired with a 3D-printed internal chassis that holds the battery, wiring, sensors, clickers, and scroll wheel and accepts the snap-on housing"
				]
			}
		],
		impact: "Combined individual organic CAD surfacing and hands-on manufacturing with collaborative DFM under strict tooling budget constraints.",
		tags: ["SolidWorks", "Surface Modeling", "3D Printing", "Injection Molding", "Casting", "DFM"]
	},
	{
		id: "carbon-fiber-eraser",
		title: "Ultralight Carbon Fiber Whiteboard Eraser: Materials & Magnetic Optimization",
		type: "Individual",
		portfolioPdf: {
			title: "Carbon Fiber Whiteboard Eraser",
			summary: "Built a lightweight magnetic eraser that stays on a glass whiteboard while learning composite manufacturing.",
			highlights: [
				"Hand-laid carbon fiber with resin and vacuum-bagged the contoured shell over a thrift-store glass bowl.",
				"Finished the cured shell, bonded two magnets, and added a cloth wiping surface.",
				"Produced a working prototype for roughly $25 in materials and evaluated manufacturing options for scaling."
			],
			images: [
				{ src: "assets/images/projects/eraser-layup-2.jpg", caption: "Working resin into carbon fiber by hand during wet layup." },
				{ src: "assets/images/projects/eraser-magnets.jpg", caption: "Two magnets bonded to the back of the cured shell." },
				{ src: "assets/images/projects/eraser-in-use.jpg", caption: "Finished eraser holding on glass and wiping away marker." },
				{ src: "assets/images/projects/eraser-concept-sketch.jpg", caption: "Initial contoured-shell concept." },
				{ src: "assets/images/projects/eraser-sanded.jpg", caption: "Cured and sanded carbon fiber shell." },
				{ src: "assets/images/projects/eraser-assembled.jpg", caption: "Assembled carbon fiber eraser." }
			]
		},
		problem: "Across just 4mm of glass a magnet loses 70–90% of its strength (pull force falls roughly with 1/r²), so heavy magnetic erasers slide or fall off glass whiteboards.",
		objective: "Design a lightweight eraser that stays on a glass whiteboard, using the project to learn composite manufacturing.",
		impact: "Built a working carbon fiber eraser for roughly $25 in materials that holds on the glass and erases marker. Evaluated production scaling (compression molding, prepreg vs. wet layup) and estimated a $25–30 price point.",
		hero: [],
		sections: [
			{
				label: "The physics problem",
				items: [
					"Pull force falls off roughly as 1/r² with distance, so 4mm of glass removes most of a magnet's strength",
					"Heavy erasers slide or fall off the glass; a popular magnetic eraser fell off immediately",
					"Built to meet a personal need and to learn composites in a small market for glass-whiteboard accessories"
				],
				images: [
					{ src: "assets/images/projects/eraser-force-graph.jpg", alt: "Graph of magnetic pull force falling with distance", caption: "Pull force vs. distance through the glass" }
				]
			},
			{
				label: "Concept: a lightweight contoured shell",
				items: [
					"The first concept, a contoured shell, was sketched under the working name \"Salmon Steak\"",
					"Cheaper materials with stronger magnets would also work; carbon fiber was chosen deliberately to gain hands-on composites experience"
				],
				images: [
					{ src: "assets/images/projects/eraser-concept-sketch.jpg", alt: "Concept sketch of the contoured eraser shell", caption: "Initial contoured-shell concept" }
				]
			},
			{
				label: "Forming the carbon fiber shell",
				stack: true,
				layout: "pair-narrow",
				items: [
					"Hand wet layup of carbon fiber with a 226 resin-hardener system",
					"Vacuum-bagged over a $4 thrift-store glass bowl, since the contour needs vacuum pressure to stay flush to the mold",
					"Tight precision was not required, so a low-cost found mold was sufficient. Materials: vacuum bag ~$8, sealing tape ~$2–3, carbon fiber ~$2–5"
				],
				images: [
					{ src: "assets/images/projects/eraser-layup-2.jpg", alt: "Working the resin into the carbon fiber by hand", caption: "Working resin into the fabric" },
					{ src: "assets/images/projects/eraser-layup-1.jpg", alt: "Carbon fiber and resin during wet layup", caption: "Carbon fiber and resin during wet layup" }
				]
			},
			{
				label: "Post-processing",
				layout: "justified-wide",
				items: [
					"Sanded and filed the cured shells along the edges and surface to remove lint left by paper towels during acetone cleaning"
				],
				images: [
					{ src: "assets/images/projects/eraser-shells.jpg", alt: "Cured carbon fiber shells", caption: "Cured shells" },
					{ src: "assets/images/projects/eraser-filing.jpg", alt: "Carbon shell next to a file", caption: "Filing the edges" },
					{ src: "assets/images/projects/eraser-sanded.jpg", alt: "Sanded carbon fiber shell", caption: "Sanded shell" }
				]
			},
			{
				label: "Solving the magnetic holding problem",
				layout: "focus",
				stack: true,
				items: [
					"Bonded two round magnets (~$7) to the back with JB-Weld to compensate for the loss in pull through the glass",
					"Key lesson: a stronger magnet would have improved holding more than the composite body did, so this design suits novelty use better than practical use"
				],
				images: [
					{ src: "assets/images/projects/eraser-magnets.jpg", alt: "Two round magnets bonded to the back of the carbon shell", caption: "Magnets bonded to the back" }
				]
			},
			{
				label: "Wiping surface and final assembly",
				layout: "large",
				items: [
					"Wrapped the face in a grey microfiber/terry cloth pad for the wiping surface",
					"The finished eraser stays put on the glass and cleanly erases orange marker"
				],
				images: [
					{ src: "assets/images/projects/eraser-cloth-wrap.jpg", alt: "Carbon shell being wrapped in cloth", caption: "Wrapping the cloth" },
					{ src: "assets/images/projects/eraser-assembled.jpg", alt: "Assembled eraser with carbon fiber shell", caption: "Assembled eraser" },
					{ src: "assets/images/projects/eraser-in-use.jpg", alt: "Carbon fiber eraser on a glass whiteboard with orange marker strokes", caption: "Holding on the glass and erasing orange marker" }
				]
			},
			{
				label: "Manufacturing for market",
				items: [
					"Compression molding would suit large-scale production",
					"Prepreg is faster and simpler, but wet layup is cheaper at small scale; prepreg could offset labor costs if volume grew",
					"In-house production is simpler than outsourcing at small volume. Estimated price: ~$25–30, or $30–40 with design and process refinement"
				]
			}
		],
		tags: ["Composites", "Carbon Fiber", "Vacuum Bagging", "Magnetics", "Cost Analysis", "Prototyping"]
	}
];

window.validateProjectIds = function (projects) {
	const ids = new Set();
	projects.forEach((project) => {
		if (!project || typeof project.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) ||
			/^project-\d+$/.test(project.id) || ids.has(project.id)) {
			throw new Error("Each project needs a unique lowercase, hyphenated ID that is not a numbered legacy anchor.");
		}
		ids.add(project.id);
	});
};
