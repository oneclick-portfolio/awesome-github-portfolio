let resume = null;
const THEME_ID = 'retro-rpg';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const ICONS = (typeof window !== 'undefined' && window.RR_ICONS) || {};
const ICON = (name) => ICONS[name] || '';

function pickInterestIcon(name = '', keywords = []) {
  const hay = (name + ' ' + (keywords || []).join(' ')).toLowerCase();
  if (/(gam|play|joystick|console|nintendo|arcade)/.test(hay)) return ICON('joystick');
  if (/(read|book|literat|novel|writ)/.test(hay)) return ICON('book');
  if (/(photo|camera|picture|film)/.test(hay)) return ICON('camera');
  if (/(music|guitar|piano|song|sing|audio)/.test(hay)) return ICON('music');
  if (/(ai|ml|machine|robot|neural|llm)/.test(hay)) return ICON('robot');
  if (/(tech|computer|retro|hardware|pc|hack)/.test(hay)) return ICON('computer');
  if (/(travel|world|flag|language)/.test(hay)) return ICON('flag');
  if (/(art|paint|draw|design|pixel)/.test(hay)) return ICON('scroll');
  return '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="2" width="4" height="4" fill="#ffdd00"/><rect x="12" y="6" width="8" height="4" fill="#ffdd00"/><rect x="8" y="10" width="16" height="4" fill="#ffdd00"/><rect x="4" y="14" width="24" height="2" fill="#ffcc00"/><rect x="6" y="16" width="20" height="2" fill="#ffcc00"/><rect x="8" y="18" width="16" height="2" fill="#ffaa00"/><rect x="10" y="20" width="4" height="4" fill="#ffaa00"/><rect x="18" y="20" width="4" height="4" fill="#ffaa00"/><rect x="8" y="24" width="4" height="4" fill="#ff8800"/><rect x="20" y="24" width="4" height="4" fill="#ff8800"/></svg>';
}

/* ─── Tab Navigation ───────────────────────────────────────────────────── */
class TabNav {
  constructor() {
    this._bar = document.querySelector('.tab-bar');
    this._panels = $$('.tab-panel');
    this._buttons = $$('.tab-btn');
    if (!this._bar) return;

    this._bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      this.switchTo(btn.dataset.target);
    });
  }

  switchTo(tabId) {
    this._panels.forEach(p => p.classList.toggle('is-active', p.dataset.tab === tabId));
    this._buttons.forEach(b => b.classList.toggle('is-active', b.dataset.target === tabId));
    document.querySelector('.main-shell').scrollTop = 0;
  }

  hideTab(tabId) {
    const btn = this._buttons.find(b => b.dataset.target === tabId);
    if (btn) btn.hidden = true;
  }

  showTab(tabId) {
    const btn = this._buttons.find(b => b.dataset.target === tabId);
    if (btn) btn.hidden = false;
  }
}

const tabNav = new TabNav();

/* ─── Theme Management ──────────────────────────────────────────────────── */
class ThemeManager {
  constructor() {
    this._stored = localStorage.getItem('rr-theme');
    this._apply(this._stored || 'system');
    document.addEventListener('DOMContentLoaded', () => this._bindToggle());
  }

  _apply(theme) {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    this._current = theme;
    if (theme === 'system') {
      localStorage.removeItem('rr-theme');
    } else {
      localStorage.setItem('rr-theme', theme);
    }
    this._updateUI();
  }

  _bindToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-opt');
      if (btn) this._apply(btn.dataset.theme);
    });
    this._updateUI();
  }

  _updateUI() {
    $$('.theme-opt').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.theme === this._current);
      btn.setAttribute('aria-checked', btn.dataset.theme === this._current ? 'true' : 'false');
    });
  }
}

const themeManager = new ThemeManager();

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
    console.error(`[${THEME_ID}] Check that you are serving from repo root and opening /themes/retro-rpg/index.html`);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

function setLink(element, href, fallbackText) {
  if (!element) return;

  if (href) {
    element.href = href;
    if (fallbackText) {
      element.textContent = fallbackText;
    }
    element.hidden = false;
    element.removeAttribute('aria-hidden');
    return;
  }

  element.hidden = true;
  element.setAttribute('aria-hidden', 'true');
}

function fillText(selector, value) {
  $$(selector).forEach((element) => {
    element.textContent = value || '';
  });
}

function toggleSection(container, shouldShow) {
  if (!container) return;
  container.hidden = !shouldShow;
}

function initializePage() {
  if (!resume) return;

  const basics = window.RxResumeData.getBasics(resume);
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
  const customSections = window.RxResumeData.getCustomSections(resume);

  document.title = [basics.name, basics.headline].filter(Boolean).join(' - ') || 'Developer Redesign';

  fillText('[data-name]', basics.name || '');
  fillText('[data-headline]', basics.headline || '');

  $('#heroLocation').textContent = basics.location || 'Available worldwide';
  $('#footerHeadline').textContent = basics.headline || '';
  $('#footerLocation').textContent = basics.location || '';
  $('#signalEmail').textContent = basics.email || '';

  const websiteUrl = window.RxResumeData.getLink(basics.website);
  $('#signalWebsite').textContent = websiteUrl || 'Portfolio link unavailable';

  const summary = resume.summary;
  $('#summaryText').innerHTML = summary?.hidden ? '' : (summary?.content || '');

  const github = profiles.find((item) => (item.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find((item) => (item.network || '').toLowerCase().includes('linkedin'));
  const githubUrl = github ? window.RxResumeData.getLink(github.website) : '';
  const linkedinUrl = linkedin ? window.RxResumeData.getLink(linkedin.website) : '';
  const emailUrl = basics.email ? `mailto:${basics.email}` : '';

  setLink($('#emailLink'), emailUrl, 'Contact');
  setLink($('#githubLink'), githubUrl, 'GitHub');
  setLink($('#linkedinLink'), linkedinUrl, 'LinkedIn');
  setLink($('#footerGithub'), githubUrl, 'GitHub');
  setLink($('#footerLinkedin'), linkedinUrl, 'LinkedIn');
  setLink($('#footerEmail'), emailUrl, 'Contact');

  $('#projectCount').textContent = `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`;
  $('#experienceCount').textContent = `${experience.length} ${experience.length === 1 ? 'role' : 'roles'}`;

  renderProfiles(profiles);
  renderExperience(experience);
  renderProjects(projects);
  renderSkills(skills);
  renderEducation(education);
  renderLanguages(languages);
  renderInterests(interests);
  renderAwards(awards);
  renderCertifications(certifications);
  renderPublications(publications);
  renderVolunteer(volunteer);
  renderReferences(references);
  renderCustomSections(customSections);

  hideEmptyTabs();
}

function hideEmptyTabs() {
  const questHasContent = ($$('#experienceList article').length > 0) || ($$('#projectsGrid article').length > 0);
  const craftHasContent = ($$('#skillsCloud > div').length > 0) ||
    ($$('#educationList article').length > 0) ||
    ($$('#languagesList div').length > 0) ||
    ($$('#interestsList div').length > 0);
  const achieveHasContent = ($$('#awardsList article').length > 0) ||
    ($$('#certificationsList article').length > 0) ||
    ($$('#publicationsList article').length > 0);
  const communityHasContent = ($$('#volunteerList article').length > 0) ||
    ($$('#referencesList article').length > 0);

  if (!questHasContent) tabNav.hideTab('quest');
  if (!craftHasContent) tabNav.hideTab('craft');
  if (!achieveHasContent) tabNav.hideTab('achieve');
  if (!communityHasContent) tabNav.hideTab('community');
}

function renderProfiles(profiles) {
  const container = $('#profilesGrid');
  if (!container) return;

  container.innerHTML = '';

  profiles.forEach((profile) => {
    const item = document.createElement('a');
    const href = window.RxResumeData.getLink(profile.website);
    item.className = 'profile-chip';
    item.target = '_blank';
    item.rel = 'noopener';

    if (href) {
      item.href = href;
    } else {
      item.removeAttribute('href');
      item.classList.add('is-disabled');
    }

    item.innerHTML = `
      <span class="profile-network">${profile.network || 'Profile'}</span>
      <span class="profile-handle">${profile.username || href || ''}</span>
    `;
    container.appendChild(item);
  });

  container.hidden = profiles.length === 0;
}

function renderExperience(items) {
  const container = $('#experienceList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((item, index) => {
    const article = document.createElement('article');
    const companyUrl = window.RxResumeData.getLink(item.website);
    const companyMarkup = companyUrl
      ? `<a href="${companyUrl}" target="_blank" rel="noopener">${item.company || ''}</a>`
      : (item.company || '');

    article.className = 'timeline-item';
    article.innerHTML = `
      <div class="timeline-marker">
        <span class="item-icon">${ICON('folder')}</span>
        <span>${String(index + 1).padStart(2, '0')}</span>
      </div>
      <div class="timeline-content">
        <div class="timeline-head">
          <p class="timeline-period">${item.period || ''}</p>
          <h3>${item.position || ''}</h3>
          <p class="timeline-company">${companyMarkup}</p>
        </div>
        <div class="timeline-body">${item.description || ''}</div>
      </div>
    `;
    container.appendChild(article);
  });
}

function renderProjects(items) {
  const container = $('#projectsGrid');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((project, index) => {
    const article = document.createElement('article');
    const link = window.RxResumeData.getLink(project.website);

    article.className = 'project-card';
    article.innerHTML = `
      <div class="project-index">
        <span class="item-icon">${ICON('floppy')}</span>
        <span>${String(index + 1).padStart(2, '0')}</span>
      </div>
      <div class="project-body">
        <h3>${project.name || ''}</h3>
        <div class="project-description">${project.description || ''}</div>
      </div>
      <div class="project-footer">
        ${link ? `<a href="${link}" target="_blank" rel="noopener" class="button button-secondary project-link">View project</a>` : '<span class="project-status">Private or offline</span>'}
      </div>
    `;
    container.appendChild(article);
  });
}

function renderSkills(items) {
  const container = $('#skillsCloud');
  if (!container) return;

  container.innerHTML = '';

  const skillLevels = { master: 100, expert: 90, advanced: 80, intermediate: 60, beginner: 40 };

  items.forEach((skill) => {
    const element = document.createElement('div');
    element.className = 'skill-pill';

    const level = (skill.level || '').toLowerCase();
    const pct = skillLevels[level] || 75;
    const barSegments = Math.round(pct / 10);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = skill.name || '';

    const barContainer = document.createElement('div');
    barContainer.className = 'skill-bar';
    barContainer.style.cssText = `flex:1;min-width:60px;height:12px;background:#111;border:1px solid rgba(0,255,102,0.3);display:flex;gap:1px;padding:1px;`;

    for (let i = 0; i < 10; i++) {
      const seg = document.createElement('div');
      seg.style.cssText = `flex:1;background:${i < barSegments ? '#00ff66' : 'transparent'};box-shadow:${i < barSegments ? '0 0 2px #00ff66' : 'none'};`;
      barContainer.appendChild(seg);
    }

    const pctSpan = document.createElement('span');
    pctSpan.style.cssText = 'font-size:12px;color:#00ff66;min-width:32px;text-align:right;font-family:var(--font-terminal);';
    pctSpan.textContent = `${pct}%`;

    element.appendChild(nameSpan);
    element.appendChild(barContainer);
    element.appendChild(pctSpan);

    if (skill.keywords && skill.keywords.length > 0) {
      const kwDiv = document.createElement('div');
      kwDiv.className = 'skill-keywords';
      kwDiv.innerHTML = skill.keywords.map(k => `<span class="skill-keyword">${k}</span>`).join('');
      element.appendChild(kwDiv);
    }

    container.appendChild(element);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderEducation(items) {
  const container = $('#educationList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'education-item';
    const year = (entry.period || '').match(/\d{4}/)?.[0] || entry.period || '';
    article.innerHTML = `
      <span class="item-icon"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="2" width="4" height="4" fill="#ffcc00"/><rect x="12" y="6" width="8" height="2" fill="#ffcc00"/><rect x="10" y="8" width="12" height="2" fill="#aaccff"/><rect x="6" y="10" width="20" height="2" fill="#6699cc"/><rect x="8" y="12" width="2" height="12" fill="#88aadd"/><rect x="12" y="12" width="2" height="12" fill="#88aadd"/><rect x="18" y="12" width="2" height="12" fill="#88aadd"/><rect x="22" y="12" width="2" height="12" fill="#88aadd"/><rect x="10" y="14" width="2" height="4" fill="#335577"/><rect x="14" y="14" width="4" height="6" fill="#335577"/><rect x="20" y="14" width="2" height="4" fill="#335577"/><rect x="6" y="24" width="20" height="2" fill="#6699cc"/><rect x="4" y="26" width="24" height="2" fill="#4477aa"/></svg></span>
      <h3>${entry.degree || 'Education'}</h3>
      ${year ? `<p class="education-meta">${year}</p>` : ''}
      <p class="education-school">${entry.school || ''}</p>
      ${entry.description ? `<div class="education-description">${entry.description}</div>` : ''}
    `;
    container.appendChild(article);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderLanguages(items) {
  const container = $('#languagesList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'language-row';
    row.innerHTML = `
      <span class="item-icon item-icon-sm">${ICON('flag')}</span>
      <span>${entry.language || ''}</span>
      <strong>${entry.fluency || 'Working proficiency'}</strong>
    `;
    container.appendChild(row);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderInterests(items) {
  const container = $('#interestsList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'interest-row';
    row.innerHTML = `
      <span class="item-icon item-icon-sm">${pickInterestIcon(entry.name, entry.keywords)}</span>
      <span class="interest-name">${entry.name || ''}</span>
      ${entry.keywords && entry.keywords.length > 0 ? `<span class="interest-keywords">${entry.keywords.join(', ')}</span>` : ''}
    `;
    container.appendChild(row);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderAwards(items) {
  const container = $('#awardsList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const link = window.RxResumeData.getLink(entry.website);
    const label = entry.title || link || '';
    if (!label) return;
    const article = document.createElement('article');
    article.className = 'award-item';
    article.innerHTML = `
      <span class="item-icon">${ICON('medal')}</span>
      <h3>${link ? `<a href="${link}" target="_blank" rel="noopener">${label}</a>` : label}</h3>
      <p class="award-meta">${entry.awarder || ''} ${entry.date ? '• ' + entry.date : ''}</p>
      ${entry.description ? `<div class="award-description">${entry.description}</div>` : ''}
    `;
    container.appendChild(article);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderCertifications(items) {
  const container = $('#certificationsList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const link = window.RxResumeData.getLink(entry.website);
    const label = entry.title || link || '';
    if (!label) return;
    const article = document.createElement('article');
    article.className = 'certification-item';
    article.innerHTML = `
      <span class="item-icon">${ICON('scroll')}</span>
      <h3>${link ? `<a href="${link}" target="_blank" rel="noopener">${label}</a>` : label}</h3>
      <p class="cert-meta">${entry.issuer || ''} ${entry.date ? '• ' + entry.date : ''}</p>
      ${entry.description ? `<div class="cert-description">${entry.description}</div>` : ''}
    `;
    container.appendChild(article);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderPublications(items) {
  const container = $('#publicationsList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const link = window.RxResumeData.getLink(entry.website);
    const label = entry.title || link || '';
    if (!label) return;
    const article = document.createElement('article');
    article.className = 'publication-item';
    article.innerHTML = `
      <span class="item-icon">${ICON('newspaper')}</span>
      <h3>${link ? `<a href="${link}" target="_blank" rel="noopener">${label}</a>` : label}</h3>
      <p class="publication-meta">${entry.publisher || ''} ${entry.date ? '• ' + entry.date : ''}</p>
      ${entry.description ? `<div class="publication-description">${entry.description}</div>` : ''}
    `;
    container.appendChild(article);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderVolunteer(items) {
  const container = $('#volunteerList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'volunteer-item';
    article.innerHTML = `
      <span class="item-icon">${ICON('heart')}</span>
      <h3>${entry.organization || ''}</h3>
      <p class="volunteer-meta">${entry.location || ''} ${entry.period ? '• ' + entry.period : ''}</p>
      ${entry.description ? `<div class="volunteer-description">${entry.description}</div>` : ''}
    `;
    container.appendChild(article);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderReferences(items) {
  const container = $('#referencesList');
  if (!container) return;

  container.innerHTML = '';

  items.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'reference-item';
    article.innerHTML = `
      <span class="item-icon">${ICON('person')}</span>
      <h3>&gt; INCOMING MESSAGE FROM ${(entry.name || 'UNKNOWN').toUpperCase()}</h3>
      <p class="reference-meta">${entry.position || ''} ${entry.phone ? '| ' + entry.phone : ''}</p>
      ${entry.description ? `<div class="reference-description">${entry.description}</div>` : ''}
    `;
    container.appendChild(article);
  });

  toggleSection(container.closest('.craft-panel'), items.length > 0);
}

function renderCustomSections(customSections = window.RxResumeData.getCustomSections(resume)) {
  const container = $('#customSectionsContainer');
  if (!container) return;

  if (customSections.length === 0) {
    container.hidden = true;
    return;
  }

  container.innerHTML = '';

  customSections.forEach(customSection => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'craft-panel custom-section';
    sectionEl.id = 'custom-' + (customSection.id || customSection.title.toLowerCase().replace(/\s+/g, '-'));

    const headDiv = document.createElement('div');
    headDiv.className = 'panel-head';
    headDiv.innerHTML = `<h2>${customSection.title || ''}</h2>`;
    sectionEl.appendChild(headDiv);

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'custom-items-' + (customSection.type || 'default');

    (customSection.items || []).forEach((item, index) => {
      if (!item.hidden) {
        const itemEl = document.createElement('div');
        itemEl.dataset.itemTitle = item.title || '';
        itemEl.dataset.itemName = item.name || '';

        if (customSection.type === 'experience' || customSection.type === 'volunteer') {
          itemEl.className = 'timeline-item';
          const link = window.RxResumeData.getLink(item.website);
          const companyMarkup = link
            ? `<a href="${link}" target="_blank" rel="noopener">${item.company || ''}</a>`
            : (item.company || '');
          itemEl.innerHTML = `
            <div class="timeline-marker"><span>${String(index + 1).padStart(2, '0')}</span></div>
            <div class="timeline-content">
              <div class="timeline-head">
                <p class="timeline-period">${item.period || ''}</p>
                <h3>${item.position || item.organization || ''}</h3>
                <p class="timeline-company">${companyMarkup}</p>
              </div>
              <div class="timeline-body">${item.description || ''}</div>
            </div>
          `;
        } else if (customSection.type === 'projects') {
          itemEl.className = 'project-card';
          const link = window.RxResumeData.getLink(item.website);
          itemEl.innerHTML = `
            <div class="project-index">${String(index + 1).padStart(2, '0')}</div>
            <div class="project-body">
              <h3>${item.name || ''}</h3>
              <div class="project-description">${item.description || ''}</div>
            </div>
            <div class="project-footer">
              ${link ? `<a href="${link}" target="_blank" rel="noopener" class="button button-secondary project-link">View project</a>` : '<span class="project-status">Private or offline</span>'}
            </div>
          `;
        } else if (customSection.type === 'education') {
          itemEl.className = 'education-item';
          itemEl.innerHTML = `
            <h3>${item.degree || 'Education'}</h3>
            <p class="education-school">${item.school || ''}</p>
            <p class="education-meta">${[item.area, item.grade, item.period].filter(Boolean).join(' • ')}</p>
            <div class="education-description">${item.description || ''}</div>
          `;
        } else if (customSection.type === 'skills') {
          itemEl.className = 'skill-pill';
          itemEl.textContent = item.name || '';
        } else if (customSection.type === 'languages') {
          itemEl.className = 'language-row';
          itemEl.innerHTML = `
            <span>${item.language || ''}</span>
            <strong>${item.fluency || 'Working proficiency'}</strong>
          `;
        } else if (customSection.type === 'interests') {
          itemEl.className = 'interest-row';
          itemEl.innerHTML = `
            <span class="interest-name">${item.name || ''}</span>
            ${item.keywords && item.keywords.length > 0 ? `<span class="interest-keywords">${item.keywords.join(', ')}</span>` : ''}
          `;
        } else if (customSection.type === 'awards' || customSection.type === 'certifications' || customSection.type === 'publications') {
          itemEl.className = 'award-item';
          const link = window.RxResumeData.getLink(item.website);
          const title = item.title || item.name || link || '';
          if (!title) return;
          itemEl.innerHTML = `
            <h3>${link ? `<a href="${link}" target="_blank" rel="noopener">${title}</a>` : title}</h3>
            <p class="award-meta">${item.issuer || item.publisher || item.awarder || ''} ${item.date ? '• ' + item.date : ''}</p>
            ${item.description ? `<div class="award-description">${item.description}</div>` : ''}
          `;
        } else if (customSection.type === 'references') {
          itemEl.className = 'reference-item';
          itemEl.innerHTML = `
            <h3>${item.name || ''}</h3>
            <p class="reference-meta">${item.position || ''} ${item.phone ? '• ' + item.phone : ''}</p>
            ${item.description ? `<div class="reference-description">${item.description}</div>` : ''}
          `;
        } else if (customSection.type === 'profiles') {
          itemEl.className = 'profile-chip';
          const link = window.RxResumeData.getLink(item.website);
          itemEl.innerHTML = `
            <span class="profile-network">${item.network || 'Profile'}</span>
            <span class="profile-handle">${item.username || link || ''}</span>
          `;
          if (link) {
            itemEl.href = link;
            itemEl.target = '_blank';
            itemEl.rel = 'noopener';
          }
        } else {
          itemEl.innerHTML = item.content || item.description || item.name || '';
        }

        itemsDiv.appendChild(itemEl);
      }
    });

    sectionEl.appendChild(itemsDiv);
    container.appendChild(sectionEl);
  });

  container.hidden = false;
}

async function loadProfileArt() {
  const target = $('#profileArt');
  if (!target || !resume) return;

  const pictureMeta = window.RxResumeData.getPictureMetadata(resume);
  if (pictureMeta.hidden) {
    target.innerHTML = '';
    return;
  }

  try {
    const pictureUrl = window.RxResumeData.getPictureUrl(resume);

    if (pictureUrl) {
      const baseWidth = target.clientWidth || pictureMeta.width || pictureMeta.size || 280;
      const baseHeight = target.clientHeight || pictureMeta.height || (baseWidth / (pictureMeta.aspectRatio || 1));
      const imageScale = 0.9;
      const pictureWidth = Math.round(baseWidth * imageScale);
      const pictureHeight = Math.round(baseHeight * imageScale);

      const frame = document.createElement('div');
      frame.className = 'portrait-media';
      frame.style.width = `${pictureWidth}px`;
      frame.style.height = `${pictureHeight}px`;

      if (pictureMeta.borderWidth) {
        frame.style.border = `${(pictureMeta.borderWidth * 4) / 3}px solid ${pictureMeta.borderColor || 'transparent'}`;
      }
      if (pictureMeta.borderRadius !== undefined) {
        frame.style.borderRadius = `${(pictureMeta.borderRadius * 4) / 3}px`;
      }
      if (pictureMeta.shadowWidth && pictureMeta.shadowWidth > 0) {
        frame.style.boxShadow = `0 14px ${(pictureMeta.shadowWidth * 10) / 3}px ${pictureMeta.shadowColor || 'rgba(15, 23, 42, 0.28)'}`;
      }
      if (pictureMeta.rotation) {
        frame.style.transform = `rotate(${pictureMeta.rotation}deg)`;
      }

      const image = document.createElement('img');
      image.src = pictureUrl;
      image.alt = 'Profile picture';
      image.loading = 'lazy';
      image.style.width = '100%';
      image.style.height = '100%';
      image.style.objectFit = 'cover';
      image.style.display = 'block';

      frame.appendChild(image);
      target.innerHTML = '';
      target.appendChild(frame);
      console.info(`[${THEME_ID}] Profile image rendered.`);
      return;
    }

    const response = await fetch(CONFIG.paths.profileArt);
    if (!response.ok) {
      throw new Error(CONFIG.errors.profileArtNotFound);
    }
    target.innerHTML = await response.text();
  } catch (error) {
    console.warn(CONFIG.errors.profileArtNotFound, error);
    target.innerHTML = CONFIG.fallbacks.profileArt || '';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
  });
} else {
  loadResumeData();
}
