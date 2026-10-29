/*
 * Add a new project by pasting an object at the TOP of this array (newest first).
 * Only `title` is required; any field you leave out is simply not shown.
 *
 *   title, type, date, context   - short text
 *   problem, objective, impact   - short paragraphs
 *   functions, details           - arrays of bullet strings
 *   stats                        - [{ value, label }] headline metrics row
 *   sections                     - [{ label, text, items: [bullets], images: [...] }] report-style groups;
 *                                  put images in the section they illustrate
 *   hero                         - images shown right after the intro (overview / finished product)
 *   tags                         - array of short labels
 *   images                       - optional gallery at the end; prefer section images
 *                                  [{ src: "assets/images/projects/x.jpg", alt: "...", caption: "...", wide: true }]
 *                                  (wide is optional; it makes a panoramic image span the full width)
 */
window.PROJECTS = [
	{
		title: "ANSOL Production Containers: 3D Scan-to-Model Package",
		type: "Professional · REDD Engineering & Construction, Inc.",
		date: "2025 - 2026",
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
		title: "Statics Lab Demonstrations: Hands-On Teaching Aids for ME 201",
		type: "4-person team · Capstone project",
		date: "Winter 2025",
		stats: [
			{ value: "0.05%", label: "lowest measured force error" },
			{ value: "~1.5%", label: "average error, triangle demo" },
			{ value: "< ½", label: "of budget spent" },
			{ value: "3 to 4 ft", label: "accidental drop survived" }
		],
		context: "ME 201 Statics is notoriously challenging, and new students struggle to visualize how its concepts apply to real structures and machines.",
		objective: "Design, build, and validate lab demonstrations that let students see statics concepts and check their own homework answers with real force measurements.",
		hero: [
			{ src: "assets/images/projects/statics-demo-moment.jpg", alt: "Moment demonstration with rubber tube clamps resisting the moment and a luggage scale measuring force", caption: "Moment about an axis: rubber tube clamps resist the moment" },
			{ src: "assets/images/projects/statics-demo-tension.jpg", alt: "3D tension and compression demonstration clamped to a table with luggage scales", caption: "3D tension and compression, read out with luggage scales" },
			{ src: "assets/images/projects/statics-demo-machine.jpg", alt: "Machine demonstration held between two luggage scales", caption: "Machine demonstration: luggage scales measure the forces" }
		],
		functions: [
			"Demonstrate three historically difficult homework problems: moment about an axis, 3D tension and compression, and machines",
			"Measure and display forces with no wiring or programming, using luggage scales as force gauges",
			"Accuracy within 10%, results readable in seconds, setup and takedown in under 120 seconds",
			"Fit within a 48in x 15.5in x 12.3in storage envelope and survive student handling"
		],
		sections: [
			{
				label: "Design process",
				items: [
					"Ran a blue-sky concept session, then organized the ideas into a concept table covering modularity, instrument placement, size, and results display",
					"Used Pugh decision matrices to compare concepts for the carrier, component material, and instrument attachment subsystems",
					"Built proof-of-concept prototypes (modular pegboard, string-and-frame, and large multi-problem box) and learned that restricted access, limited visibility, and fixed hole spacing outweighed their flexibility",
					"Narrowed scope from 5 to 6 problems down to 3 demonstrations to protect quality, a decision that also relaxed the storage envelope"
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
					"Arm demo: 11% error (2.18 lb expected, 1.94 lb measured), tested by finding the point where the arm starts to move, with a bubble level for calibration",
					"Clamp demo: 34.4% error (1.68 lb expected, 1.10 lb measured). Team review noted the mechanism is not static and its force readings are the least accurate, so it works best as a visual aid for reaction-force direction and machine function",
					"Results were consistent across more than 10 repeated trials, and the demos survived an accidental 3 to 4 ft drop",
					"Final cost came in at just under half of the project budget"
				],
				images: [
					{ src: "assets/images/projects/statics-arm-in-use.jpg", alt: "Student pulling a luggage scale to load the arm demonstration", caption: "Arm demo in use: the scale reads the force directly" },
					{ src: "assets/images/projects/statics-clamp-in-use.jpg", alt: "Clamp demonstration being loaded with two luggage scales", caption: "Clamp demo under load, read with two scales" }
				]
			}
		],
		impact: "Delivered a reusable, wireless, durable lab set for ME 201 recitations to improve engagement and understanding of moment principles. The team met every performance measure, and the capstone was awarded \"Best Calculations.\"",
		tags: ["Statics", "Fabrication", "FEA (ANSYS)", "FMEA", "Pugh Matrices", "Design Validation", "Instructional Design"]
	},
	{
		title: "Custom Ergonomic Computer Mouse: Rapid Prototyping & Manufacturing",
		type: "Individual & 20-person team",
		problem: "Commercial mice lack a custom ergonomic fit, causing strain during long CAD sessions.",
		objective: "Complete a full rapid prototyping lifecycle, from low-fidelity testing to SolidWorks organic surfacing and multi-material manufacturing.",
		sections: [
			{
				label: "Low-fidelity concept and ergonomic prototyping",
				layout: "justified",
				stack: true,
				items: [
					"Prototyped individual ergonomic forms in paper, clay and cardboard contour slices to test the form in hand before committing to CAD"
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
					"3D printed the model and gathered user feedback on fit"
				],
				images: [
					{ src: "assets/images/projects/mouse-slicer-supports.jpg", alt: "Support structures in slicer", caption: "Support structures in slicer" },
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
					"Investment metal casting for an accent emblem and a 3D-printed modular lower chassis"
				],
				images: [
					{ src: "assets/images/projects/mouse-5-hex-shell-cad.jpg", alt: "Selected hexagonal shell CAD", caption: "Selected hexagonal shell CAD" },
					{ src: "assets/images/projects/mouse-6-emblem-cad.jpg", alt: "Cast metal accent emblem CAD", caption: "Cast metal accent emblem CAD" },
					{ src: "assets/images/projects/mouse-cast-emblem.jpg", alt: "Cast metal emblem piece held in hand", caption: "Cast metal piece" }
				]
			}
		],
		impact: "Demonstrated individual organic CAD surfacing and collaborative DFM under strict tooling budget constraints.",
		tags: ["SolidWorks", "Surface Modeling", "3D Printing", "Molding & Casting", "DFM"]
	},
	{
		title: "Ultralight Carbon Fiber Whiteboard Eraser: Materials & Magnetic Optimization",
		type: "Individual",
		problem: "Across just 4mm of glass a magnet loses 70–90% of its strength (pull force falls roughly with 1/r²), so heavy magnetic erasers slide or fall off glass whiteboards.",
		objective: "Design a lightweight eraser that stays on a glass whiteboard, using the project to learn composite manufacturing.",
		impact: "Built a working carbon fiber eraser for roughly $25 in materials that holds on the glass and erases marker. Evaluated production scaling (compression molding, prepreg vs. wet layup) and a conservative $25–30 price point.",
		hero: [],
		sections: [
			{
				label: "The physics problem",
				items: [
					"Magnetic pull force drops with distance, roughly as 1/r², so 4mm of glass costs a magnet 70–90% of its strength",
					"Anything too heavy slides or falls off, which is what happened with a popular magnetic eraser that fell off immediately",
					"No comparable product exists and the market for glass-whiteboard accessories is small, so this was built to scratch a personal itch and to learn composites"
				],
				images: [
					{ src: "assets/images/projects/eraser-force-graph.jpg", alt: "Graph of magnetic pull force falling with distance", caption: "Pull force vs. distance through the glass" }
				]
			},
			{
				label: "Concept: a lightweight contoured shell",
				items: [
					"First concept was a contoured shell sketched as the \"Salmon Steak\"",
					"Cheaper materials with stronger magnets would also work. Carbon fiber was chosen deliberately to gain hands-on composites experience"
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
					"Hand wet layup with a 226 resin-hardener system and carbon fiber",
					"Vacuum-bagged over a $4 thrift-store glass bowl, since the contour needs vacuum to stay flush to the mold",
					"Precision was not critical, so a cheap found mold was viable. Vacuum bag ~$8, sealing tape ~$2–3, carbon fiber ~$2–5 used"
				],
				images: [
					{ src: "assets/images/projects/eraser-layup-1.jpg", alt: "Carbon fiber and resin on the mold surface", caption: "Wet layup on the mold" },
					{ src: "assets/images/projects/eraser-layup-2.jpg", alt: "Working the resin into the carbon fiber by hand", caption: "Working resin into the fabric" }
				]
			},
			{
				label: "Post-processing",
				layout: "justified-wide",
				items: [
					"Cured shells were sanded and filed along the edges and surface to remove paper-towel lint left from the acetone cleaning step"
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
					"Bonded two round magnets (~$7) to the back with JB-Weld to compensate for the loss in pull through the glass"
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
					"Prepreg is faster and simpler but wet layup is cheaper at small scale. Prepreg could offset labor costs if the product took off",
					"In-house production is easier than outsourcing at small volume. Conservative price ~$25–30, or $30–40 with design and process polish"
				]
			}
		],
		tags: ["Composites", "Carbon Fiber", "Vacuum Bagging", "Magnetics", "Cost Analysis", "Prototyping"]
	}
];
