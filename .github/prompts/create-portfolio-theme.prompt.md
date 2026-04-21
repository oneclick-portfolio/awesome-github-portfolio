---
name: "Create Portfolio Theme"
description: "Create a new single-page portfolio theme under themes/ by following the modern theme structure and wiring it into this workspace's existing resume data flow"
argument-hint: "theme name, visual direction, notable sections, interaction ideas"
agent: "agent"
---

Create a new single-page portfolio theme in this repository based on the user's request.

Use the user's arguments as the theme brief. The result must be a real implementation in the workspace, not a plan.

Requirements:
- Create a new folder at `themes/<theme-name>/`.
- Follow the same file pattern as [themes/modern/index.html](../../themes/modern/index.html), [themes/modern/app.js](../../themes/modern/app.js), and [themes/modern/style.css](../../themes/modern/style.css).
- Keep the theme compatible with the existing shared runtime loaded from `../../config.js` and `../../src/rxresume.js`.
- Build a single-page portfolio site that renders resume-driven content from the existing data model.
- Preserve the existing project conventions for section wiring, profile links, resume loading, and error handling.
- Make the new theme visually distinct from `modern` while keeping it production-ready on desktop and mobile.
- Prefer minimal, focused changes outside the new theme folder. Only update shared files if they are required to make the new theme discoverable or selectable.

Implementation checklist:
1. Inspect the existing themes, especially `modern`, before editing.
2. Infer the new theme name from the user's request. If the name is missing, derive a short kebab-case folder name from the visual direction.
3. Create the required files for the new theme folder.
4. Reuse the repository's resume-loading and DOM-population patterns instead of inventing a new data contract.
5. Add only the HTML structure, JavaScript behavior, and CSS needed for the requested design.
6. Validate the changed files for obvious syntax or runtime issues after editing.

Output expectations:
- Implement the files directly.
- Briefly summarize what was created.
- Call out any assumptions you had to make about the design brief.
- Mention any follow-up needed if the user wants the new theme added to a selector, index, or docs.

If the user's request is underspecified, make the smallest reasonable assumptions and continue instead of stopping for broad clarification.