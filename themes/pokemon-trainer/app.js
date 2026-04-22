let resume = null;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Project icons for variety
const PROJECT_ICONS = ['📦', '⚡', '🔧', '🛡️', '🚀', '🎮', '🔬', '🌐', '🤖', '💡'];
const BADGE_ICONS = ['⚙', '☸', '🛰', '🗄', '🧪', '☁'];
const BADGE_TONES = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e', 'tone-f'];

async function loadResumeData() {
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    initializePage();
    loadProfileArt();
    setTimeout(() => initScrollAnimations(), 200);
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
}

function buildExperience() {
  const list = document.getElementById('experienceList');
  if (!list) return;
  window.RxResumeData.getItems(resume, 'experience').forEach(item => {
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
  window.RxResumeData.getItems(resume, 'projects').forEach((p, i) => {
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
  window.RxResumeData.getItems(resume, 'education').forEach(ed => {
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
  if (!langs.length) return;
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
