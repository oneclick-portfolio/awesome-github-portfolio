let resume = null;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PROJECT_ICONS = ['📦', '⚡', '🔧', '🛡️', '🚀', '🎮', '🔬', '🌐', '🤖', '💡'];

const PAGE_NAMES = ['TRAINER', 'BATTLE LOG', 'ITEM BAG', 'POKEDEX', 'MOVES', 'GUILD'];

/* ─── Page Navigation ─────────────────────────────────────────────────── */
class PageNav {
  constructor() {
    this._pages = $$('.dex-page');
    this._current = 0;
    this._titleEl = $('#pageTitle');
    this._numEl = $('#pageNum');
    this._dotsContainer = $('#pageDots');
    this._btnPrev = $('#btnPrev');
    this._btnNext = $('#btnNext');

    this._buildDots();
    this._updateDisplay();

    this._btnPrev.addEventListener('click', () => this.prev());
    this._btnNext.addEventListener('click', () => this.next());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });
  }

  _buildDots() {
    this._dotsContainer.innerHTML = '';
    this._pages.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'page-dot' + (i === 0 ? ' is-active' : '');
      dot.addEventListener('click', () => this.goTo(i));
      this._dotsContainer.appendChild(dot);
    });
    this._dots = $$('.page-dot');
  }

  next() {
    if (this._current < this._pages.length - 1) {
      this.goTo(this._current + 1, 'right');
    }
  }

  prev() {
    if (this._current > 0) {
      this.goTo(this._current - 1, 'left');
    }
  }

  goTo(index, direction) {
    if (index === this._current) return;
    if (!direction) direction = index > this._current ? 'right' : 'left';

    const oldPage = this._pages[this._current];
    const newPage = this._pages[index];

    // Old page exits in the opposite direction
    oldPage.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
    oldPage.style.transform = direction === 'right' ? 'translateX(-100%)' : 'translateX(100%)';
    oldPage.style.opacity = '0';

    setTimeout(() => {
      oldPage.classList.remove('is-active');
      oldPage.style.transition = '';
      oldPage.style.transform = '';
      oldPage.style.opacity = '';
    }, 350);

    // New page enters from the direction of navigation
    newPage.style.transition = 'none';
    newPage.style.transform = direction === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
    newPage.style.opacity = '0';
    newPage.classList.add('is-active');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newPage.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        newPage.style.transform = 'translateX(0)';
        newPage.style.opacity = '1';
        setTimeout(() => { newPage.style.transition = ''; }, 350);
      });
    });

    this._current = index;
    this._updateDisplay();
  }

  _updateDisplay() {
    this._titleEl.textContent = PAGE_NAMES[this._current] || '';
    this._numEl.textContent = `${this._current + 1}/${this._pages.length}`;
    this._dots.forEach((d, i) => d.classList.toggle('is-active', i === this._current));

    this._btnPrev.disabled = this._current === 0;
    this._btnNext.disabled = this._current === this._pages.length - 1;
    this._btnPrev.style.opacity = this._current === 0 ? '0.4' : '1';
    this._btnNext.style.opacity = this._current === this._pages.length - 1 ? '0.4' : '1';
  }

  removePage(pageId) {
    const idx = this._pages.findIndex(p => p.dataset.page === pageId);
    if (idx === -1) return;
    this._pages[idx].remove();
    this._pages.splice(idx, 1);
    PAGE_NAMES.splice(idx, 1);
    if (this._current >= this._pages.length) this._current = this._pages.length - 1;
    this._buildDots();
    this._updateDisplay();
  }
}

let pageNav;

/* ─── Data Loading ─────────────────────────────────────────────────────── */
async function loadResumeData() {
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    initializePage();
    loadProfileArt();
    pageNav = new PageNav();
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
  }

  const summarySection = resume.summary;
  const summaryEl = $('#summaryText');
  if (summaryEl) summaryEl.innerHTML = summarySection?.hidden ? '' : (summarySection?.content || '');

  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const github = profiles.find(p => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find(p => (p.network || '').toLowerCase().includes('linkedin'));

  if (github) {
    const url = window.RxResumeData.getLink(github.website);
    if (url) $('#githubLink').href = url;
  }
  if (linkedin) {
    const url = window.RxResumeData.getLink(linkedin.website);
    if (url) $('#linkedinLink').href = url;
  }

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
  if (!items.length) return;
  items.forEach(item => {
    const el = document.createElement('article');
    el.className = 'dex-entry-card';
    const companyName = item.website?.url
      ? `<a href="${item.website.url}" target="_blank" rel="noopener">${item.company}</a>`
      : (item.company || '');
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${item.position || ''}</div>
      <div class="dex-entry-card__meta pixel">${companyName} ${item.period ? '· ' + item.period : ''}</div>
      <div class="dex-entry-card__body">${item.description || ''}</div>
    `;
    list.appendChild(el);
  });
}

function buildProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  const items = window.RxResumeData.getItems(resume, 'projects');
  if (!items.length) return;
  items.forEach((p, i) => {
    const el = document.createElement('article');
    el.className = 'dex-entry-card';
    const link = window.RxResumeData.getLink(p.website);
    const icon = PROJECT_ICONS[i % PROJECT_ICONS.length];
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${icon} ${p.name || ''}</div>
      <div class="dex-entry-card__body">${p.description || ''}</div>
      ${link ? `<a href="${link}" target="_blank" rel="noopener" class="dex-link pixel" style="margin-top:0.4rem;display:inline-block">View →</a>` : ''}
    `;
    grid.appendChild(el);
  });
}

function buildEducation() {
  const list = document.getElementById('educationList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'education');
  if (!items.length) return;
  items.forEach(ed => {
    const el = document.createElement('article');
    el.className = 'dex-entry-card';
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${ed.degree || ''} — ${ed.school || ''}</div>
      <div class="dex-entry-card__meta pixel">${[ed.area, ed.grade ? 'Grade: ' + ed.grade : '', ed.period].filter(Boolean).join(' · ')}</div>
      ${ed.description ? `<div class="dex-entry-card__body">${ed.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildSkills() {
  const cloud = document.getElementById('skillsCloud');
  if (!cloud) return;
  const skills = window.RxResumeData.getItems(resume, 'skills');
  if (!skills.length) return;
  skills.forEach(s => {
    const el = document.createElement('span');
    el.className = 'move-chip';
    el.textContent = s.name;
    cloud.appendChild(el);
  });
}

function buildLanguages() {
  const list = document.getElementById('languagesList');
  if (!list) return;
  const langs = window.RxResumeData.getItems(resume, 'languages');
  const wrap = document.getElementById('languagesWrap');
  if (!langs.length) { if (wrap) wrap.hidden = true; return; }
  langs.forEach(lang => {
    const el = document.createElement('div');
    el.className = 'dex-entry-card';
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${lang.language}</div>
      ${lang.fluency ? `<div class="dex-entry-card__meta pixel">${lang.fluency}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildInterests() {
  const list = document.getElementById('interestsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'interests');
  const wrap = document.getElementById('interestsWrap');
  if (!items.length) { if (wrap) wrap.hidden = true; return; }
  items.forEach(interest => {
    const el = document.createElement('span');
    el.className = 'move-chip';
    el.textContent = interest.name || '';
    list.appendChild(el);
  });
}

function buildAwards() {
  const list = document.getElementById('awardsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'awards');
  const wrap = document.getElementById('awardsWrap');
  if (!items.length) { if (wrap) wrap.hidden = true; return; }
  items.forEach(award => {
    const el = document.createElement('article');
    el.className = 'dex-entry-card';
    const link = window.RxResumeData.getLink(award.website);
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${link ? `<a href="${link}" target="_blank" rel="noopener">${award.title || ''}</a>` : (award.title || '')}</div>
      <div class="dex-entry-card__meta pixel">${[award.awarder, award.date].filter(Boolean).join(' · ')}</div>
      ${award.description ? `<div class="dex-entry-card__body">${award.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildCertifications() {
  const list = document.getElementById('certificationsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'certifications');
  const wrap = document.getElementById('certificationsWrap');
  if (!items.length) { if (wrap) wrap.hidden = true; return; }
  items.forEach(cert => {
    const el = document.createElement('article');
    el.className = 'dex-entry-card';
    const link = window.RxResumeData.getLink(cert.website);
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${link ? `<a href="${link}" target="_blank" rel="noopener">${cert.title || ''}</a>` : (cert.title || '')}</div>
      <div class="dex-entry-card__meta pixel">${[cert.issuer, cert.date].filter(Boolean).join(' · ')}</div>
      ${cert.description ? `<div class="dex-entry-card__body">${cert.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildPublications() {
  const list = document.getElementById('publicationsList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'publications');
  const wrap = document.getElementById('publicationsWrap');
  if (!items.length) { if (wrap) wrap.hidden = true; return; }
  items.forEach(pub => {
    const el = document.createElement('article');
    el.className = 'dex-entry-card';
    const link = window.RxResumeData.getLink(pub.website);
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${link ? `<a href="${link}" target="_blank" rel="noopener">${pub.title || ''}</a>` : (pub.title || '')}</div>
      <div class="dex-entry-card__meta pixel">${[pub.publisher, pub.date].filter(Boolean).join(' · ')}</div>
      ${pub.description ? `<div class="dex-entry-card__body">${pub.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildVolunteer() {
  const list = document.getElementById('volunteerList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'volunteer');
  const wrap = document.getElementById('volunteerWrap');
  if (!items.length) { if (wrap) wrap.hidden = true; return; }
  items.forEach(vol => {
    const el = document.createElement('article');
    el.className = 'dex-entry-card';
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${vol.position || ''}</div>
      <div class="dex-entry-card__meta pixel">${[vol.organization, vol.period].filter(Boolean).join(' · ')}</div>
      ${vol.description ? `<div class="dex-entry-card__body">${vol.description}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildReferences() {
  const list = document.getElementById('referencesList');
  if (!list) return;
  const items = window.RxResumeData.getItems(resume, 'references');
  const wrap = document.getElementById('referencesWrap');
  if (!items.length) { if (wrap) wrap.hidden = true; return; }
  items.forEach(ref => {
    const el = document.createElement('div');
    el.className = 'dex-entry-card';
    el.innerHTML = `
      <div class="dex-entry-card__title pixel">${ref.name || ''}</div>
      ${ref.position ? `<div class="dex-entry-card__meta pixel">${ref.position}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

function buildCustomSections() {
  const customSections = window.RxResumeData.getCustomSections(resume);
  if (!customSections.length) return;

  const content = $('#screenContent');
  customSections.forEach(customSection => {
    const page = document.createElement('div');
    page.className = 'dex-page';
    page.dataset.page = 'custom-' + (customSection.title || '').toLowerCase().replace(/\s+/g, '-');

    let html = `<h2 class="page-section-title pixel">${(customSection.title || '').toUpperCase()}</h2><div class="dex-entries">`;
    (customSection.items || []).filter(i => !i.hidden).forEach(item => {
      const name = item.name || item.title || item.organization || item.position || '';
      const meta = item.company || item.issuer || item.publisher || item.awarder || item.school || '';
      const period = item.date || item.period || '';
      const link = window.RxResumeData.getLink(item.website);
      html += `
        <article class="dex-entry-card">
          <div class="dex-entry-card__title pixel">${link ? `<a href="${link}" target="_blank" rel="noopener">${name}</a>` : name}</div>
          <div class="dex-entry-card__meta pixel">${[meta, period].filter(Boolean).join(' · ')}</div>
          ${item.description ? `<div class="dex-entry-card__body">${item.description}</div>` : ''}
        </article>
      `;
    });
    html += '</div>';
    page.innerHTML = html;
    content.appendChild(page);
    PAGE_NAMES.push((customSection.title || 'MORE').toUpperCase());
  });
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

loadResumeData();
