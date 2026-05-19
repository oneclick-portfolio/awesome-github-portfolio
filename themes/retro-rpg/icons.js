/* ─── Pixel Art Icon Library ─────────────────────────────────────────────
 * 8-bit pixel art icons rendered as inline SVG.
 * Grid-based icons (heart, medal, scroll, floppy, graduationCap, person) use
 * the gridToSvg helper — each cell is a 1×1 rect, scaled by viewBox.
 * ────────────────────────────────────────────────────────────────────── */

function gridToSvg(grid, palette) {
  const h = grid.length;
  const w = grid[0].length;
  let rects = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const c = grid[y][x];
      if (c !== 0) {
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[c]}"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">${rects}</svg>`;
}

// ── Grid-based icons (8-bit pixel art) ─────────────────────────────────

const HEART_GRID = [
  [0,1,1,0,0,0,1,1,0],
  [1,2,2,1,0,1,2,2,1],
  [1,2,2,2,1,2,2,2,1],
  [1,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,1,0,0],
  [0,0,0,1,2,1,0,0,0],
  [0,0,0,0,1,0,0,0,0],
];
const HEART_PAL = { 1: '#000000', 2: '#e74c3c' };

const MEDAL_GRID = [
  [1,2,1,0,0,1,2,1],
  [0,1,2,1,1,2,1,0],
  [0,0,1,2,2,1,0,0],
  [0,1,3,3,3,3,1,0],
  [1,3,4,4,3,3,3,1],
  [1,3,4,3,3,3,3,1],
  [0,1,3,3,3,3,1,0],
  [0,0,1,1,1,1,0,0],
];
const MEDAL_PAL = { 1: '#000000', 2: '#c0392b', 3: '#f1c40f', 4: '#f39c12' };

const SCROLL_GRID = [
  [0,1,1,1,1,1,1,0],
  [1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1],
  [0,1,1,1,1,1,1,0],
];
const SCROLL_PAL = { 1: '#000000', 2: '#f5deb3' };

const FLOPPY_GRID = [
  [0,1,1,1,1,1,1,0],
  [1,2,2,2,2,2,2,1],
  [1,2,3,3,3,2,2,1],
  [1,2,3,3,3,2,2,1],
  [1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1],
  [1,2,1,3,3,1,2,1],
  [0,1,1,1,1,1,1,0],
];
const FLOPPY_PAL = { 1: '#000000', 2: '#2980b9', 3: '#ecf0f1' };

const HAT_GRID = [
  [0,0,0,0,1,0,0,0,0,0],
  [0,0,0,1,2,1,0,0,0,0],
  [0,0,1,2,2,2,1,0,0,0],
  [0,1,2,2,2,2,2,1,1,0],
  [1,2,2,2,2,2,2,2,2,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,3,3,3,1,0,1,0],
  [0,0,1,3,3,3,1,0,0,1],
];
const HAT_PAL = { 1: '#000000', 2: '#3498db', 3: '#2c3e50' };

const AVATAR_GRID = [
  [0,0,1,1,1,1,0,0],
  [0,1,2,2,2,2,1,0],
  [1,3,3,3,3,3,3,1],
  [1,3,1,3,3,1,3,1],
  [1,3,3,3,3,3,3,1],
  [0,1,3,1,1,3,1,0],
  [0,1,4,4,4,4,1,0],
  [1,4,4,4,4,4,4,1],
];
const AVATAR_PAL = { 1: '#000000', 2: '#8e44ad', 3: '#f1c27d', 4: '#16a085' };

window.RR_ICONS = {
  // === Grid-based 8-bit pixel art icons ===
  heart: gridToSvg(HEART_GRID, HEART_PAL),
  medal: gridToSvg(MEDAL_GRID, MEDAL_PAL),
  scroll: gridToSvg(SCROLL_GRID, SCROLL_PAL),
  floppy: gridToSvg(FLOPPY_GRID, FLOPPY_PAL),
  graduationCap: gridToSvg(HAT_GRID, HAT_PAL),
  person: gridToSvg(AVATAR_GRID, AVATAR_PAL),

  // === Hand-drawn pixel icons (kept for other sections) ===

  // Blue 3D folder (Experience)
  folder: `<svg viewBox="0 0 32 26" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="2" y="2" width="11" height="1" fill="#000"/>
    <rect x="1" y="3" width="1" height="4" fill="#000"/>
    <rect x="13" y="3" width="1" height="2" fill="#000"/>
    <rect x="2" y="3" width="11" height="2" fill="#5a8fd4"/>
    <rect x="2" y="3" width="11" height="1" fill="#8abae4"/>
    <rect x="14" y="5" width="17" height="1" fill="#000"/>
    <rect x="31" y="6" width="1" height="18" fill="#000"/>
    <rect x="1" y="7" width="1" height="17" fill="#000"/>
    <rect x="2" y="24" width="30" height="1" fill="#000"/>
    <rect x="2" y="6" width="29" height="18" fill="#3a6fc4"/>
    <rect x="2" y="6" width="29" height="1" fill="#7aafe4"/>
    <rect x="2" y="6" width="1" height="18" fill="#7aafe4"/>
    <rect x="30" y="6" width="1" height="18" fill="#1c3d8f"/>
    <rect x="2" y="23" width="29" height="1" fill="#1c3d8f"/>
    <rect x="4" y="9" width="25" height="1" fill="#1c3d8f"/>
    <rect x="4" y="10" width="25" height="1" fill="#5a8fd4"/>
  </svg>`,

  // Newspaper stack (Publications)
  newspaper: `<svg viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="3" y="3" width="26" height="1" fill="#000"/>
    <rect x="2" y="4" width="1" height="17" fill="#000"/>
    <rect x="29" y="4" width="1" height="17" fill="#000"/>
    <rect x="3" y="21" width="26" height="1" fill="#000"/>
    <rect x="3" y="4" width="26" height="17" fill="#f5f0d8"/>
    <rect x="3" y="4" width="26" height="1" fill="#fff8e8"/>
    <rect x="5" y="6" width="22" height="2" fill="#000"/>
    <rect x="6" y="6" width="20" height="1" fill="#444"/>
    <rect x="5" y="10" width="9" height="6" fill="#cccccc"/>
    <rect x="5" y="10" width="9" height="1" fill="#888"/>
    <rect x="5" y="15" width="9" height="1" fill="#888"/>
    <rect x="6" y="12" width="7" height="3" fill="#888"/>
    <rect x="15" y="10" width="12" height="1" fill="#444"/>
    <rect x="15" y="12" width="11" height="1" fill="#888"/>
    <rect x="15" y="14" width="12" height="1" fill="#888"/>
    <rect x="15" y="16" width="9" height="1" fill="#888"/>
    <rect x="5" y="17" width="22" height="1" fill="#888"/>
    <rect x="5" y="19" width="22" height="1" fill="#888"/>
  </svg>`,

  // Joystick (Interests - gaming)
  joystick: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="13" y="3" width="6" height="1" fill="#000"/>
    <rect x="12" y="4" width="1" height="4" fill="#000"/>
    <rect x="19" y="4" width="1" height="4" fill="#000"/>
    <rect x="13" y="8" width="6" height="1" fill="#000"/>
    <rect x="13" y="4" width="6" height="4" fill="#ff3344"/>
    <rect x="13" y="4" width="6" height="1" fill="#ff7799"/>
    <rect x="13" y="4" width="1" height="3" fill="#ff7799"/>
    <rect x="14" y="9" width="4" height="11" fill="#000"/>
    <rect x="15" y="9" width="2" height="11" fill="#888888"/>
    <rect x="14" y="9" width="1" height="11" fill="#aaaaaa"/>
    <rect x="6" y="20" width="20" height="1" fill="#000"/>
    <rect x="4" y="21" width="2" height="1" fill="#000"/>
    <rect x="26" y="21" width="2" height="1" fill="#000"/>
    <rect x="3" y="22" width="1" height="6" fill="#000"/>
    <rect x="28" y="22" width="1" height="6" fill="#000"/>
    <rect x="4" y="28" width="24" height="1" fill="#000"/>
    <rect x="4" y="22" width="24" height="6" fill="#2a2a2a"/>
    <rect x="4" y="21" width="24" height="1" fill="#666"/>
    <rect x="6" y="22" width="20" height="1" fill="#444"/>
    <rect x="7" y="24" width="2" height="2" fill="#ff3344"/>
    <rect x="11" y="24" width="2" height="2" fill="#ffcc00"/>
    <rect x="22" y="24" width="2" height="2" fill="#00ff66"/>
    <rect x="18" y="24" width="2" height="2" fill="#3388ff"/>
  </svg>`,

  // Book (Interests - reading)
  book: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="3" y="5" width="26" height="1" fill="#000"/>
    <rect x="2" y="6" width="1" height="22" fill="#000"/>
    <rect x="29" y="6" width="1" height="22" fill="#000"/>
    <rect x="3" y="28" width="26" height="1" fill="#000"/>
    <rect x="3" y="6" width="26" height="22" fill="#3a4f8f"/>
    <rect x="3" y="6" width="26" height="2" fill="#5a6faf"/>
    <rect x="3" y="6" width="1" height="22" fill="#5a6faf"/>
    <rect x="28" y="7" width="1" height="21" fill="#1a2f5f"/>
    <rect x="3" y="27" width="26" height="1" fill="#1a2f5f"/>
    <rect x="15" y="6" width="2" height="22" fill="#1a2f5f"/>
    <rect x="6" y="11" width="8" height="1" fill="#ffcc00"/>
    <rect x="6" y="14" width="7" height="1" fill="#ddd"/>
    <rect x="6" y="16" width="8" height="1" fill="#ddd"/>
    <rect x="6" y="18" width="6" height="1" fill="#ddd"/>
    <rect x="18" y="11" width="8" height="1" fill="#ffcc00"/>
    <rect x="18" y="14" width="7" height="1" fill="#ddd"/>
    <rect x="18" y="16" width="8" height="1" fill="#ddd"/>
    <rect x="18" y="18" width="6" height="1" fill="#ddd"/>
    <rect x="16" y="5" width="2" height="1" fill="#cc0022"/>
    <rect x="16" y="22" width="2" height="6" fill="#cc0022"/>
    <rect x="16" y="28" width="2" height="2" fill="#cc0022"/>
    <rect x="17" y="28" width="1" height="2" fill="#000"/>
  </svg>`,

  // Camera (Interests - photography)
  camera: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="11" y="6" width="10" height="1" fill="#000"/>
    <rect x="10" y="7" width="1" height="3" fill="#000"/>
    <rect x="21" y="7" width="1" height="3" fill="#000"/>
    <rect x="11" y="7" width="10" height="3" fill="#444"/>
    <rect x="11" y="7" width="10" height="1" fill="#666"/>
    <rect x="3" y="10" width="26" height="1" fill="#000"/>
    <rect x="2" y="11" width="1" height="15" fill="#000"/>
    <rect x="29" y="11" width="1" height="15" fill="#000"/>
    <rect x="3" y="26" width="26" height="1" fill="#000"/>
    <rect x="3" y="11" width="26" height="15" fill="#3a3a3a"/>
    <rect x="3" y="11" width="26" height="1" fill="#5a5a5a"/>
    <rect x="3" y="11" width="1" height="15" fill="#5a5a5a"/>
    <rect x="28" y="12" width="1" height="14" fill="#1a1a1a"/>
    <rect x="3" y="25" width="26" height="1" fill="#1a1a1a"/>
    <rect x="11" y="14" width="10" height="1" fill="#000"/>
    <rect x="9" y="15" width="14" height="1" fill="#000"/>
    <rect x="8" y="16" width="1" height="6" fill="#000"/>
    <rect x="23" y="16" width="1" height="6" fill="#000"/>
    <rect x="9" y="22" width="14" height="1" fill="#000"/>
    <rect x="11" y="23" width="10" height="1" fill="#000"/>
    <rect x="9" y="16" width="14" height="6" fill="#5588cc"/>
    <rect x="9" y="16" width="14" height="1" fill="#88bbee"/>
    <rect x="9" y="16" width="1" height="6" fill="#88bbee"/>
    <rect x="12" y="18" width="6" height="3" fill="#3366aa"/>
    <rect x="13" y="19" width="4" height="2" fill="#1a3370"/>
    <rect x="24" y="13" width="3" height="2" fill="#ffcc00"/>
    <rect x="25" y="13" width="1" height="1" fill="#ffee66"/>
  </svg>`,

  // Music note (Interests - music)
  music: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="10" y="4" width="14" height="1" fill="#000"/>
    <rect x="10" y="5" width="1" height="20" fill="#000"/>
    <rect x="24" y="4" width="1" height="14" fill="#000"/>
    <rect x="11" y="5" width="13" height="1" fill="#aa44ff"/>
    <rect x="11" y="6" width="1" height="19" fill="#aa44ff"/>
    <rect x="23" y="6" width="1" height="13" fill="#aa44ff"/>
    <rect x="11" y="5" width="13" height="1" fill="#cc88ff"/>
    <rect x="4" y="20" width="2" height="1" fill="#000"/>
    <rect x="3" y="21" width="1" height="5" fill="#000"/>
    <rect x="6" y="21" width="2" height="4" fill="#000"/>
    <rect x="4" y="26" width="4" height="1" fill="#000"/>
    <rect x="4" y="21" width="2" height="5" fill="#aa44ff"/>
    <rect x="6" y="22" width="1" height="3" fill="#cc88ff"/>
    <rect x="5" y="20" width="1" height="1" fill="#cc88ff"/>
    <rect x="6" y="6" width="4" height="14" fill="#000"/>
    <rect x="20" y="6" width="4" height="13" fill="#000"/>
    <rect x="18" y="18" width="2" height="1" fill="#000"/>
    <rect x="14" y="19" width="2" height="1" fill="#000"/>
    <rect x="13" y="20" width="6" height="1" fill="#000"/>
    <rect x="12" y="21" width="8" height="3" fill="#000"/>
    <rect x="13" y="24" width="6" height="1" fill="#000"/>
    <rect x="14" y="25" width="4" height="1" fill="#000"/>
    <rect x="13" y="21" width="6" height="2" fill="#aa44ff"/>
    <rect x="14" y="23" width="4" height="1" fill="#aa44ff"/>
    <rect x="13" y="21" width="2" height="1" fill="#cc88ff"/>
  </svg>`,

  // Robot head (Interests - AI/ML)
  robot: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="14" y="3" width="4" height="1" fill="#000"/>
    <rect x="15" y="4" width="2" height="3" fill="#000"/>
    <rect x="14" y="7" width="4" height="1" fill="#000"/>
    <rect x="15" y="5" width="2" height="2" fill="#ffcc00"/>
    <rect x="7" y="8" width="18" height="1" fill="#000"/>
    <rect x="6" y="9" width="1" height="13" fill="#000"/>
    <rect x="25" y="9" width="1" height="13" fill="#000"/>
    <rect x="7" y="22" width="18" height="1" fill="#000"/>
    <rect x="7" y="9" width="18" height="13" fill="#8898b8"/>
    <rect x="7" y="9" width="18" height="2" fill="#aab8d0"/>
    <rect x="7" y="9" width="2" height="13" fill="#aab8d0"/>
    <rect x="24" y="10" width="1" height="12" fill="#5a6a8a"/>
    <rect x="9" y="13" width="5" height="4" fill="#000"/>
    <rect x="18" y="13" width="5" height="4" fill="#000"/>
    <rect x="10" y="14" width="3" height="2" fill="#00ffcc"/>
    <rect x="19" y="14" width="3" height="2" fill="#00ffcc"/>
    <rect x="11" y="14" width="1" height="1" fill="#ffffff"/>
    <rect x="20" y="14" width="1" height="1" fill="#ffffff"/>
    <rect x="11" y="19" width="10" height="1" fill="#000"/>
    <rect x="11" y="19" width="2" height="1" fill="#ffcc00"/>
    <rect x="14" y="19" width="2" height="1" fill="#ffcc00"/>
    <rect x="17" y="19" width="2" height="1" fill="#ffcc00"/>
    <rect x="4" y="13" width="3" height="2" fill="#000"/>
    <rect x="25" y="13" width="3" height="2" fill="#000"/>
    <rect x="9" y="23" width="14" height="3" fill="#000"/>
    <rect x="10" y="24" width="12" height="1" fill="#aab8d0"/>
  </svg>`,

  // CRT computer monitor (Interests - retro tech)
  computer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="3" y="4" width="26" height="1" fill="#000"/>
    <rect x="2" y="5" width="1" height="17" fill="#000"/>
    <rect x="29" y="5" width="1" height="17" fill="#000"/>
    <rect x="3" y="22" width="26" height="1" fill="#000"/>
    <rect x="3" y="5" width="26" height="17" fill="#ddd0a8"/>
    <rect x="3" y="5" width="26" height="1" fill="#f0e0bb"/>
    <rect x="3" y="5" width="1" height="17" fill="#f0e0bb"/>
    <rect x="28" y="6" width="1" height="16" fill="#aa9878"/>
    <rect x="3" y="21" width="26" height="1" fill="#aa9878"/>
    <rect x="5" y="7" width="22" height="1" fill="#000"/>
    <rect x="4" y="8" width="1" height="11" fill="#000"/>
    <rect x="27" y="8" width="1" height="11" fill="#000"/>
    <rect x="5" y="19" width="22" height="1" fill="#000"/>
    <rect x="5" y="8" width="22" height="11" fill="#001a00"/>
    <rect x="6" y="9" width="6" height="1" fill="#00ff66"/>
    <rect x="6" y="11" width="10" height="1" fill="#00ff66"/>
    <rect x="6" y="13" width="8" height="1" fill="#00ff66"/>
    <rect x="6" y="15" width="12" height="1" fill="#00ff66"/>
    <rect x="6" y="17" width="4" height="1" fill="#00ff66"/>
    <rect x="11" y="17" width="2" height="1" fill="#00ff66"/>
    <rect x="11" y="23" width="10" height="1" fill="#000"/>
    <rect x="10" y="24" width="12" height="3" fill="#000"/>
    <rect x="10" y="24" width="12" height="2" fill="#ddd0a8"/>
    <rect x="10" y="25" width="12" height="1" fill="#aa9878"/>
    <rect x="7" y="27" width="18" height="1" fill="#000"/>
    <rect x="6" y="28" width="20" height="2" fill="#000"/>
    <rect x="7" y="28" width="18" height="1" fill="#888"/>
  </svg>`,

  // Flag (Languages - generic)
  flag: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="6" y="3" width="2" height="26" fill="#000"/>
    <rect x="6" y="3" width="1" height="26" fill="#aaa"/>
    <rect x="8" y="4" width="18" height="1" fill="#000"/>
    <rect x="26" y="5" width="1" height="10" fill="#000"/>
    <rect x="8" y="15" width="18" height="1" fill="#000"/>
    <rect x="8" y="5" width="18" height="10" fill="#3388ff"/>
    <rect x="8" y="5" width="18" height="3" fill="#ffffff"/>
    <rect x="8" y="11" width="18" height="2" fill="#ffffff"/>
    <rect x="8" y="5" width="8" height="6" fill="#1a44aa"/>
    <rect x="10" y="7" width="1" height="1" fill="#ffcc00"/>
    <rect x="13" y="7" width="1" height="1" fill="#ffcc00"/>
    <rect x="11" y="9" width="1" height="1" fill="#ffcc00"/>
    <rect x="14" y="9" width="1" height="1" fill="#ffcc00"/>
    <rect x="8" y="5" width="18" height="1" fill="#66aaff"/>
  </svg>`,

  // Sword (Skills)
  sword: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="22" y="3" width="6" height="1" fill="#000"/>
    <rect x="22" y="4" width="1" height="6" fill="#000"/>
    <rect x="28" y="4" width="1" height="2" fill="#000"/>
    <rect x="23" y="4" width="5" height="1" fill="#dddddd"/>
    <rect x="23" y="5" width="5" height="4" fill="#aaaaaa"/>
    <rect x="23" y="9" width="5" height="1" fill="#888888"/>
    <rect x="22" y="9" width="1" height="2" fill="#000"/>
    <rect x="6" y="22" width="6" height="1" fill="#000"/>
    <rect x="5" y="22" width="1" height="6" fill="#000"/>
    <rect x="11" y="22" width="1" height="2" fill="#000"/>
    <rect x="6" y="23" width="6" height="1" fill="#dddddd"/>
    <rect x="6" y="24" width="5" height="3" fill="#aaaaaa"/>
    <rect x="11" y="24" width="1" height="4" fill="#000"/>
    <rect x="13" y="11" width="9" height="1" fill="#000"/>
    <rect x="12" y="12" width="9" height="1" fill="#000"/>
    <rect x="11" y="13" width="9" height="1" fill="#000"/>
    <rect x="10" y="14" width="9" height="1" fill="#000"/>
    <rect x="9" y="15" width="9" height="1" fill="#000"/>
    <rect x="8" y="16" width="9" height="1" fill="#000"/>
    <rect x="7" y="17" width="9" height="1" fill="#000"/>
    <rect x="6" y="18" width="9" height="1" fill="#000"/>
    <rect x="5" y="19" width="9" height="1" fill="#000"/>
    <rect x="6" y="20" width="7" height="1" fill="#000"/>
    <rect x="7" y="21" width="5" height="1" fill="#000"/>
    <rect x="13" y="12" width="8" height="1" fill="#dddddd"/>
    <rect x="12" y="13" width="8" height="1" fill="#bbbbbb"/>
    <rect x="11" y="14" width="8" height="1" fill="#aaaaaa"/>
    <rect x="10" y="15" width="8" height="1" fill="#999999"/>
    <rect x="9" y="16" width="8" height="1" fill="#888888"/>
    <rect x="8" y="17" width="8" height="1" fill="#777777"/>
    <rect x="7" y="18" width="8" height="1" fill="#666666"/>
    <rect x="6" y="19" width="8" height="1" fill="#555555"/>
    <rect x="7" y="20" width="6" height="1" fill="#444444"/>
    <rect x="8" y="21" width="4" height="1" fill="#333333"/>
  </svg>`,

  // === BOTTOM NAV ICONS (16x16) ===
  home: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="7" y="2" width="2" height="1" fill="#000"/>
    <rect x="6" y="3" width="4" height="1" fill="#000"/>
    <rect x="5" y="4" width="6" height="1" fill="#000"/>
    <rect x="4" y="5" width="8" height="1" fill="#000"/>
    <rect x="3" y="6" width="10" height="1" fill="#000"/>
    <rect x="2" y="7" width="12" height="1" fill="#000"/>
    <rect x="3" y="8" width="1" height="6" fill="#000"/>
    <rect x="12" y="8" width="1" height="6" fill="#000"/>
    <rect x="3" y="14" width="10" height="1" fill="#000"/>
    <rect x="4" y="8" width="8" height="6" fill="#cc4422"/>
    <rect x="4" y="4" width="7" height="1" fill="#cc4422"/>
    <rect x="5" y="5" width="6" height="2" fill="#cc4422"/>
    <rect x="3" y="7" width="10" height="1" fill="#aa2200"/>
    <rect x="4" y="8" width="8" height="1" fill="#ee6644"/>
    <rect x="6" y="10" width="2" height="3" fill="#3a4f8f"/>
    <rect x="9" y="10" width="2" height="2" fill="#ffcc00"/>
  </svg>`,

  navFolder: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="1" y="3" width="5" height="1" fill="#000"/>
    <rect x="1" y="4" width="1" height="2" fill="#000"/>
    <rect x="6" y="4" width="1" height="1" fill="#000"/>
    <rect x="7" y="5" width="8" height="1" fill="#000"/>
    <rect x="15" y="5" width="1" height="9" fill="#000"/>
    <rect x="1" y="6" width="1" height="8" fill="#000"/>
    <rect x="1" y="14" width="14" height="1" fill="#000"/>
    <rect x="2" y="4" width="4" height="2" fill="#ffcc00"/>
    <rect x="2" y="6" width="13" height="8" fill="#ffcc00"/>
    <rect x="2" y="6" width="13" height="1" fill="#ffee66"/>
    <rect x="14" y="6" width="1" height="8" fill="#aa8800"/>
    <rect x="2" y="13" width="13" height="1" fill="#aa8800"/>
  </svg>`,

  gamepad: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="2" y="5" width="12" height="1" fill="#000"/>
    <rect x="1" y="6" width="1" height="5" fill="#000"/>
    <rect x="14" y="6" width="1" height="5" fill="#000"/>
    <rect x="2" y="11" width="3" height="1" fill="#000"/>
    <rect x="11" y="11" width="3" height="1" fill="#000"/>
    <rect x="2" y="6" width="12" height="5" fill="#4a4a4a"/>
    <rect x="2" y="6" width="12" height="1" fill="#6a6a6a"/>
    <rect x="3" y="8" width="1" height="1" fill="#000"/>
    <rect x="5" y="8" width="1" height="1" fill="#000"/>
    <rect x="4" y="7" width="1" height="3" fill="#000"/>
    <rect x="10" y="7" width="1" height="2" fill="#ff3344"/>
    <rect x="12" y="7" width="1" height="2" fill="#ffcc00"/>
    <rect x="11" y="8" width="1" height="2" fill="#3388ff"/>
  </svg>`,

  star: `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect x="7" y="1" width="2" height="3" fill="#000"/>
    <rect x="6" y="3" width="1" height="1" fill="#000"/>
    <rect x="9" y="3" width="1" height="1" fill="#000"/>
    <rect x="1" y="5" width="14" height="1" fill="#000"/>
    <rect x="2" y="6" width="2" height="1" fill="#000"/>
    <rect x="12" y="6" width="2" height="1" fill="#000"/>
    <rect x="3" y="7" width="2" height="1" fill="#000"/>
    <rect x="11" y="7" width="2" height="1" fill="#000"/>
    <rect x="3" y="8" width="1" height="3" fill="#000"/>
    <rect x="12" y="8" width="1" height="3" fill="#000"/>
    <rect x="4" y="11" width="2" height="1" fill="#000"/>
    <rect x="10" y="11" width="2" height="1" fill="#000"/>
    <rect x="5" y="12" width="1" height="2" fill="#000"/>
    <rect x="10" y="12" width="1" height="2" fill="#000"/>
    <rect x="6" y="14" width="2" height="1" fill="#000"/>
    <rect x="8" y="14" width="2" height="1" fill="#000"/>
    <rect x="7" y="4" width="2" height="1" fill="#ffcc00"/>
    <rect x="6" y="5" width="4" height="1" fill="#ffcc00"/>
    <rect x="2" y="6" width="12" height="1" fill="#ffcc00"/>
    <rect x="3" y="7" width="10" height="1" fill="#ffcc00"/>
    <rect x="4" y="8" width="8" height="2" fill="#ffcc00"/>
    <rect x="4" y="10" width="3" height="1" fill="#ffcc00"/>
    <rect x="9" y="10" width="3" height="1" fill="#ffcc00"/>
    <rect x="5" y="11" width="2" height="1" fill="#ffcc00"/>
    <rect x="9" y="11" width="2" height="1" fill="#ffcc00"/>
    <rect x="4" y="12" width="2" height="1" fill="#ffcc00"/>
    <rect x="10" y="12" width="2" height="1" fill="#ffcc00"/>
    <rect x="6" y="6" width="1" height="2" fill="#ffee66"/>
  </svg>`,
};
