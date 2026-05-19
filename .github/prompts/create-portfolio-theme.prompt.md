---
name: "Create Portfolio Theme"
description: "Create a new single-page portfolio theme under themes/ by following the fun-graphic theme structure and wiring it into this workspace's existing resume data flow"
argument-hint: "theme name, visual direction, notable sections, interaction ideas"
agent: "agent"
---

Create a new single-page portfolio theme in this repository based on the user's request.

Use the user's arguments as the theme brief. The result must be a real implementation in the workspace, not a plan.

Requirements:
- Create a new folder at `themes/<theme-name>/`.
- Follow the same file pattern as [themes/fun-graphic/index.html](../../themes/fun-graphic/index.html), [themes/fun-graphic/app.js](../../themes/fun-graphic/app.js), and [themes/fun-graphic/style.css](../../themes/fun-graphic/style.css).
- Keep the theme compatible with the existing shared runtime loaded from `../../config.js` and `../../src/rxresume.js`.
- Build a single-page portfolio site that renders resume-driven content from the existing data model.
- Preserve the existing project conventions for section wiring, profile links, resume loading, and error handling.
- Ensure section visibility is data-driven: if a section has no visible data, do not render its empty container/title/placeholder.
- Treat "visible data" as:
	- section-level content that is non-empty and not hidden (for example summary)
	- or `window.RxResumeData.getItems(resume, sectionName).length > 0` for list-based sections
- Apply this to all 12 standard sections plus customSections:
	- Basic sections: summary, profiles/contact links
	- Work sections: experience, volunteer
	- Learning sections: education, skills, languages
	- Portfolio sections: projects
	- Recognition sections: awards, certifications, publications
	- Other sections: interests, references
	- Dynamic sections: customSections (user-created sections with configurable types)
- Do not show empty headings when the corresponding section has no visible entries.
- Implement section visibility guards: `window.RxResumeData.getItems(resume, sectionName)` for standard sections and `window.RxResumeData.getCustomSections(resume)` for custom sections.
- Make the new theme visually distinct from `fun-graphic` while keeping it production-ready on desktop and mobile.
- Prefer minimal, focused changes outside the new theme folder. Only update shared files if they are required to make the new theme discoverable or selectable.
- Keep deployment compatibility with the OneClick flow:
	- `index.html`, `app.js`, and `style.css` must exist in the theme folder
	- shared runtime imports must remain compatible with `../../config.js` and `../../src/rxresume.js`
	- avoid introducing a custom data contract that bypasses shared resume helpers

## UX Architecture Standards (Follow fun-graphic Theme Pattern)

All themes should implement the following modern UX features for consistency and accessibility:

### 1. CSS Design System (style.css)
- Define 50+ semantic CSS custom properties (variables) for:
  - Colors: `--bg`, `--surface`, `--ink`, `--muted`, `--accent`, `--link`
  - Spacing: `--space-xs` through `--space-xl` for consistent margins/padding
  - Typography: `--text-sm`, `--text-base`, `--text-lg`, etc.
  - Borders: `--radius-sm`, `--radius-md`, `--radius-lg` for consistent border radius
- Custom sections: Define `.custom-items-*` grid/flex layouts with consistent gaps

### 2. Mobile Navigation (app.js)
- Implement `MobileNav` class that:
  - Manages hamburger menu toggle button (.nav-toggle)
  - Opens/closes navigation panel (.site-nav) with .is-open class
  - Auto-closes navigation when a link is clicked
  - Uses event listeners for click and keyboard events
- Add hamburger button to HTML: `<button class="nav-toggle" aria-label="Toggle navigation menu">☰</button>`
- Style nav toggle to hide on desktop (display: none) and show on mobile

### 3. Dynamic Navigation Links (app.js)
- Implement `updateNavigationLinks()` function that:
  - Dynamically generates nav links for available sections (Experience, Projects, Education, etc.)
  - Queries custom sections from #customSectionsContainer
  - Only adds links for visible (non-hidden) sections
  - Prevents empty sections from appearing in navigation
  - Extracts custom section titles from .panel-head h2 or item.title/item.name
  - Uses title fallback: `item.title || item.name || 'Untitled'` to avoid undefined text
  - Inserts links in correct order before theme-toggle and email link
- Call `updateNavigationLinks()` at end of `loadResumeData()` and `renderCustomSections()`
- Use this exact ordered section list (13 standard sections + custom):
  ```javascript
  const sections = [
    { href: '#summaryText', label: 'Summary', container: '#summarySection' },
    { href: '#profilesGrid', label: 'Profiles', container: '#profilesSection' },
    { href: '#experience', label: 'Experience', container: '#experience' },
    { href: '#projects', label: 'Projects', container: '#projects' },
    { href: '#skills-section', label: 'Skills', container: '#skillsSection' },
    { href: '#education-section', label: 'Education', container: '#educationSection' },
    { href: '#languages-section', label: 'Languages', container: '#languagesSection' },
    { href: '#interests-section', label: 'Interests', container: '#interestsSection' },
    { href: '#awards-section', label: 'Awards', container: '#awardsSection' },
    { href: '#certifications-section', label: 'Certifications', container: '#certificationsSection' },
    { href: '#publications-section', label: 'Publications', container: '#publicationsSection' },
    { href: '#volunteer-section', label: 'Volunteer', container: '#volunteerSection' },
    { href: '#references-section', label: 'References', container: '#referencesSection' }
  ];
  // Then append custom sections dynamically after the standard list
  // NOTE: `href` is the scroll target (actual section ID), `container` is for visibility checks (anchor div)
  ```
- **Anchor div pattern for grid-embedded sections**: Sections inside a CSS Grid (e.g. craft panels for Skills, Education, Languages) don't have their own wrapper with an ID. Insert an empty `<div>` anchor immediately before each such panel, and apply `display: contents` in CSS so it doesn't consume a grid cell:
  ```html
  <!-- in index.html, inside the craft grid -->
  <div id="skillsSection"></div>
  <section class="craft-panel"><!-- Skills content --></section>

  <div id="educationSection"></div>
  <section class="craft-panel"><!-- Education content --></section>
  ```
  ```css
  /* in style.css — prevents anchor divs from taking up grid space */
  #skillsSection, #educationSection, #languagesSection,
  #interestsSection, #awardsSection, #certificationsSection,
  #publicationsSection, #volunteerSection, #referencesSection,
  #summarySection, #profilesSection, #experienceSection, #projectsSection {
    display: contents;
  }
  ```
- **Link hiding**: When hiding links (e.g. empty GitHub/LinkedIn/Contact), use `element.hidden = true` and `element.setAttribute('aria-hidden', 'true')` — **not** a CSS opacity class like `is-disabled`. Restore with `element.hidden = false; element.removeAttribute('aria-hidden')`.
- **Navigation scrolling**: For desktop themes with many nav links, add horizontal scrolling to `.site-nav`:
  ```css
  .site-nav {
    overflow-x: auto;         /* Enable horizontal scrolling */
    overflow-y: hidden;       /* Prevent vertical scroll */
    flex-wrap: nowrap;        /* Keep links on single line */
    scroll-behavior: smooth;  /* Smooth scroll animation */
    scrollbar-width: thin;    /* Thin scrollbar */
    scrollbar-color: var(--line) transparent;  /* Custom scrollbar color */
    -webkit-overflow-scrolling: touch;  /* iOS momentum scrolling */
  }
  ```

### 4. Section Spacing Standardization (style.css)
- Define consistent spacing for all sections:
  - Hero section (profile): `padding: 48px 0 40px;`
  - Strip sections (dividers): `padding: 40px 0;`
  - Content sections (work/education/skills): `padding: 48px 0;`
  - Custom sections: Use consistent gaps between items (8px-16px depending on item size)
- Ensure uniform vertical rhythm throughout the page

### 5. Mobile Optimization (style.css)
- Create responsive media query: `@media (max-width: 720px)`
  - Single-column layouts for all multi-column sections
  - Hamburger menu visible; desktop nav hidden
  - Reduced padding on mobile (24px instead of 48px)
  - Responsive typography using `clamp()`: e.g., `font-size: clamp(14px, 2vw, 16px)`
  - Touch-friendly button sizes (minimum 44x44px)
  - Optimized image sizes for mobile screens
- Test at multiple breakpoints: 320px, 480px, 720px, 1024px

Implementation checklist:
1. Inspect the existing themes, especially `fun-graphic`, before editing. Reference it as the standard for UX architecture.
2. Infer the new theme name from the user's request. If the name is missing, derive a short kebab-case folder name from the visual direction.
3. Create the required files for the new theme folder.
4. **Implement CSS Design System first** (style.css):
   - Define 50+ semantic CSS custom properties organized by category (colors, spacing, typography, borders)
5. **Implement Mobile Navigation** (app.js):
   - Add `MobileNav` class for hamburger menu management
   - Wire up .nav-toggle button with click handlers
   - Auto-close menu on link click
6. **Implement Dynamic Navigation** (app.js):
   - Add `updateNavigationLinks()` function with the full 13-section ordered list from Section 3
   - Call at end of `loadResumeData()` and `renderCustomSections()`
   - Only add links for visible sections (check `container && !container.hidden`)
   - Add anchor `<div id="…Section">` elements in HTML before each craft panel that lacks its own wrapper ID
   - Apply `display: contents` in CSS for all anchor divs so they don't participate in grid layout
   - Use `element.hidden = true/false` (not CSS classes) for all show/hide link logic
8. Reuse the repository's resume-loading and DOM-population patterns instead of inventing a new data contract.
9. Implement per-section visibility guards for all 12 sections + customSections so empty sections are fully hidden, not just left blank.
10. **Implement spacing standardization** (style.css):
    - Hero: `padding: 48px 0 40px;`
    - Strip: `padding: 40px 0;`
    - Content: `padding: 48px 0;`
    - Custom sections: Consistent gaps between items
11. **Implement mobile optimization** (style.css):
    - Add `@media (max-width: 720px)` media query
    - Single-column layouts, hamburger menu visible
    - Responsive typography with `clamp()`
    - Test at 320px, 480px, 720px, 1024px breakpoints
12. Add only the HTML structure, JavaScript behavior, and CSS needed for the requested design.
13. Validate the changed files for obvious syntax or runtime issues after editing.
