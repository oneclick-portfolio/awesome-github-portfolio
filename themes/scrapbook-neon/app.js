let resume = null;
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

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const emailHref = basics.email ? `mailto:${basics.email}` : '';
  setLink('#emailLink', emailHref);
  setLink('#footerEmail', emailHref);
  setLink('#contactBtn', emailHref);

  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const github = profiles.find((p) => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find((p) => (p.network || '').toLowerCase().includes('linkedin'));

  const githubUrl = github ? window.RxResumeData.getLink(github.website) : '';
  const linkedinUrl = linkedin ? window.RxResumeData.getLink(linkedin.website) : '';
  setLink('#githubLink', githubUrl);
  setLink('#linkedinLink', linkedinUrl);
  setLink('#footerGithub', githubUrl);
  setLink('#footerLinkedin', linkedinUrl);

  // Experience
  const experienceList = $('#experienceList');
  window.RxResumeData.getItems(resume, 'experience').forEach((item, index) => {
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
  window.RxResumeData.getItems(resume, 'projects').forEach((project, index) => {
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
  window.RxResumeData.getItems(resume, 'education').forEach((ed, index) => {
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
  window.RxResumeData.getItems(resume, 'skills').forEach((skill) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = skill.name;
    skillsCloud?.appendChild(tag);
  });

  // Languages
  const languagesList = $('#languagesList');
  window.RxResumeData.getItems(resume, 'languages').forEach((lang) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = `${lang.language}${lang.fluency ? ` · ${lang.fluency}` : ''}`;
    languagesList?.appendChild(tag);
  });
}

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
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    initializePage();
    loadProfileArt();
  } catch (error) {
    console.error('Error loading resume data:', error);
    document.body.innerHTML = CONFIG.errors?.resumeLoadError || '<p>Failed to load resume data.</p>';
  }
}

loadResumeData();
