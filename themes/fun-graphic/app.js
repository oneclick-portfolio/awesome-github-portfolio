let resume = null;
const THEME_ID = 'fun-graphic';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

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
    console.error(`[${THEME_ID}] Check that you are serving from repo root and opening /themes/fun-graphic/index.html`);
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
    element.removeAttribute('aria-hidden');
    return;
  }

  if (element.tagName === 'A') {
    element.removeAttribute('href');
  }
  element.classList.add('is-disabled');
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

  setLink($('#emailLink'), emailUrl, 'Email');
  setLink($('#githubLink'), githubUrl, 'GitHub');
  setLink($('#linkedinLink'), linkedinUrl, 'LinkedIn');
  setLink($('#footerGithub'), githubUrl, 'GitHub');
  setLink($('#footerLinkedin'), linkedinUrl, 'LinkedIn');
  setLink($('#footerEmail'), emailUrl, 'Email');

  $('#projectCount').textContent = `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`;
  $('#experienceCount').textContent = `${experience.length} ${experience.length === 1 ? 'role' : 'roles'}`;

  renderProfiles(profiles);
  renderExperience(experience);
  renderProjects(projects);
  renderSkills(skills);
  renderEducation(education);
  renderLanguages(languages);

  toggleSection($('#experience').closest('.content-section'), experience.length > 0);
  toggleSection($('#projects').closest('.content-section'), projects.length > 0);
  toggleSection($('#craft').closest('.content-section'), skills.length > 0 || education.length > 0 || languages.length > 0);
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