# awesome-github-portfolio

A static, theme-driven developer portfolio powered by Reactive Resume JSON data.

This project renders the same resume content across multiple handcrafted front-end themes. Each theme is self-contained under `themes/`, while shared configuration and RxResume data helpers live at the repo root.

## Overview

- Uses `resume/Reactive Resume.json` as the single source of truth for portfolio content.
- Renders profile, summary, experience, projects, skills, education, and links client-side.
- Ships multiple visual themes that all consume the same resume data.
- Requires no build step or framework runtime; everything is static HTML, CSS, and JavaScript.

## Included Themes

- `themes/amazon` - Amazon-inspired storefront portfolio layout
- `themes/fun-graphic` - bold visual portfolio layout with theme switching
- `themes/graphic` - poster-style editorial layout
- `themes/modern` - modern landing-page portfolio
- `themes/newspaper` - newspaper / gazette-inspired portfolio
- `themes/pokemon-trainer` - Pokémon-themed portfolio layout
- `themes/retro-rpg` - retro RPG-style portfolio with theme switching
- `themes/scrapbook` - scrapbook-style portfolio with semantic design system
- `themes/scrapbook-neon` - neon-themed scrapbook portfolio
- `themes/vscode` - VS Code-inspired developer profile

## How It Works

Each theme:

- loads shared config from `config.js`
- loads shared RxResume helper utilities from `src/rxresume.js`
- reads portfolio content from `resume/Reactive Resume.json`
- renders that content into its own theme-specific layout

Shared helpers in `src/rxresume.js` normalize resume data access, including profile image metadata such as width, height, and aspect ratio.

## Project Structure

```text
.
├── config.js                  # Global configuration
├── Makefile                   # Development commands
├── README.md
├── resume/
│   └── Reactive Resume.json   # Single source of truth for portfolio data
├── src/
│   └── rxresume.js            # Shared resume data utilities
└── themes/                    # All portfolio themes
    ├── amazon/
    ├── fun-graphic/
    ├── graphic/
    ├── modern/
    ├── newspaper/
    ├── pokemon-trainer/
    ├── retro-rpg/
    ├── scrapbook/
    ├── scrapbook-neon/
    └── vscode/
```

Each theme folder contains:
- `index.html` - Theme layout structure
- `app.js` - Theme-specific logic and data rendering
- `style.css` - Theme styles and design tokens
- `assets/` (optional) - Images, fonts, or theme-specific resources

## Requirements

- Python 3.x
- A browser for local preview

## Local Development

### Recommended: serve from the repo root

```bash
python3 -m http.server 9090
```

This is the most reliable option because theme pages reference shared files such as `../../config.js` and `../../src/rxresume.js`.

### Make target

```bash
make dev
```

## Shared Configuration

Global settings live in `config.js`.

Important keys include:

- `paths.resumeData`
- `paths.profileArt`
- `paths.faviconSvg`
- `paths.faviconIco`
- `theme.colors`
- `storage.theme`
- `errors.resumeLoadError`

## Theme Development

Each theme folder typically contains:

- `index.html`
- `app.js`
- `style.css`

When creating or updating a theme:

- keep shared data access in `src/rxresume.js`
- keep theme-specific layout and styling inside that theme folder
- avoid hardcoding resume content inside HTML

## Recent Enhancements

Recent theme updates have added modern UX features and accessibility improvements across themes:

### Design Systems & Styling
- **Semantic CSS Variables**: Color palettes, typography scales, spacing, borders, and shadows
- **Mobile Responsiveness**: Comprehensive @media queries (≤720px breakpoint with hamburger menu)
- **Smooth Transitions**: CSS transitions for theme switching and interactive elements

### Mobile Navigation
- **Hamburger Menu**: Visible at ≤720px with aria-expanded for accessibility
- **Slide-Down Animation**: Navigation menu collapses/expands smoothly
- **Auto-Close**: Navigation closes when a section link is clicked
- **Touch-Friendly Sizing**: Min 44x44px button sizes for mobile usability

### Dynamic Navigation
- **Section-Based Links**: Navigation links automatically generated from portfolio sections
- **Custom Sections**: Support for user-defined sections via #customSectionsContainer
- **Visibility Guards**: Sections only appear in navigation if they contain content

### Accessibility
- **ARIA Labels**: Interactive elements include aria-label and aria-expanded attributes
- **Semantic HTML**: Proper heading hierarchy and navigation structure
- **Keyboard Navigation**: Full keyboard support for theme switching and menus

## Profile Image Behavior

Themes use shared image helpers from `src/rxresume.js` to:

- load the profile photo URL
- normalize photo dimensions
- read picture metadata from RxResume JSON
- render the image consistently across themes

Recent updates in this repo ensure themes can use normalized width and height data and avoid decorative placeholder frames when desired.

## Troubleshooting

### Theme loads but content is missing

Check that `resume/Reactive Resume.json` is valid JSON and follows the expected Reactive Resume structure.

### Images or config fail to load

Make sure the server root and the requested theme path match the relative imports used by each theme.

### Photo looks clipped or framed incorrectly

Check:

- `picture.width`
- `picture.height`
- `picture.aspectRatio`
- theme-specific profile image CSS

## License

See `LICENSE`.