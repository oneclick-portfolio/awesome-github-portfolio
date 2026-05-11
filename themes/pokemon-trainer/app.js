let resume = null;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Project icons for variety
const PROJECT_ICONS = ['📦', '⚡', '🔧', '🛡️', '🚀', '🎮', '🔬', '🌐', '🤖', '💡'];
const BADGE_ICONS = ['⚙', '☸', '🛰', '🗄', '🧪', '☁'];
const BADGE_TONES = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e', 'tone-f'];


/* ─── Mobile Navigation ─────────────────────────────────────────────────── */
class MobileNav {
  constructor() {
    this._toggle = document.querySelector('.nav-toggle');
    this._nav = document.querySelector('.site-nav');
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
  const track = document.getElementById('bulletinTrack');
  const bulletinShell = document.querySelector('.bulletin-shell');
  if (!track || !bulletinShell) return;

  const isVisible = (element) => {
    if (!element) return false;
    return !element.hidden && !element.closest('[hidden]');
  };

  // Define all standard sections in order
  const sections = [
    { href: '#experience', label: 'Experience', container: '#experience' },
    { href: '#projects', label: 'Projects', container: '#projects' },
    { href: '#skills', label: 'Skills', container: '#skills' },
    { href: '#education', label: 'Education', container: '#education' },
    { href: '#languages', label: 'Languages', container: '#languages' },
    { href: '#interests', label: 'Interests', container: '#interests' },
    { href: '#awards', label: 'Awards', container: '#awards' },
    { href: '#certifications', label: 'Certifications', container: '#certifications' },
    { href: '#publications', label: 'Publications', container: '#publications' },
    { href: '#volunteer', label: 'Volunteer', container: '#volunteer' },
    { href: '#references', label: 'References', container: '#references' },
  ];

  // Add custom sections (after standard)
  const customSections = document.querySelectorAll('#customSectionsContainer .poke-section');
  customSections.forEach((section) => {
    const title = section.querySelector('.section-title')?.textContent || '';
    if (title) {
      sections.push({
        href: `#${section.id || title.toLowerCase().replace(/\s+/g, '-')}`,
        label: title,
        container: section
      });
    }
  });

  const visibleSections = [];
  sections.forEach((section) => {
    const container = typeof section.container === 'string' 
      ? document.querySelector(section.container)
      : section.container;

    if (isVisible(container)) {
      visibleSections.push(section);
    }
  });

  if (!visibleSections.length) {
    bulletinShell.hidden = true;
    bulletinShell.setAttribute('aria-hidden', 'true');
    track.innerHTML = '';
    return;
  }

  bulletinShell.hidden = false;
  bulletinShell.removeAttribute('aria-hidden');

  const createStrip = () => {
    const strip = document.createElement('div');
    strip.className = 'bulletin-strip';

    visibleSections.forEach((section) => {
      const link = document.createElement('a');
      link.href = section.href;
      link.textContent = section.label;
      link.className = 'nav-bullet';
      strip.appendChild(link);
    });

    return strip;
  };

  track.innerHTML = '';
  track.appendChild(createStrip());

  const clone = createStrip();
  clone.classList.add('is-clone');
  clone.setAttribute('aria-hidden', 'true');
  track.appendChild(clone);
}

async function loadResumeData() {
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    initializePage();
    loadProfileArt();
    setTimeout(() => initScrollAnimations(), 200);
    updateNavigationLinks();
  } catch (error) {
    console.error('Error loading resume data:', error);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

function initializePage() {
  if (!resume) return;

  const basics = resume.basics || {};
  document.title = [basics.name, basics.headline].filter(Boolean).join(' — ');

  $$('[data-name]').forEach(el => { el.textContent = basics.name || ''; });
  $$('[data-headline]').forEach(el => { el.textContent = basics.headline || ''; });

  if (basics.email) {
    $('#emailLink').href = `mailto:${basics.email}`;
    const footerEmail = $('#footerEmail');
    if (footerEmail) footerEmail.href = `mailto:${basics.email}`;
  }

  if (basics.location) {
    const footerLoc = $('#footerLocation');
    if (footerLoc) footerLoc.textContent = basics.location;
  }

  const summarySection = resume.summary;
  const summaryEl = $('#summaryText');
  if (summaryEl) summaryEl.innerHTML = summarySection?.hidden ? '' : (summarySection?.content || '');

  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const github = profiles.find(p => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find(p => (p.network || '').toLowerCase().includes('linkedin'));

  if (github) {
    const url = window.RxResumeData.getLink(github.website);
    if (url) {
      $('#githubLink').href = url;
      const fg = $('#footerGithub');
      if (fg) fg.href = url;
    }
  }
  if (linkedin) {
    const url = window.RxResumeData.getLink(linkedin.website);
    if (url) {
      $('#linkedinLink').href = url;
      const fl = $('#footerLinkedin');
      if (fl) fl.href = url;
    }
  }

  const footerHeadline = $('#footerHeadline');
  if (footerHeadline) footerHeadline.textContent = basics.headline || '';

  buildExperience();
  buildProjects();
  buildEducation();
  buildSkills();
  buildLanguages();
  buildInterests();
  buildAwards();
  buildCertifications();
  buildPublications();
  buildVolunteer();
  buildReferences();
  buildCustomSections();
}

function buildExperience() {
  const list = document.getElementById('experienceList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'experience');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(item => {
    const el = document.createElement('article');
    el.className = 'battle-item animate-on-scroll';
    const companyName = item.website?.url
      ? `<a href="${item.website.url}" target="_blank" rel="noopener">${item.company}</a>`
      : (item.company || '');
    el.innerHTML = `
      <div class="ui-card-head">
        <span class="ui-card-chip ui-card-chip--exp pixel">EXP</span>
        <span class="ui-card-meta pixel">JOURNEY LOG</span>
      </div>
      <div class="battle-item__header">
        <div class="battle-item__title">${item.position || ''}<br>${companyName}</div>
        ${item.period ? `<span class="battle-item__period">${item.period}</span>` : ''}
      </div>
      <div class="battle-item__body">${item.description || ''}</div>
    `;
    list.appendChild(el);
  });
}

function buildProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  const items = window.RxResumeData.getItems(resume, 'projects');
  const section = grid.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach((p, i) => {
    const el = document.createElement('article');
    el.className = 'item-card animate-on-scroll';
    const link = window.RxResumeData.getLink(p.website);
    const icon = PROJECT_ICONS[i % PROJECT_ICONS.length];
    el.innerHTML = `
      <div class="ui-card-head">
        <span class="ui-card-chip ui-card-chip--project pixel">PROJECT</span>
        <span class="item-card__icon" aria-hidden="true">${icon}</span>
      </div>
      <div class="item-card__name">${p.name || ''}</div>
      <div class="item-card__desc">${p.description || ''}</div>
      <div class="item-card__footer">
        ${link ? `<a href="${link}" target="_blank" rel="noopener" class="poke-btn"><span class="pixel">Details</span></a>` : ''}
      </div>
    `;
    grid.appendChild(el);
  });
}

function buildEducation() {
  const list = document.getElementById('educationList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'education');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(ed => {
    const el = document.createElement('article');
    el.className = 'dex-entry animate-on-scroll';
    el.innerHTML = `
      <div class="ui-card-head">
        <span class="ui-card-chip ui-card-chip--edu pixel">EDU</span>
        <span class="ui-card-meta pixel">TRAINING</span>
      </div>
      <div class="dex-entry__title">${ed.degree || ''} — ${ed.school || ''}</div>
      <div class="dex-entry__meta">${[ed.area, ed.grade ? 'Grade: ' + ed.grade : '', ed.period].filter(Boolean).join(' · ')}</div>
      ${ed.description ? `<div class="dex-entry__body">${ed.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildSkills() {
  const cloud = document.getElementById('skillsCloud');
  const badges = document.getElementById('badgesGrid');
  if (!cloud) return;

  const skills = window.RxResumeData.getItems(resume, 'skills');
  const section = cloud.closest('section');
  if (!skills.length) { if (section) section.hidden = true; return; }
  skills.forEach(s => {
    const el = document.createElement('span');
    el.className = 'move-chip animate-on-scroll';
    el.textContent = s.name;
    cloud.appendChild(el);
  });

  if (!badges) return;
  skills.slice(0, 6).forEach((skill, i) => {
    const badge = document.createElement('article');
    badge.className = `gym-badge animate-on-scroll ${BADGE_TONES[i % BADGE_TONES.length]}`;
    badge.innerHTML = `
      <div class="gym-badge__hex">
        <span class="gym-badge__icon" aria-hidden="true">${BADGE_ICONS[i % BADGE_ICONS.length]}</span>
      </div>
      <div class="gym-badge__name pixel">${skill.name}</div>
    `;
    badges.appendChild(badge);
  });
}

function buildLanguages() {
  const list = document.getElementById('languagesList');
  if (!list) return;
  const langs = window.RxResumeData.getItems(resume, 'languages');
  const section = list.closest('section');
  if (!langs.length) { if (section) section.hidden = true; return; }
  langs.forEach(lang => {
    const el = document.createElement('div');
    el.className = 'lang-item animate-on-scroll';
    el.innerHTML = `
      <div class="ui-card-head ui-card-head--compact">
        <span class="ui-card-chip ui-card-chip--lang pixel">LANG</span>
      </div>
      <div class="lang-item__content">
        <span class="lang-name pixel">${lang.language}</span>
        ${lang.fluency ? `<span class="lang-fluency">${lang.fluency}</span>` : ''}
      </div>
    `;
    list.appendChild(el);
  });
}

function buildInterests() {
  const list = document.getElementById('interestsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'interests');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(interest => {
    const el = document.createElement('span');
    el.className = 'move-chip animate-on-scroll';
    el.textContent = interest.name || '';
    list.appendChild(el);
  });
}

function buildAwards() {
  const list = document.getElementById('awardsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'awards');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(award => {
    const el = document.createElement('article');
    el.className = 'battle-item animate-on-scroll';
    const link = window.RxResumeData.getLink(award.website);
    el.innerHTML = `
      <div class="ui-card-head">
        <span class="ui-card-chip ui-card-chip--exp pixel">AWARD</span>
        <span class="ui-card-meta pixel">${award.date || ''}</span>
      </div>
      <div class="battle-item__header">
        <div class="battle-item__title">${link ? `<a href="${link}" target="_blank" rel="noopener">${award.title || ''}</a>` : (award.title || '')}</div>
        ${award.awarder ? `<span class="battle-item__period">${award.awarder}</span>` : ''}
      </div>
      ${award.description ? `<div class="battle-item__body">${award.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildCertifications() {
  const list = document.getElementById('certificationsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'certifications');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(cert => {
    const el = document.createElement('article');
    el.className = 'battle-item animate-on-scroll';
    const link = window.RxResumeData.getLink(cert.website);
    el.innerHTML = `
      <div class="ui-card-head">
        <span class="ui-card-chip ui-card-chip--project pixel">CERT</span>
        <span class="ui-card-meta pixel">${cert.date || ''}</span>
      </div>
      <div class="battle-item__header">
        <div class="battle-item__title">${link ? `<a href="${link}" target="_blank" rel="noopener">${cert.title || ''}</a>` : (cert.title || '')}</div>
        ${cert.issuer ? `<span class="battle-item__period">${cert.issuer}</span>` : ''}
      </div>
      ${cert.description ? `<div class="battle-item__body">${cert.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildPublications() {
  const list = document.getElementById('publicationsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'publications');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(pub => {
    const el = document.createElement('article');
    el.className = 'battle-item animate-on-scroll';
    const link = window.RxResumeData.getLink(pub.website);
    el.innerHTML = `
      <div class="ui-card-head">
        <span class="ui-card-chip ui-card-chip--edu pixel">PUB</span>
        <span class="ui-card-meta pixel">${pub.date || ''}</span>
      </div>
      <div class="battle-item__header">
        <div class="battle-item__title">${link ? `<a href="${link}" target="_blank" rel="noopener">${pub.title || ''}</a>` : (pub.title || '')}</div>
        ${pub.publisher ? `<span class="battle-item__period">${pub.publisher}</span>` : ''}
      </div>
      ${pub.description ? `<div class="battle-item__body">${pub.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildVolunteer() {
  const list = document.getElementById('volunteerList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'volunteer');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(vol => {
    const el = document.createElement('article');
    el.className = 'battle-item animate-on-scroll';
    el.innerHTML = `
      <div class="ui-card-head">
        <span class="ui-card-chip ui-card-chip--lang pixel">VOL</span>
        <span class="ui-card-meta pixel">${vol.period || ''}</span>
      </div>
      <div class="battle-item__header">
        <div class="battle-item__title">${vol.position || ''}<br>${vol.organization || ''}</div>
        ${vol.location ? `<span class="battle-item__period">${vol.location}</span>` : ''}
      </div>
      ${vol.description ? `<div class="battle-item__body">${vol.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildReferences() {
  const list = document.getElementById('referencesList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'references');
  const section = list.closest('section');
  if (!items.length) { if (section) section.hidden = true; return; }
  items.forEach(ref => {
    const el = document.createElement('div');
    el.className = 'lang-item animate-on-scroll';
    el.innerHTML = `
      <div class="ui-card-head ui-card-head--compact">
        <span class="ui-card-chip ui-card-chip--exp pixel">REF</span>
      </div>
      <div class="lang-item__content">
        <span class="lang-name pixel">${ref.name || ''}</span>
        ${ref.position ? `<span class="lang-fluency">${ref.position}</span>` : ''}
      </div>
    `;
    list.appendChild(el);
  });
}

function buildCustomSections() {
  const container = document.getElementById('customSectionsContainer');
  if (!container) return;
  const customSections = window.RxResumeData.getCustomSections(resume);
  if (!customSections.length) return;
  customSections.forEach((customSection, idx) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'poke-section';
    // Generate ID from title for navigation
    const sectionId = `custom-${customSection.title?.toLowerCase().replace(/\s+/g, '-') || idx}`;
    sectionEl.id = sectionId;
    
    const inner = document.createElement('div');
    inner.className = 'container';
    const title = document.createElement('h2');
    title.className = 'section-title pixel';
    title.textContent = (customSection.title || '').toUpperCase();
    inner.appendChild(title);
    const listEl = document.createElement('div');
    listEl.className = 'battle-list';
    (customSection.items || []).filter(i => !i.hidden).forEach(item => {
      const el = document.createElement('article');
      el.className = 'battle-item animate-on-scroll';
      const name = item.name || item.title || item.organization || item.position || '';
      const meta = item.company || item.issuer || item.publisher || item.awarder || item.school || '';
      const period = item.date || item.period || '';
      const link = window.RxResumeData.getLink(item.website);
      el.innerHTML = `
        <div class="ui-card-head">
          <span class="ui-card-chip pixel">ITEM</span>
          ${period ? `<span class="ui-card-meta pixel">${period}</span>` : ''}
        </div>
        <div class="battle-item__header">
          <div class="battle-item__title">${link ? `<a href="${link}" target="_blank" rel="noopener">${name}</a>` : name}</div>
          ${meta ? `<span class="battle-item__period">${meta}</span>` : ''}
        </div>
        ${item.description ? `<div class="battle-item__body">${item.description}</div>` : ''}
      `;
      listEl.appendChild(el);
    });
    inner.appendChild(listEl);
    sectionEl.appendChild(inner);
    container.appendChild(sectionEl);
  });
  // Update navigation after custom sections are rendered
  updateNavigationLinks();
}

async function loadProfileArt() {
  const frame = document.getElementById('profileArt');
  if (!frame || !resume) return;

  const pictureMeta = window.RxResumeData.getPictureMetadata(resume);
  if (pictureMeta.hidden) { frame.innerHTML = ''; return; }

  try {
    const pictureUrl = window.RxResumeData.getPictureUrl(resume);
    if (pictureUrl) {
      const img = document.createElement('img');
      img.src = pictureUrl;
      img.alt = 'Trainer portrait';
      img.className = 'profile-natural';

      frame.innerHTML = '';
      frame.appendChild(img);
    } else {
      const resp = await fetch(CONFIG.paths.profileArt);
      const html = await resp.text();
      frame.innerHTML = html;
    }
  } catch {
    console.log(CONFIG.errors.profileArtNotFound);
    frame.innerHTML = CONFIG.fallbacks?.profileArt || '<div class="portrait-placeholder pixel">??</div>';
  }
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.animate-on-scroll').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.05}s`;
    observer.observe(el);
  });
}

loadResumeData();
