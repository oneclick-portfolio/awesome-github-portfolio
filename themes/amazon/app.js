let resume = null;
const THEME_ID = 'amazon';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* ─── Theme Management ──────────────────────────────────────────────────── */
class ThemeManager {
  constructor() {
    this._stored = localStorage.getItem('amazon-theme');
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
      localStorage.removeItem('amazon-theme');
    } else {
      localStorage.setItem('amazon-theme', theme);
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
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._close();
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
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const isVisible = (element) => {
    if (!element) return false;
    return !element.hidden && !element.closest('[hidden]');
  };


  // Define all standard sections in order
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
    { href: '#references-section', label: 'References', container: '#referencesSection' },
  ];

  // Add custom sections (after standard)
  const customSections = document.querySelectorAll('#customSectionsContainer .custom-section');
  customSections.forEach((section) => {
    const firstNamedItem = section.querySelector('[data-item-title],[data-item-name]');
    const itemTitle = firstNamedItem?.dataset.itemTitle;
    const itemName = firstNamedItem?.dataset.itemName;
    const sectionTitle = section.querySelector('.panel-head h2')?.textContent?.trim();
    const title = sectionTitle || itemTitle || itemName || 'Untitled';
    if (title) {
      sections.push({
        href: `#${section.id}`,
        label: title,
        container: `#${section.id}`
      });
    }
  });

  // Find all existing nav links (except theme toggle and email)
  const existingLinks = nav.querySelectorAll('a:not([id="emailLink"])');
  const themeToggle = nav.querySelector('.theme-toggle');
  
  // Remove old section links
  existingLinks.forEach(link => {
    if (link.href && link.href.includes('#') && !link.classList.contains('nav-cta')) {
      link.remove();
    }
  });

  // Add nav links for visible sections only
  sections.forEach((section) => {
    const container = document.querySelector(section.container);
    // Only add if container exists and is visible (including parent visibility)
    if (isVisible(container)) {
      const link = document.createElement('a');
      link.href = section.href;
      link.textContent = section.label;
      // Insert before theme toggle
      if (themeToggle) {
        nav.insertBefore(link, themeToggle);
      } else {
        nav.insertBefore(link, nav.lastChild);
      }
    }
  });
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
    console.error(`[${THEME_ID}] Check that you are serving from repo root and opening /themes/amazon/index.html`);
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

function fillById(id, value) {
  const element = $(`#${id}`);
  if (!element) return;
  element.textContent = value || '';
}

function toggleSection(container, shouldShow) {
  if (!container) return;
  container.hidden = !shouldShow;
}

function setAnchorVisibility(anchorSelector, shouldShow) {
  const anchor = $(anchorSelector);
  if (!anchor) return;
  anchor.hidden = !shouldShow;
}

function initializePage() {
  if (!resume) return;

  const basics = window.RxResumeData.getBasics(resume);
  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const visibleProfiles = profiles.filter((item) => !!window.RxResumeData.getLink(item.website));
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
  const visibleCustomSections = customSections.filter((section) =>
    (section.items || []).some((item) => !item.hidden)
  );

  document.title = [basics.name, basics.headline].filter(Boolean).join(' - ') || 'Portfolio Shop';

  fillText('[data-name]', basics.name || '');
  fillText('[data-headline]', basics.headline || '');

  fillById('heroLocation', basics.location || 'Available worldwide');
  fillById('footerHeadline', basics.headline || '');
  fillById('footerLocation', basics.location || '');
  fillById('signalEmail', basics.email || '');

  const websiteUrl = window.RxResumeData.getLink(basics.website);
  fillById('signalWebsite', websiteUrl || 'Portfolio link unavailable');

  const summary = resume.summary;
  const summaryEl = $('#summaryText');
  if (summaryEl) {
    summaryEl.innerHTML = summary?.hidden ? '' : (summary?.content || '');
  }
  const hasSummary = !summary?.hidden && !!summary?.content;

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

  fillById('projectCount', `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`);
  fillById('experienceCount', `${experience.length} ${experience.length === 1 ? 'role' : 'roles'}`);

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

  toggleSection($('#summaryText').closest('.hero-section'), hasSummary || visibleProfiles.length > 0 || experience.length > 0 || projects.length > 0);
  setAnchorVisibility('#summarySection', hasSummary);
  setAnchorVisibility('#profilesSection', visibleProfiles.length > 0);
  setAnchorVisibility('#experienceSection', experience.length > 0);
  setAnchorVisibility('#projectsSection', projects.length > 0);
  setAnchorVisibility('#skillsSection', skills.length > 0);
  setAnchorVisibility('#educationSection', education.length > 0);
  setAnchorVisibility('#languagesSection', languages.length > 0);
  setAnchorVisibility('#interestsSection', interests.length > 0);
  setAnchorVisibility('#awardsSection', awards.length > 0);
  setAnchorVisibility('#certificationsSection', certifications.length > 0);
  setAnchorVisibility('#publicationsSection', publications.length > 0);
  setAnchorVisibility('#volunteerSection', volunteer.length > 0);
  setAnchorVisibility('#referencesSection', references.length > 0);

  toggleSection($('#experience').closest('.content-section'), experience.length > 0);
  toggleSection($('#projects').closest('.content-section'), projects.length > 0);
  toggleSection(
    $('#craft').closest('.content-section'),
    skills.length > 0 ||
      education.length > 0 ||
      languages.length > 0 ||
      interests.length > 0 ||
      awards.length > 0 ||
      certifications.length > 0 ||
      publications.length > 0 ||
      volunteer.length > 0 ||
      references.length > 0 ||
        visibleCustomSections.length > 0
  );

  updateNavigationLinks();
}

function renderProfiles(profiles) {
  const container = $('#profilesGrid');
  if (!container) return;

  container.innerHTML = '';

  let visibleProfiles = 0;

  profiles.forEach((profile) => {
    const item = document.createElement('a');
    const href = window.RxResumeData.getLink(profile.website);
    item.className = 'profile-chip';
    item.target = '_blank';
    item.rel = 'noopener';

    if (href) {
      item.href = href;
      item.hidden = false;
      item.removeAttribute('aria-hidden');
      visibleProfiles += 1;
    } else {
      item.hidden = true;
      item.setAttribute('aria-hidden', 'true');
    }

    item.innerHTML = `
      <span class="profile-network">${profile.network || 'Profile'}</span>
      <span class="profile-handle">${profile.username || href || ''}</span>
    `;
    container.appendChild(item);
  });

  container.hidden = visibleProfiles === 0;
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
      <div class="project-index">${String(index + 1).padStart(2, '0')}</div>
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

  items.forEach((skill) => {
    const element = document.createElement('span');
    element.className = 'skill-pill';
    element.textContent = skill.name || '';
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
    article.innerHTML = `
      <h3>${entry.degree || 'Education'}</h3>
      <p class="education-school">${entry.school || ''}</p>
      <p class="education-meta">${[entry.area, entry.grade, entry.period].filter(Boolean).join(' • ')}</p>
      <div class="education-description">${entry.description || ''}</div>
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
      <h3>${entry.name || ''}</h3>
      <p class="reference-meta">${entry.position || ''} ${entry.phone ? '• ' + entry.phone : ''}</p>
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
    const visibleItems = (customSection.items || []).filter((item) => !item.hidden);
    if (visibleItems.length === 0) return;

    const sectionEl = document.createElement('section');
    sectionEl.className = 'craft-panel custom-section';
    sectionEl.id = 'custom-' + (customSection.id || customSection.title.toLowerCase().replace(/\s+/g, '-'));
    
    const headDiv = document.createElement('div');
    headDiv.className = 'panel-head';
    headDiv.innerHTML = `<h2>${customSection.title || ''}</h2>`;
    sectionEl.appendChild(headDiv);
    
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'custom-items-' + (customSection.type || 'default');
    
    // Render items based on custom section type
    visibleItems.forEach((item, index) => {
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
    });
    
    sectionEl.appendChild(itemsDiv);
    container.appendChild(sectionEl);
  });

  container.hidden = container.children.length === 0;
  updateNavigationLinks();
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

function initSmoothScroll() {
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#top') return;

      const target = $(href);
      if (!target) return;

      event.preventDefault();
      const offset = 88;
      const position = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: position, behavior: 'smooth' });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    loadResumeData();
  });
} else {
  initSmoothScroll();
  loadResumeData();
}