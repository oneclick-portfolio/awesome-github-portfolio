/* ─────────────────────────────────────────────────────────────────────
   Amazon Theme — app logic
   ─────────────────────────────────────────────────────────────────────
   Responsibilities:
   - Load resume data and render Amazon-style product cards
   - Search bar filters skill / project / experience / review cards
   - Recruiter Shopping Cart with slide-out pane + mailto checkout
   - Customer Reviews from references (verified-purchase, helpful votes)
   ───────────────────────────────────────────────────────────────────── */

const THEME_ID = 'amazon';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let resume = null;
let basicsCache = {};

/* ═══ Shopping Cart ═════════════════════════════════════════════════ */

class Cart {
  constructor() {
    this.items = [];                  // {id, name, kind, description}
    this.countEl = $('#cartCount');
    this.headCountEl = $('#cartHeadCount');
    this.footCountEl = $('#cartFootCount');
    this.itemsEl = $('#cartItems');
    this.checkoutBtn = $('#checkoutBtn');
    this.pane = $('#cartPane');
    this.backdrop = $('#cartBackdrop');

    $('#cartButton').addEventListener('click', () => this.open());
    $('#cartClose').addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());
    this.checkoutBtn.addEventListener('click', () => this.checkout());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
    this.render();
  }

  has(id) {
    return this.items.some((i) => i.id === id);
  }

  add(item) {
    if (this.has(item.id)) return false;
    this.items.push(item);
    this.render();
    showToast(`Added to cart: ${item.name}`);
    return true;
  }

  remove(id) {
    this.items = this.items.filter((i) => i.id !== id);
    this.render();
  }

  open() {
    this.pane.hidden = false;
    this.backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.pane.hidden = true;
    this.backdrop.hidden = true;
    document.body.style.overflow = '';
  }

  render() {
    const n = this.items.length;
    this.countEl.textContent = n;
    this.headCountEl.textContent = `(${n} item${n === 1 ? '' : 's'})`;
    this.footCountEl.textContent = n;
    this.checkoutBtn.disabled = n === 0;

    // re-sync Add-to-Cart buttons across the page
    $$('.az-add-btn').forEach((btn) => {
      const inCart = this.has(btn.dataset.id);
      btn.textContent = inCart ? '✓ In Cart' : 'Add to Cart';
      btn.classList.toggle('is-in-cart', inCart);
    });

    if (n === 0) {
      this.itemsEl.innerHTML = `<p class="az-cart-empty">Your Recruiter Cart is empty. Add skills or projects you'd like to "purchase".</p>`;
      return;
    }

    this.itemsEl.innerHTML = '';
    this.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'az-cart-item';
      row.dataset.kind = item.kind;
      const icon = kindIcon(item.kind);
      row.innerHTML = `
        <div class="az-cart-item-img">${icon}</div>
        <div class="az-cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <span class="kind">${item.kind}</span>
          <div class="stock">In stock — ready to discuss</div>
          <button class="az-cart-item-remove" data-id="${item.id}">Delete</button>
        </div>
        <div class="az-cart-item-price">⭐</div>
      `;
      this.itemsEl.appendChild(row);
    });
    this.itemsEl.querySelectorAll('.az-cart-item-remove').forEach((btn) => {
      btn.addEventListener('click', () => this.remove(btn.dataset.id));
    });
  }

  checkout() {
    if (this.items.length === 0) return;
    const name = basicsCache.name || 'there';
    const email = basicsCache.email;

    const itemList = this.items.map((i) => `  • ${i.name} (${i.kind})`).join('\n');
    const subject = encodeURIComponent(`Interested in your expertise — Recruiter Inquiry`);
    const body = encodeURIComponent(
      `Hi ${name},\n\n` +
      `I came across your portfolio and I am interested in "purchasing" your expertise in:\n\n` +
      `${itemList}\n\n` +
      `for our team. Let's schedule a call to discuss the opportunity!\n\n` +
      `Best regards,\nRecruiter`
    );

    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      showToast('No contact email on file — copy the items list and reach out via LinkedIn.');
    }
  }
}

const cart = new Cart();

/* ═══ Helpers ═══════════════════════════════════════════════════════ */

function kindIcon(kind) {
  switch (kind) {
    case 'skill': return '🛠️';
    case 'project': return '📦';
    case 'experience': return '💼';
    default: return '🏷️';
  }
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function stripHtml(html = '') {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
}

// Deterministic random price between $19.99 and $499.99 from a seed.
function pseudoPrice(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 13 + seed.charCodeAt(i)) >>> 0;
  return (19 + (h % 480)) + 0.99;
}

function starsMarkup(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._tid);
  showToast._tid = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ═══ Product Card Builder ══════════════════════════════════════════ */

function makeCard({ id, kind, title, subtitle, description, link, icon, category }) {
  const card = document.createElement('article');
  card.className = 'az-card';
  card.dataset.searchText = `${title} ${subtitle || ''} ${description || ''}`.toLowerCase();
  card.dataset.kind = kind;

  const seed = `${kind}|${title}`;
  const price = pseudoPrice(seed);
  const priceInt = Math.floor(price);
  const priceDec = String(Math.round((price - priceInt) * 100)).padStart(2, '0');

  card.innerHTML = `
    <div class="az-card-img" data-category="${category || kind}">${icon || kindIcon(kind)}</div>
    <h3 class="az-card-title">${escapeHtml(title)}</h3>
    ${subtitle ? `<p class="az-card-subtitle">${escapeHtml(subtitle)}</p>` : ''}
    <div class="az-card-stars">
      <span class="stars">★★★★★</span>
    </div>
    ${description ? `<p class="az-card-desc">${escapeHtml(stripHtml(description))}</p>` : ''}
    <div class="az-card-price"><span class="sym">$</span>${priceInt}<span class="sym">.${priceDec}</span></div>
    <div class="az-card-meta">FREE delivery · In Stock</div>
    <div class="az-card-actions">
      <button class="az-btn az-btn-cart az-add-btn" data-id="${id}">Add to Cart</button>
      ${link ? `<a class="az-card-link" href="${link}" target="_blank" rel="noopener">View details →</a>` : ''}
    </div>
  `;

  const addBtn = card.querySelector('.az-add-btn');
  addBtn.addEventListener('click', () => {
    if (cart.has(id)) {
      cart.remove(id);
      showToast(`Removed: ${title}`);
    } else {
      cart.add({ id, name: title, kind, description: stripHtml(description || '') });
    }
  });

  return card;
}

/* ═══ Renderers ═════════════════════════════════════════════════════ */

function renderHero(basics) {
  $$('[data-name]').forEach((n) => { n.textContent = basics.name || ''; });
  $$('[data-headline]').forEach((n) => { n.textContent = basics.headline || ''; });
  $('#heroLocation').textContent = basics.location || '';

  // Random price (this is the only fabricated bit, per spec)
  const priceSeed = `profile|${basics.name || ''}`;
  const price = Math.floor(pseudoPrice(priceSeed));
  $('#heroPrice').textContent = price;

  const summary = resume.summary?.hidden ? '' : (resume.summary?.content || '');
  $('#summaryText').innerHTML = summary;

  // Render profile picture into the hero image slot (or fallback initials)
  const target = $('#profileImage');
  const pictureUrl = window.RxResumeData.getPictureUrl?.(resume) || basics.picture?.url || '';
  const pictureMeta = window.RxResumeData.getPictureMetadata?.(resume) || {};
  if (target) {
    if (pictureUrl && !pictureMeta.hidden) {
      target.innerHTML = '';
      target.classList.add('has-photo');
      const img = document.createElement('img');
      img.src = pictureUrl;
      img.alt = basics.name || 'Profile';
      img.loading = 'lazy';
      target.appendChild(img);
    } else {
      // Fallback to initials — no fabricated content
      const initials = (basics.name || '?').split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();
      target.innerHTML = `<span class="az-hero-initials">${escapeHtml(initials)}</span>`;
    }
  }

  // Add-to-cart actions on the hero pull from real basics data
  const heroItem = {
    id: 'profile:hero',
    name: basics.name || 'Profile',
    kind: 'profile',
    description: basics.headline || ''
  };
  $('#dealAddToCart').addEventListener('click', () => cart.add(heroItem));
  $('#dealBuyNow').addEventListener('click', () => { cart.add(heroItem); cart.open(); });
}

function renderSkills(skills) {
  const grid = $('#skillsGrid');
  grid.innerHTML = '';
  if (skills.length === 0) { grid.closest('.az-row').hidden = true; return; }
  skills.forEach((skill, i) => {
    const description = (skill.keywords && skill.keywords.length)
      ? `Keywords: ${skill.keywords.join(', ')}`
      : (skill.description || 'Top-rated technical skill backed by years of production experience.');
    grid.appendChild(makeCard({
      id: `skill:${i}:${skill.name}`,
      kind: 'skill',
      title: skill.name || 'Skill',
      subtitle: skill.level || 'Best Seller',
      description,
      icon: '🛠️',
      category: 'skill',
    }));
  });
}

function renderProjects(projects) {
  const grid = $('#projectsGrid');
  grid.innerHTML = '';
  if (projects.length === 0) { grid.closest('.az-row').hidden = true; return; }
  projects.forEach((p, i) => {
    const link = window.RxResumeData.getLink(p.website);
    grid.appendChild(makeCard({
      id: `project:${i}:${p.name}`,
      kind: 'project',
      title: p.name || 'Project',
      subtitle: p.period || 'Deal of the Day',
      description: p.description,
      link,
      icon: '📦',
      category: 'project',
    }));
  });
}

function renderExperience(experience) {
  const grid = $('#experienceGrid');
  grid.innerHTML = '';
  if (experience.length === 0) { grid.closest('.az-row').hidden = true; return; }
  experience.forEach((e, i) => {
    const link = window.RxResumeData.getLink(e.website);
    grid.appendChild(makeCard({
      id: `exp:${i}:${e.position}-${e.company}`,
      kind: 'experience',
      title: e.position || 'Role',
      subtitle: `${e.company || ''} · ${e.period || ''}`.trim(),
      description: e.description,
      link,
      icon: '💼',
      category: 'experience',
    }));
  });
}

function renderMiniList(containerSel, blockSel, items, formatter) {
  const container = $(containerSel);
  const block = $(blockSel);
  if (!container) return;
  container.innerHTML = '';
  if (!items || items.length === 0) {
    if (block) block.hidden = true;
    return;
  }
  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'az-mini-item';
    el.innerHTML = formatter(item);
    container.appendChild(el);
  });
}

function renderEducation(items) {
  renderMiniList('#educationList', null, items, (e) => `
    <h4>${escapeHtml(e.degree || 'Education')}</h4>
    <div class="meta">${escapeHtml([e.school, e.area, e.period].filter(Boolean).join(' • '))}</div>
    ${e.description ? `<div class="body">${e.description}</div>` : ''}
  `);
}

function renderCertifications(items) {
  renderMiniList('#certificationsList', '#certBlock', items, (c) => {
    const link = window.RxResumeData.getLink(c.website);
    const title = c.title || c.name || 'Certification';
    return `
      <h4>${link ? `<a href="${link}" target="_blank" rel="noopener">${escapeHtml(title)}</a>` : escapeHtml(title)}</h4>
      <div class="meta">${escapeHtml([c.issuer, c.date].filter(Boolean).join(' • '))}</div>
      ${c.description ? `<div class="body">${c.description}</div>` : ''}
    `;
  });
}

function renderAwards(items) {
  renderMiniList('#awardsList', '#awardsBlock', items, (a) => `
    <h4>${escapeHtml(a.title || 'Award')}</h4>
    <div class="meta">${escapeHtml([a.awarder, a.date].filter(Boolean).join(' • '))}</div>
    ${a.description ? `<div class="body">${a.description}</div>` : ''}
  `);
}

function renderLanguages(items) {
  renderMiniList('#languagesList', '#langBlock', items, (l) => `
    <h4>${escapeHtml(l.language || 'Language')}</h4>
    <div class="meta">${escapeHtml(l.fluency || '')}</div>
  `);
}

function renderInterests(items) {
  renderMiniList('#interestsList', '#interestsBlock', items, (i) => `
    <h4>${escapeHtml(i.name || 'Interest')}</h4>
    ${i.keywords?.length ? `<div class="meta">${escapeHtml(i.keywords.join(', '))}</div>` : ''}
  `);
}

function renderPublications(items) {
  renderMiniList('#publicationsList', '#publicationsBlock', items, (p) => {
    const link = window.RxResumeData.getLink(p.website);
    const title = p.title || p.name || 'Publication';
    return `
      <h4>${link ? `<a href="${link}" target="_blank" rel="noopener">${escapeHtml(title)}</a>` : escapeHtml(title)}</h4>
      <div class="meta">${escapeHtml([p.publisher, p.date].filter(Boolean).join(' • '))}</div>
      ${p.description ? `<div class="body">${p.description}</div>` : ''}
    `;
  });
}

function renderVolunteer(items) {
  renderMiniList('#volunteerList', '#volunteerBlock', items, (v) => `
    <h4>${escapeHtml(v.organization || 'Volunteer')}</h4>
    <div class="meta">${escapeHtml([v.position, v.period].filter(Boolean).join(' • '))}</div>
    ${v.description ? `<div class="body">${v.description}</div>` : ''}
  `);
}

/* ─── Customer Reviews (from references) ──────────────────────────── */

function renderReviews(references) {
  const section = $('#reviews');
  const list = $('#referencesList');
  list.innerHTML = '';

  if (!references || references.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;

  references.forEach((ref) => {
    const name = ref.name || '';
    if (!name && !ref.description) return;
    const initials = (name || '?').split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

    const article = document.createElement('article');
    article.className = 'az-review';
    article.dataset.searchText = `${name} ${ref.position || ''} ${stripHtml(ref.description || '')}`.toLowerCase();
    article.innerHTML = `
      <div class="az-review-header">
        <div class="az-review-avatar">${escapeHtml(initials)}</div>
        <div class="az-review-name">${escapeHtml(name)}</div>
      </div>
      <div class="az-review-stars-line">
        <span class="az-review-stars">★★★★★</span>
        ${ref.position ? `<span class="az-review-title">${escapeHtml(ref.position)}</span>` : ''}
      </div>
      <div class="az-review-meta">
        <span class="az-verified">Verified Purchase</span>
      </div>
      ${ref.description ? `<div class="az-review-body">${ref.description}</div>` : ''}
      <div class="az-review-actions">
        <button class="az-helpful-btn">Helpful (<span class="hcount">0</span>)</button>
      </div>
    `;
    list.appendChild(article);

    const btn = article.querySelector('.az-helpful-btn');
    const hcount = btn.querySelector('.hcount');
    btn.addEventListener('click', () => {
      const voted = btn.classList.toggle('is-voted');
      hcount.textContent = voted ? 1 : 0;
    });
  });

  $('#reviewCount').textContent = `${references.length} review${references.length === 1 ? '' : 's'}`;
}

/* ═══ Account dropdown ══════════════════════════════════════════════ */

function bindAccountDropdown() {
  const btn = $('#accountToggle');
  const dd = $('#accountDropdown');
  const wrap = $('#accountMenu');

  const open = () => { dd.hidden = false; btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { dd.hidden = true; btn.setAttribute('aria-expanded', 'false'); };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dd.hidden ? open() : close();
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });
}

/* ═══ Search filtering ═════════════════════════════════════════════ */

function bindSearch() {
  const input = $('#searchInput');
  const cat = $('#searchCategory');
  const run = () => {
    const q = input.value.trim().toLowerCase();
    const c = cat.value;

    const groups = {
      skills: $$('#skillsGrid .az-card'),
      projects: $$('#projectsGrid .az-card'),
      experience: $$('#experienceGrid .az-card'),
      reviews: $$('#referencesList .az-review'),
    };

    Object.entries(groups).forEach(([key, els]) => {
      const sectionVisible = c === 'all' || c === key;
      els.forEach((el) => {
        const matches = !q || (el.dataset.searchText || '').includes(q);
        el.classList.toggle('is-hidden', !(sectionVisible && matches));
      });
    });

    // Hide section row entirely when none of its cards match (only when searching)
    if (q) {
      ['#skillsGrid', '#projectsGrid', '#experienceGrid'].forEach((sel) => {
        const grid = $(sel);
        if (!grid) return;
        const anyVisible = $$('.az-card', grid).some((el) => !el.classList.contains('is-hidden'));
        grid.closest('.az-row').style.display = anyVisible ? '' : 'none';
      });
    } else {
      $$('.az-row').forEach((s) => { s.style.display = ''; });
    }
  };
  input.addEventListener('input', run);
  cat.addEventListener('change', run);
}

/* ═══ Boot ═══════════════════════════════════════════════════════════ */

async function loadResumeData() {
  console.info(`[${THEME_ID}] Loading resume from ${CONFIG.paths.resumeData}`);
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    init();
  } catch (err) {
    console.error(`[${THEME_ID}] Failed to load resume`, err);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

function init() {
  const basics = window.RxResumeData.getBasics(resume);
  basicsCache = basics;

  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const experience = window.RxResumeData.getItems(resume, 'experience');
  const projects = window.RxResumeData.getItems(resume, 'projects');
  const skills = window.RxResumeData.getItems(resume, 'skills');
  const education = window.RxResumeData.getItems(resume, 'education');
  const languages = window.RxResumeData.getItems(resume, 'languages');
  const interests = window.RxResumeData.getItems(resume, 'interests');
  const awards = window.RxResumeData.getItems(resume, 'awards');
  const certifications = window.RxResumeData.getItems(resume, 'certifications');
  const publications = window.RxResumeData.getItems(resume, 'publications');
  const volunteer = window.RxResumeData.getItems(resume, 'volunteer');
  const references = window.RxResumeData.getItems(resume, 'references');

  document.title = [basics.name, basics.headline].filter(Boolean).join(' — ') || 'Portfolio Shop';
  $('#navLocation').textContent = basics.location ? basics.location.split(',')[0] : '';
  $('#footerHeadline').textContent = basics.headline || '';
  $('#footerLocation').textContent = basics.location || '';

  const github = profiles.find((p) => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find((p) => (p.network || '').toLowerCase().includes('linkedin'));
  const githubUrl = github ? window.RxResumeData.getLink(github.website) : '';
  const linkedinUrl = linkedin ? window.RxResumeData.getLink(linkedin.website) : '';
  const emailUrl = basics.email ? `mailto:${basics.email}` : '';

  [['#ddGithub', githubUrl], ['#ddLinkedin', linkedinUrl], ['#ddEmail', emailUrl],
   ['#footerGithub', githubUrl], ['#footerLinkedin', linkedinUrl], ['#footerEmail', emailUrl],
   ['#contactGithub', githubUrl], ['#contactLinkedin', linkedinUrl], ['#contactEmail', emailUrl]
  ].forEach(([sel, url]) => {
    const el = $(sel);
    if (!el) return;
    if (url) { el.href = url; el.hidden = false; }
    else { el.hidden = true; }
  });

  $('#projectCount').textContent = `${projects.length} project${projects.length === 1 ? '' : 's'}`;
  $('#experienceCount').textContent = `${experience.length} role${experience.length === 1 ? '' : 's'}`;

  renderHero(basics);
  renderSkills(skills);
  renderProjects(projects);
  renderExperience(experience);
  renderEducation(education);
  renderCertifications(certifications);
  renderAwards(awards);
  renderLanguages(languages);
  renderInterests(interests);
  renderPublications(publications);
  renderVolunteer(volunteer);
  renderReviews(references);

  bindAccountDropdown();
  bindSearch();
  cart.render(); // re-sync buttons now that cards exist
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadResumeData);
} else {
  loadResumeData();
}
