let resume = null;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

async function loadResumeData() {
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    initializePage();
    loadProfileArt();
  } catch (error) {
    console.error('Error loading resume data:', error);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

function initializePage() {
  if (!resume) return;
  const basics = resume.basics || {};

  $$('[data-name]').forEach((el) => {
    const value = basics.name || '';
    el.textContent = el.classList.contains('poster-name') ? value.toUpperCase() : value;
  });
  $$('[data-headline]').forEach((el) => {
    el.textContent = (basics.headline || '').toUpperCase();
  });

  if (basics.email) {
    $('#emailLink').href = `mailto:${basics.email}`;
    $('#footerEmail').href = `mailto:${basics.email}`;
  }
  $('#footerHeadline').textContent = basics.headline || '';
  $('#footerLocation').textContent = basics.location || '';

  const summary = resume.summary;
  $('#summaryText').innerHTML = summary?.hidden ? '' : (summary?.content || '');

  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const profilesTitle = window.RxResumeData.getSection(resume, 'profiles')?.title;
  $('#profilesTitle').textContent = profilesTitle || 'Profiles';
  $('#profilesGrid').innerHTML = profiles.map((profile) => {
    const link = window.RxResumeData.getLink(profile.website);
    const title = profile.network || profile.username || 'Profile';
    return `<article class="poster-expertise-card"><div class="card-title">${title}</div><div class="card-body">${profile.username || ''}</div>${link ? `<div class="card-actions"><a href="${link}" target="_blank" rel="noopener" class="poster-project-link">Open</a></div>` : ''}</article>`;
  }).join('');

  const github = profiles.find((p) => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find((p) => (p.network || '').toLowerCase().includes('linkedin'));
  const githubUrl = github ? window.RxResumeData.getLink(github.website) : '';
  const linkedinUrl = linkedin ? window.RxResumeData.getLink(linkedin.website) : '';
  if (githubUrl) {
    $('#githubLink').href = githubUrl;
    $('#footerGithub').href = githubUrl;
  }
  if (linkedinUrl) {
    $('#linkedinLink').href = linkedinUrl;
    $('#footerLinkedin').href = linkedinUrl;
  }

  const websiteUrl = window.RxResumeData.getLink(basics.website);
  if (websiteUrl) {
    const a = document.createElement('a');
    a.href = websiteUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = basics.website.label || websiteUrl;
    $('.poster-footer-links').appendChild(a);
  }

  const experienceList = $('#experienceList');
  window.RxResumeData.getItems(resume, 'experience').forEach((item) => {
    const companyLink = window.RxResumeData.getLink(item.website);
    const company = companyLink ? `<a href="${companyLink}" target="_blank" rel="noopener">${item.company || ''}</a>` : (item.company || '');
    const card = document.createElement('article');
    card.className = 'poster-timeline-item';
    card.innerHTML = `<div class="poster-timeline-head"><div class="poster-timeline-title">${item.position || ''} · ${company}</div><div class="poster-timeline-meta">${item.period || ''}</div></div><div class="poster-timeline-body">${item.description || ''}</div>`;
    experienceList.appendChild(card);
  });

  const projectGrid = $('#projectsGrid');
  window.RxResumeData.getItems(resume, 'projects').forEach((project) => {
    const link = window.RxResumeData.getLink(project.website);
    const card = document.createElement('article');
    card.className = `poster-project-card${link ? ' has-link' : ''}`;
    card.innerHTML = `<div class="poster-project-title">${project.name || ''}</div><div class="poster-project-desc">${project.description || ''}</div>${link ? `<a href="${link}" target="_blank" rel="noopener" class="poster-project-link">Open</a>` : ''}`;
    projectGrid.appendChild(card);
  });

  const skillsCloud = $('#skillsCloud');
  window.RxResumeData.getItems(resume, 'skills').forEach((skill) => {
    const tag = document.createElement('span');
    tag.className = 'poster-skill';
    tag.textContent = skill.name || '';
    skillsCloud.appendChild(tag);
  });

  const languagesList = $('#languagesList');
  window.RxResumeData.getItems(resume, 'languages').forEach((lang) => {
    const row = document.createElement('div');
    row.className = 'poster-language';
    row.innerHTML = `<span class="poster-language-name">${lang.language || ''}</span>${lang.fluency ? `<span class="poster-language-fluency">${lang.fluency}</span>` : ''}`;
    languagesList.appendChild(row);
  });
}

async function loadProfileArt() {
  const profileArt = $('#profileArt');
  if (!profileArt || !resume) return;

  const pictureMeta = window.RxResumeData.getPictureMetadata(resume);
  
  // Check if picture is hidden
  if (pictureMeta.hidden) {
    profileArt.innerHTML = '';
    return;
  }

  try {
    const pictureUrl = window.RxResumeData.getPictureUrl(resume);

    if (pictureUrl) {
      // Create container with aspect ratio
      const container = document.createElement('div');
      container.style.width = (pictureMeta.size || 140) + 'px';
      container.style.aspectRatio = (pictureMeta.aspectRatio || 1);
      container.style.overflow = 'hidden';
      container.style.position = 'relative';
      
      // Apply border
      if (pictureMeta.borderWidth) {
        container.style.borderWidth = (pictureMeta.borderWidth * 4 / 3) + 'px';
        container.style.borderColor = pictureMeta.borderColor || 'transparent';
        container.style.borderStyle = 'solid';
      }
      
      // Apply border radius
      if (pictureMeta.borderRadius !== undefined) {
        container.style.borderRadius = (pictureMeta.borderRadius * 4 / 3) + 'px';
      }
      
      // Apply shadow
      if (pictureMeta.shadowWidth && pictureMeta.shadowWidth > 0) {
        const shadowBlur = pictureMeta.shadowWidth * 4 / 3;
        container.style.boxShadow = `0 4px ${shadowBlur}px ${pictureMeta.shadowColor || 'rgba(0,0,0,0.5)'}`;
      }
      
      // Apply rotation
      if (pictureMeta.rotation) {
        container.style.transform = `rotate(${pictureMeta.rotation}deg)`;
      }

      // Create image element
      const img = document.createElement('img');
      img.src = pictureUrl;
      img.alt = 'Profile picture';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
      img.style.display = 'block';

      profileArt.innerHTML = '';
      container.appendChild(img);
      profileArt.appendChild(container);
    } else {
      // Fallback: try loading from static HTML file
      const response = await fetch(CONFIG.paths.profileArt);
      if (!response.ok) return;
      const html = await response.text();
      profileArt.innerHTML = html;
    }
  } catch (error) {
    console.warn(CONFIG.errors.profileArtNotFound, error);
  }
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function onClick(event) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    event.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const offset = 70;
    const position = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: position, behavior: 'smooth' });
  });
});

loadProfileArt();
loadResumeData();
