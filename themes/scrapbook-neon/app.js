let resume = null;
const THEME_ID = 'scrapbook-neon';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(value) {
  const node = document.createElement('div');
  node.textContent = value ?? '';
  return node.innerHTML;
}

function setLink(id, url, fallback = '#') {
  const el = $(id);
  if (!el) return;
  if (url) {
    el.href = url;
  } else {
    el.href = fallback;
    el.setAttribute('aria-disabled', 'true');
  }
}

/* ─── Mobile Navigation ─────────────────────────────────────────────────── */
class MobileNav {
  constructor() {
    this._toggle = document.querySelector('.nav-toggle');
    this._nav = document.querySelector('.topnav');
    if (!this._toggle || !this._nav) return;

    this._toggle.addEventListener('click', () => this._handleToggle());
    this._nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') this._close();
    });
  }

  _handleToggle() {
    const isOpen = this._nav.classList.toggle('is-open');
    this._toggle.setAttribute('aria-expanded', isOpen.toString());
  }

  _close() {
    this._nav.classList.remove('is-open');
    this._toggle.setAttribute('aria-expanded', 'false');
  }
}

const mobileNav = new MobileNav();

/* ─── Dynamic Navigation Updates ────────────────────────────────────────── */
function updateNavigationLinks() {
  const nav = document.querySelector('.topnav');
  if (!nav) return;

  const isVisible = (element) => {
    if (!element) return false;
    return !element.hidden && !element.closest('[hidden]');
  };

  // Define all standard sections in order
  const sections = [
    { href: '#experience', label: 'Experience', sectionId: 'experience' },
    { href: '#projects', label: 'Projects', sectionId: 'projects' },
    { href: '#education', label: 'Education', sectionId: 'education' },
    { href: '#skills', label: 'Skills', sectionId: 'skills' },
    { href: '#languages', label: 'Languages', sectionId: 'languages' },
    { href: '#interests', label: 'Interests', sectionId: 'interests' },
    { href: '#awards', label: 'Awards', sectionId: 'awards' },
    { href: '#certifications', label: 'Certifications', sectionId: 'certifications' },
    { href: '#publications', label: 'Publications', sectionId: 'publications' },
    { href: '#volunteer', label: 'Volunteer', sectionId: 'volunteer' },
    { href: '#references', label: 'References', sectionId: 'references' },
  ];

  // Add custom sections (after standard)
  const customSectionsContainer = document.getElementById('customSectionsContainer');
  if (customSectionsContainer) {
    const customSections = customSectionsContainer.querySelectorAll('.section');
    customSections.forEach((section) => {
      const labelEl = section.querySelector('.section-label');
      if (labelEl) {
        const title = labelEl.textContent;
        sections.push({
          href: `#${section.id}`,
          label: title,
          sectionId: section.id
        });
      }
    });
  }

  // Find existing nav links (exclude email link)
  const existingLinks = nav.querySelectorAll('a.nav-btn');
  
  // Remove old section links
  existingLinks.forEach(link => {
    if (link.href && link.href.includes('#') && link.id !== 'emailLink') {
      link.remove();
    }
  });

  // Add nav links for visible sections only
  sections.forEach((section) => {
    const el = document.getElementById(section.sectionId);
    // Only add if section exists and is visible
    if (isVisible(el)) {
      const link = document.createElement('a');
      link.href = section.href;
      link.textContent = section.label;
      link.className = 'nav-btn nav-white';
      // Insert before email link
      const emailLink = nav.querySelector('#emailLink');
      if (emailLink) {
        nav.insertBefore(link, emailLink);
      } else {
        nav.appendChild(link);
      }
    }
  });

  updateNavigationLinks();
}

// Build individual letter boxes for the name row
function makeCutouts(name) {
  const target = $('#nameCutouts');
  if (!target) return;
  target.innerHTML = '';
  const letters = (name || '').toUpperCase().split('');
  letters.forEach((char, index) => {
    if (char === ' ') {
      const gap = document.createElement('div');
      gap.style.width = '1.2rem';
      target.appendChild(gap);
      return;
    }
    const box = document.createElement('div');
    box.className = 'letter-box';
    const r = (index % 2 === 0 ? -1 : 1) * ((index % 3) + 1);
    box.style.transform = `rotate(${r}deg)`;
    box.textContent = char;
    target.appendChild(box);
  });
}

// Cycle through 3 dark-neon card variants
function cardClass(index) {
  const options = ['zcard zcard-dark', 'zcard zcard-white', 'zcard zcard-grid'];
  return options[index % options.length];
}

function initializePage() {
  if (!resume) return;

  const basics = resume.basics || {};
  const summary = resume.summary || {};

  document.title = [basics.name, basics.headline].filter(Boolean).join(' — ');

  $$('[data-name]').forEach((el) => { el.textContent = basics.name || ''; });
  $$('[data-headline]').forEach((el) => { el.textContent = basics.headline || ''; });

  makeCutouts(basics.name || 'Portfolio');

  const summaryEl = $('#summaryText');
  if (summaryEl) {
    summaryEl.innerHTML = summary.hidden ? '' : (summary.content || '');
  }

  const emailHref = basics.email ? `mailto:${basics.email}` : '';
  setLink('#emailLink', emailHref);
  setLink('#contactBtn', emailHref);

  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const github = profiles.find((p) => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find((p) => (p.network || '').toLowerCase().includes('linkedin'));

  const githubUrl = github ? window.RxResumeData.getLink(github.website) : '';
  const linkedinUrl = linkedin ? window.RxResumeData.getLink(linkedin.website) : '';
  setLink('#githubLink', githubUrl);
  setLink('#linkedinLink', linkedinUrl);

  // Experience
  const experienceList = $('#experienceList');
  const expItems = window.RxResumeData.getItems(resume, 'experience');
  if (!expItems.length) { const s = document.getElementById('experience'); if (s) s.hidden = true; }
  expItems.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index);
    const site = window.RxResumeData.getLink(item.website);
    const company = site
      ? `<a href="${esc(site)}" target="_blank" rel="noopener">${esc(item.company || '')}</a>`
      : esc(item.company || '');

    article.innerHTML = `
      <h3>${esc(item.position || '')}</h3>
      <p class="zmeta">${company}${item.period ? ` · ${esc(item.period)}` : ''}</p>
      <div class="zbody">${item.description || ''}</div>
    `;
    experienceList?.appendChild(article);
  });

  // Projects
  const projectsGrid = $('#projectsGrid');
  const projItems = window.RxResumeData.getItems(resume, 'projects');
  if (!projItems.length) { const s = document.getElementById('projects'); if (s) s.hidden = true; }
  projItems.forEach((project, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index + 1);
    const projectUrl = window.RxResumeData.getLink(project.website);

    article.innerHTML = `
      <h3>${esc(project.name || '')}</h3>
      <div class="zbody">${project.description || ''}</div>
      ${projectUrl ? `<a class="zlink" href="${esc(projectUrl)}" target="_blank" rel="noopener">↗ Open Project</a>` : ''}
    `;
    projectsGrid?.appendChild(article);
  });

  // Education
  const educationList = $('#educationList');
  const eduItems = window.RxResumeData.getItems(resume, 'education');
  if (!eduItems.length) { const s = document.getElementById('education'); if (s) s.hidden = true; }
  eduItems.forEach((ed, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index + 2);
    article.innerHTML = `
      <h3>${esc(ed.degree || '')}</h3>
      <p class="zmeta">${esc(ed.school || '')}${ed.period ? ` · ${esc(ed.period)}` : ''}</p>
      ${ed.area ? `<p class="zmeta">${esc(ed.area)}${ed.grade ? ` · ${esc(ed.grade)}` : ''}</p>` : ''}
      ${ed.description ? `<div class="zbody">${ed.description}</div>` : ''}
    `;
    educationList?.appendChild(article);
  });

  // Skills
  const skillsCloud = $('#skillsCloud');
  const skillItems = window.RxResumeData.getItems(resume, 'skills');
  if (!skillItems.length) { const s = document.getElementById('skills'); if (s) s.hidden = true; }
  skillItems.forEach((skill) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = skill.name;
    skillsCloud?.appendChild(tag);
  });

  // Languages
  const languagesList = $('#languagesList');
  const langItems = window.RxResumeData.getItems(resume, 'languages');
  if (!langItems.length) { const s = document.getElementById('languages'); if (s) s.hidden = true; }
  langItems.forEach((lang) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = `${lang.language}${lang.fluency ? ` · ${lang.fluency}` : ''}`;
    languagesList?.appendChild(tag);
  });

  // Interests
  const interestsList = $('#interestsList');
  const interestItems = window.RxResumeData.getItems(resume, 'interests');
  if (!interestItems.length) { const s = document.getElementById('interests'); if (s) s.hidden = true; }
  interestItems.forEach((interest) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = interest.name || '';
    if (interest.keywords && interest.keywords.length) {
      tag.title = interest.keywords.join(', ');
    }
    interestsList?.appendChild(tag);
  });

  // Awards
  const awardsList = $('#awardsList');
  const awardItems = window.RxResumeData.getItems(resume, 'awards');
  if (!awardItems.length) { const s = document.getElementById('awards'); if (s) s.hidden = true; }
  awardItems.forEach((award, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index);
    const link = window.RxResumeData.getLink(award.website);
    article.innerHTML = `
      <h3>${link ? `<a class="zlink" href="${esc(link)}" target="_blank" rel="noopener">${esc(award.title || '')}</a>` : esc(award.title || '')}</h3>
      <p class="zmeta">${esc(award.awarder || '')}${award.date ? ` · ${esc(award.date)}` : ''}</p>
      ${award.description ? `<div class="zbody">${award.description}</div>` : ''}
    `;
    awardsList?.appendChild(article);
  });

  // Certifications
  const certificationsList = $('#certificationsList');
  const certItems = window.RxResumeData.getItems(resume, 'certifications');
  if (!certItems.length) { const s = document.getElementById('certifications'); if (s) s.hidden = true; }
  certItems.forEach((cert, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index + 1);
    const link = window.RxResumeData.getLink(cert.website);
    article.innerHTML = `
      <h3>${link ? `<a class="zlink" href="${esc(link)}" target="_blank" rel="noopener">${esc(cert.title || '')}</a>` : esc(cert.title || '')}</h3>
      <p class="zmeta">${esc(cert.issuer || '')}${cert.date ? ` · ${esc(cert.date)}` : ''}</p>
      ${cert.description ? `<div class="zbody">${cert.description}</div>` : ''}
    `;
    certificationsList?.appendChild(article);
  });

  // Publications
  const publicationsList = $('#publicationsList');
  const pubItems = window.RxResumeData.getItems(resume, 'publications');
  if (!pubItems.length) { const s = document.getElementById('publications'); if (s) s.hidden = true; }
  pubItems.forEach((pub, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index + 2);
    const link = window.RxResumeData.getLink(pub.website);
    article.innerHTML = `
      <h3>${link ? `<a class="zlink" href="${esc(link)}" target="_blank" rel="noopener">${esc(pub.title || '')}</a>` : esc(pub.title || '')}</h3>
      <p class="zmeta">${esc(pub.publisher || '')}${pub.date ? ` · ${esc(pub.date)}` : ''}</p>
      ${pub.description ? `<div class="zbody">${pub.description}</div>` : ''}
    `;
    publicationsList?.appendChild(article);
  });

  // Volunteer
  const volunteerList = $('#volunteerList');
  const volItems = window.RxResumeData.getItems(resume, 'volunteer');
  if (!volItems.length) { const s = document.getElementById('volunteer'); if (s) s.hidden = true; }
  volItems.forEach((vol, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index);
    article.innerHTML = `
      <h3>${esc(vol.organization || '')}</h3>
      <p class="zmeta">${esc(vol.position || '')}${vol.period ? ` · ${esc(vol.period)}` : ''}${vol.location ? ` · ${esc(vol.location)}` : ''}</p>
      ${vol.description ? `<div class="zbody">${vol.description}</div>` : ''}
    `;
    volunteerList?.appendChild(article);
  });

  // References
  const referencesList = $('#referencesList');
  const refItems = window.RxResumeData.getItems(resume, 'references');
  if (!refItems.length) { const s = document.getElementById('references'); if (s) s.hidden = true; }
  refItems.forEach((ref, index) => {
    const article = document.createElement('article');
    article.className = cardClass(index + 1);
    article.innerHTML = `
      <h3>${esc(ref.name || '')}</h3>
      <p class="zmeta">${esc(ref.position || '')}${ref.phone ? ` · ${esc(ref.phone)}` : ''}</p>
      ${ref.description ? `<div class="zbody">${ref.description}</div>` : ''}
    `;
    referencesList?.appendChild(article);
  });

  // Custom Sections
  const customSectionsContainer = $('#customSectionsContainer');
  const customSects = window.RxResumeData.getCustomSections(resume);
  if (!customSects.length) { if (customSectionsContainer) customSectionsContainer.hidden = true; }
  if (customSectionsContainer && customSects.length > 0) {
    customSects.forEach(customSection => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'section';
      sectionEl.id = `custom-${customSection.title?.replace(/\s+/g, '-').toLowerCase() || 'section'}`;
      const labelEl = document.createElement('h2');
      labelEl.className = 'section-label label-green';
      labelEl.textContent = customSection.title || '';
      sectionEl.appendChild(labelEl);
      const grid = document.createElement('div');
      grid.className = 'cards-grid two';
      (customSection.items || []).filter(i => !i.hidden).forEach((item, index) => {
        const article = document.createElement('article');
        article.className = cardClass(index);
        const name = item.name || item.title || item.organization || item.position || '';
        const meta = [item.company || item.issuer || item.publisher || item.awarder || item.school || '', item.date || item.period || ''].filter(Boolean).join(' · ');
        const link = window.RxResumeData.getLink(item.website);
        article.innerHTML = `
          <h3>${link ? `<a class="zlink" href="${esc(link)}" target="_blank" rel="noopener">${esc(name)}</a>` : esc(name)}</h3>
          ${meta ? `<p class="zmeta">${esc(meta)}</p>` : ''}
          ${item.description ? `<div class="zbody">${item.description}</div>` : ''}
        `;
        grid.appendChild(article);
      });
      sectionEl.appendChild(grid);
      customSectionsContainer.appendChild(sectionEl);
    });
  }

  updateNavigationLinks();
}

updateNavigationLinks();

async function loadProfileArt() {
  const profileArt = $('#profileArt');
  if (!profileArt || !resume) return;

  const pictureMeta = window.RxResumeData.getPictureMetadata(resume);
  if (pictureMeta.hidden) {
    profileArt.innerHTML = '';
    return;
  }

  try {
    const pictureUrl = window.RxResumeData.getPictureUrl(resume);
    if (pictureUrl) {
      const img = document.createElement('img');
      img.src = pictureUrl;
      img.alt = 'Profile photo';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      profileArt.innerHTML = '';
      profileArt.appendChild(img);
      return;
    }

    const response = await fetch(CONFIG.paths.profileArt);
    const html = await response.text();
    profileArt.innerHTML = html;
  } catch (error) {
    profileArt.innerHTML = CONFIG.fallbacks?.profileArt || '';
  }
}

async function loadResumeData() {
  console.info(`[${THEME_ID}] Booting theme at ${window.location.pathname}`);
  console.info(`[${THEME_ID}] Loading resume data from ${CONFIG.paths.resumeData}`);
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    console.info(`[${THEME_ID}] Resume loaded successfully.`);
    initializePage();
    loadProfileArt();
  } catch (error) {
    console.error(`[${THEME_ID}] Failed to load resume data from ${CONFIG.paths.resumeData}`, error);
    console.error(`[${THEME_ID}] Check that you are serving from repo root and opening /themes/scrapbook-neon/index.html`);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

document.addEventListener('DOMContentLoaded', loadResumeData);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadResumeData);
} else {
  loadResumeData();
}
