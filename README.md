# Taya Powell Portfolio

A static, two-page professional portfolio hosted on GitHub Pages at
`tayapowell.fyi`. The site has no build step or package manager; its HTML, CSS,
JavaScript, and media files are served directly.

## Pages

- `index.html` is the resume and professional profile.
- `projects.html` is the project portfolio. Its cards and index are generated
  from `assets/js/projects-data.js`.
- `portfolio-viewer.html` generates and displays the downloadable project PDF.
  The resume viewer is generated from `index.html?resume-viewer=1`.

## Editing the site

### Resume and generated PDF

- Edit resume text and structure in `index.html`.
- The profile header's View Project Portfolio link leads directly to
  `projects.html`; the desktop scroll-in sidebar also links to the portfolio.
  The header link is hidden when printing the website.
- Add `data-resume-pdf` to each work-experience bullet that should appear in the
  generated PDF. Give the attribute a value for a concise or combined
  resume-only version; leave it empty to use the website text. Update combined
  versions when their related website bullets change. If an entry has no marked
  bullets, its first three are used.
- For a shorter generated skills line, add a `data-resume-pdf` value to its
  list item. Without a value, the website text is used.
- `assets/js/resume-viewer.js` reads the current resume page before reusing a
  cached PDF, then regenerates the one-page PDF when its content fingerprint or
  template version changes.
- Increment `pdfTemplateVersion` in that script when changing PDF layout or
  generation behavior. Update the script's `?v=` value in `index.html` when
  changing the script itself so browsers fetch the new version.
- The full-width preview, download, and print share a measured one-page layout.
  Narrow screens use a reflowing HTML view, which also remains available for
  preview and printing when the PDF library is unavailable. In the reflowing
  view, the phone number, email, and link labels stay intact while the contact
  line wraps between items or at normal word boundaries.
- Back to Website closes the script-opened viewer when its original site tab is
  still accessible on the site. If that tab is closed, has navigated away, or
  cannot be accessed, the viewer navigates to the site instead. A browser that
  refuses to close the viewer also falls back to navigation.

#### Resume editorial procedure

Follow this procedure whenever new material is added or the resume is revised.
The generator assembles the selected site text and formats it; it does not
rewrite, choose the strongest evidence, or check claims automatically.
Regeneration alone is not a substitute for this review.

1. Review the current resume in `index.html` and relevant project case studies
   in `assets/js/projects-data.js`. Those case studies do not automatically
   become resume entries. Add supported material to `index.html` and select or
   revise the corresponding `data-resume-pdf` text as appropriate.
2. Use the site's professional summary verbatim: `.resume-summary-desc` is the
   source for the viewer and PDF. Do not write a separate or shortened summary.
3. Apply Lean, Accurate, Reliable, and Direct (LARD) technical writing across
   the other resume content. Combine related bullets where useful, remove
   repetition, and use concise, natural sentences with periods rather than
   semicolons. Keep substantive achievements, measurable results, meaningful
   context, all existing experience and project entries, education, and the
   award. Preserve the capstone's nearly half reduction in report length.
4. Emphasize documented work applicable to product development, such as design,
   CAD, prototyping, testing, fabrication, and technical communication, while
   retaining engineering experience. Check each rewritten or combined claim
   against its website sources, including neighboring unmarked bullets. Do not
   invent outcomes, responsibilities, skills, causation, or implications. If
   an impressive detail cannot be supported by the site, omit it or confirm
   and add its source first.
5. Review the marked bullets and skills overrides, including for newly added
   roles. If a role has no marked bullets, the generator takes only its first
   three; explicitly select them when that would omit important evidence. Use
   any available space for additional supported details rather than filler.
6. Open the viewer after saving changes so it checks the current site and
   regenerates when its content or template changes. Compare the full-width
   preview, downloaded PDF, and browser Print output: all should use the same
   clean one-page layout, typography, section spacing, balanced top and bottom
   margins, bold skills labels, and clear, clickable links. Check readability
   at normal viewing size and revise wording rather than relying on shrinking
   the type. Avoid bullet lines ending with only one or two words when possible.
   Verify the summary, entries, award, and significant metrics against the
   site in both outputs. Also check the responsive narrow-screen view.

### Projects and images

- Add each new project to the beginning of `window.PROJECTS` in
  `assets/js/projects-data.js`; entries are shown newest first.
- Keep project content in the data file and rendering/layout behavior in
  `assets/js/projects.js` and `assets/css/projects.css`.
- Each gallery image should have a descriptive `alt` value. Use `caption` for
  visible context and `newRow: true` when a desktop gallery needs a deliberate
  row break.
- Optional project fields and an example are documented at the top of
  `projects-data.js`; gallery-layout rules are in `projects.css`.
- Store project media in `assets/images/projects/` and use repository-relative
  paths in the data.
- The project page's **View / Download Portfolio** link opens
  `portfolio-viewer.html`, which generates a letter-size page for every project
  in the same order as `window.PROJECTS`. The desktop preview, download, and
  PDF print view use the same PDF. The layout and viewer behavior are in
  `assets/js/portfolio-pdf.js`; it uses bundled jsPDF and the selected site
  images. PDF preview support varies by browser, so the viewer also provides
  direct open and download links. Below 850px, a readable HTML preview reflows
  the same curated project text and images rather than relying on the embedded
  PDF viewer. Update `renderMobilePreview` in `portfolio-pdf.js` alongside
  changes to PDF content. On phones and tablets, Share / Print passes the
  generated PDF to the native share sheet, matching the resume viewer. If
  file sharing is unavailable or fails, browser printing uses the reflowed
  preview and may have a different page layout; dismissing the share sheet
  does not invoke printing. Desktop retains its PDF open and download links.
  Back to Projects closes a script-opened
  viewer when its original projects tab is accessible; otherwise it navigates
  to the projects page.
- Give every project a `portfolioPdf` object with a short `title`, a concise
  `summary`, an array of `highlights`, and one to six `images` objects with
  `src` and descriptive `caption` fields. Choose the most useful visuals and
  application-relevant evidence from the case study; do not invent claims.
  Update the curated PDF copy and image selections whenever the source project
  changes. New projects appear in the download after their PDF fields are
  added. Missing fields, image failures, or copy that exceeds the fixed page
  layout produce an error rather than a partial or truncated download.
- The PDF follows the supplied statics portfolio's serif contact header, rule,
  project description, photo grid, and closing impact paragraph. The final
  `highlights` item is the impact; preceding items form the approach paragraph.
- The PDF is generated fresh on each viewer load. All project data and selected
  images are validated or loaded before download links are shown. If an image
  cannot load or copy and captions leave too little room, the viewer reports
  the error; fix the named image or shorten the relevant copy, then reload.
  Each project's PDF link uses its current `#project-N` position. Adding or
  reordering projects changes those positions, so regenerate previously saved
  PDFs if their links need to match the new order.
- Keep the contact details in `assets/js/contact-reveal.js` current; both PDF
  generators use its decoded values. After changing that script, update its
  `?v=` in both `index.html` and `portfolio-viewer.html`.
- After editing project or PDF data, update the corresponding script's `?v=`
  in both `projects.html` and `portfolio-viewer.html` when applicable.
  Download the PDF and inspect every page for legibility,
  accurate claims and captions, image quality, and one page per project.

### Styles and interactions

- `assets/css/shine.css` is the compiled Shine/Bootstrap theme. It is a bundled
  dependency; add site-specific styles to `resume-overrides.css` or
  `projects.css` instead.
- `assets/js/contact-reveal.js`, `resume-nav.js`, and `back-to-top.js` each own
  one small, independent interaction. Keep them separate so page behavior is
  easy to locate and change.
- The resume section links use centered three-and-two rows with consistent
  spacing when their container is too narrow for one row; update that rule in
  `assets/css/resume-overrides.css` if the number of links changes. On phones,
  the enhanced navigation remains a collapsible menu.
- `assets/js/desktop-navigation.js` and `assets/css/desktop-navigation.css`
  add floating counterparts at widths of 768px and above after the original
  controls scroll out of view, including Back to Resume on the projects page.
  The side menu copies the current section or project links and adds the
  header portfolio destination after Projects on the resume page; keep its
  script after `projects.js`, which creates the project index. Its viewer actions
  delegate ordinary clicks to the original links to preserve their named-tab
  behavior. `contact-reveal.js` emits `resume-contact-change` after updating
  the original contact links, and the compact floating details mirror those
  links and state only when the original contact section is above the viewport.
  Original controls remain in place, mobile layout is unchanged, focus returns
  to an available control when floating controls disappear, and all floating
  controls are hidden for print.
- `assets/js/projects.js` renders cards from project data and controls image
  loading, lightbox behavior, and scroll reveal.
- Bump the matching `?v=` value in the page markup whenever a changed CSS,
  JavaScript, or project-data file needs to bypass browser caches.
- The Font Awesome `js/all.js` bundle and its license are retained because the
  back-to-top control uses its icon. Unused Font Awesome formats and Bootstrap
  Sass source are not needed by the static site and are not included.

## Local preview and checks

From the repository root on Windows, run:

```powershell
py -m http.server 8123
```

Open `http://localhost:8123/` and `http://localhost:8123/projects.html`.
There is no automated test runner. Before publishing, verify:

1. Both pages and their images load without console or network errors.
2. The resume menu, contact reveal, print/PDF viewer, project index, lightbox
   (including Escape to close), and back-to-top control work.
3. There is no horizontal page scrolling at narrow and standard phone widths,
   and text wraps at normal word boundaries.
4. The project gallery still matches its approved desktop appearance at a
   720px-tall viewport, and individual photos fit within the screen at
   intermediate widths and short viewport heights.
5. Both the downloaded PDF and the viewer's browser Print output fit on one
   page and contain the intended marked experience bullets.
6. Reduced-motion preferences disable nonessential animations.
7. The portfolio PDF downloads with one consistently formatted page per
   project, correctly captioned images, and working project links. Check the
   reflowed preview on a phone for complete text, images, captions, and links.
8. On both pages at 768px and wider, scroll past the original navigation and
   top bar. Check the Sections menu, sticky actions, keyboard focus and Escape,
   and the contact reveal before and after returning to the top. Confirm the
   floating controls are absent below 768px and in print.

## Hosting and project files

- `CNAME` sets the custom GitHub Pages domain.
- `robots.txt` declares crawler content signals and crawler-specific rules.
- `.gitignore` excludes local documents, environment files, and operating
  system artifacts from the website repository.
- `assets/images/` contains the profile image and project photography.
- `Profile.jpg` remains at the repository root because both HTML pages use that
  path.

## Third-party credits and licenses

The site uses the free Shine resume theme by Xiaoying Riley / 3rd Wave Media.
The theme requires its linked footer attribution to remain in place. The
template may not be resold, sublicensed, or redistributed on its own; its
original details and license are available from the
[Shine theme page](https://themes.3rdwavemedia.com/bootstrap-templates/resume/shine-free-bootstrap-5-light-mode-resume-cv-template-for-developers/).

Font Awesome files retain their embedded attribution and the
`assets/fontawesome/LICENSE.txt` license. jsPDF is bundled in
`assets/js/jspdf.umd.min.js`; Bootstrap Icons and the Inter font are loaded from
their external providers.
