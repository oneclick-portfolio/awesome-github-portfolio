let resume = null;
const THEME_ID = 'graphic';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const isVisible = (element) => {
    if (!element) return false;
    return !element.hidden && !element.closest('[hidden]');
  };

  // Define all standard sections in order
  const sections = [
    { href: '#summaryText', label: 'Summary', container: '#summarySection' },
    { href: '#p-experience', label: 'Experience', container: '#p-experience' },
    { href: '#p-projects', label: 'Projects', container: '#p-projects' },
    { href: '#profilesGrid', label: 'Profiles', container: '#profilesGrid' },
    { href: '#educationList', label: 'Education', container: '#educationList' },
    { href: '#languagesListLeft', label: 'Languages', container: '#languagesListLeft' },
    { href: '#interestsListLeft', label: 'Interests', container: '#interestsListLeft' },
    { href: '#skillsListLeft', label: 'Skills', container: '#skillsListLeft' },
    { href: '#volunteerListLeft', label: 'Volunteer', container: '#volunteerListLeft' },
    { href: '#awardsList', label: 'Awards', container: '#awardsList' },
    { href: '#certificationsList', label: 'Certifications', container: '#certificationsList' },
    { href: '#publicationsList', label: 'Publications', container: '#publicationsList' },
    { href: '#referencesList', label: 'References', container: '#referencesList' }
  ];

  // Add custom sections (after standard)
  const customSections = document.querySelectorAll('#customSectionsContainer .custom-section');
  customSections.forEach((section) => {
    const title = section.querySelector('.poster-section-title')?.textContent;
    if (title) {
      sections.push({
        href: `#${section.id}`,
        label: title,
        container: `#${section.id}`
      });
    }
  });

  // Find all existing nav links (except email)
  const existingLinks = nav.querySelectorAll('a:not([id="emailLink"])');
  const emailLink = nav.querySelector('#emailLink');
  
  // Remove old section links
  existingLinks.forEach(link => {
    if (link.href && link.href.includes('#') && !link.classList.contains('nav-cta')) {
      link.remove();
    }
  });

  // Add nav links for visible sections only
  sections.forEach((section) => {
    const container = document.querySelector(section.container);
    // Only add if container exists and is visible
    if (isVisible(container) && container && container.textContent.trim().length > 0) {
      const link = document.createElement('a');
      link.href = section.href;
      link.textContent = section.label;
      // Insert before email link
      nav.insertBefore(link, emailLink);
    }
  });
}

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

  const languagesListLeft = $('#languagesListLeft');
  window.RxResumeData.getItems(resume, 'languages').forEach((lang) => {
    const row = document.createElement('div');
    row.className = 'poster-language';
    row.innerHTML = `<span class="poster-language-name">${lang.language || ''}</span>${lang.fluency ? `<span class="poster-language-fluency">${lang.fluency}</span>` : ''}`;
    languagesListLeft.appendChild(row);
  });

  /* Education - Left Column */
  const educationList = $('#educationList');
  window.RxResumeData.getItems(resume, 'education').forEach((edu) => {
    const el = document.createElement('article');
    el.className = 'poster-education-item';
    el.innerHTML = `<div class="poster-timeline-title">${edu.degree || ''} ${edu.degree && edu.area ? '·' : ''} ${edu.area || ''}</div><div class="poster-timeline-meta">${edu.school || ''} ${edu.grade ? '• ' + edu.grade : ''}</div>${edu.period ? `<div class="poster-timeline-meta">${edu.period}</div>` : ''}${edu.description ? `<div class="poster-timeline-body">${edu.description}</div>` : ''}`;
    educationList.appendChild(el);
  });

  /* Interests - Left Column */
  const interestsListLeft = $('#interestsListLeft');
  window.RxResumeData.getItems(resume, 'interests').forEach((interest) => {
    const el = document.createElement('div');
    el.className = 'poster-interest-item';
    el.innerHTML = `<div class="poster-interest-name">${interest.name || ''}</div>${interest.keywords && interest.keywords.length > 0 ? `<div class="poster-interest-keywords">${interest.keywords.join(', ')}</div>` : ''}`;
    interestsListLeft.appendChild(el);
  });

  /* Skills - Left Column */
  const skillsListLeft = $('#skillsListLeft');
  window.RxResumeData.getItems(resume, 'skills').forEach((skill) => {
    const tag = document.createElement('span');
    tag.className = 'poster-skill';
    tag.textContent = skill.name || '';
    skillsListLeft.appendChild(tag);
  });

  /* Volunteer - Left Column */
  const volunteerListLeft = $('#volunteerListLeft');
  window.RxResumeData.getItems(resume, 'volunteer').forEach((vol) => {
    const el = document.createElement('article');
    el.className = 'poster-volunteer-item';
    el.innerHTML = `<div class="poster-timeline-title">${vol.organization || ''}</div><div class="poster-timeline-meta">${vol.location || ''} ${vol.period ? '• ' + vol.period : ''}</div>${vol.description ? `<div class="poster-timeline-body">${vol.description}</div>` : ''}`;
    volunteerListLeft.appendChild(el);
  });

  /* Awards */
  const awardsList = $('#awardsList');
  window.RxResumeData.getItems(resume, 'awards').forEach((award) => {
    const el = document.createElement('article');
    el.className = 'poster-award-item';
    const awardLink = window.RxResumeData.getLink(award.website);
    el.innerHTML = `<div class="poster-timeline-title">${awardLink ? `<a href="${awardLink}" target="_blank" rel="noopener">${award.title}</a>` : award.title}</div><div class="poster-timeline-meta">${award.awarder || ''} ${award.date ? '• ' + award.date : ''}</div>${award.description ? `<div class="poster-timeline-body">${award.description}</div>` : ''}`;
    awardsList.appendChild(el);
  });

  /* Certifications */
  const certificationsList = $('#certificationsList');
  window.RxResumeData.getItems(resume, 'certifications').forEach((cert) => {
    const el = document.createElement('article');
    el.className = 'poster-cert-item';
    const certLink = window.RxResumeData.getLink(cert.website);
    el.innerHTML = `<div class="poster-timeline-title">${certLink ? `<a href="${certLink}" target="_blank" rel="noopener">${cert.title}</a>` : cert.title}</div><div class="poster-timeline-meta">${cert.issuer || ''} ${cert.date ? '• ' + cert.date : ''}</div>${cert.description ? `<div class="poster-timeline-body">${cert.description}</div>` : ''}`;
    certificationsList.appendChild(el);
  });

  /* Publications */
  const publicationsList = $('#publicationsList');
  window.RxResumeData.getItems(resume, 'publications').forEach((pub) => {
    const el = document.createElement('article');
    el.className = 'poster-publication-item';
    const pubLink = window.RxResumeData.getLink(pub.website);
    el.innerHTML = `<div class="poster-timeline-title">${pubLink ? `<a href="${pubLink}" target="_blank" rel="noopener">${pub.title}</a>` : pub.title}</div><div class="poster-timeline-meta">${pub.publisher || ''} ${pub.date ? '• ' + pub.date : ''}</div>${pub.description ? `<div class="poster-timeline-body">${pub.description}</div>` : ''}`;
    publicationsList.appendChild(el);
  });

  /* References */
  const referencesList = $('#referencesList');
  window.RxResumeData.getItems(resume, 'references').forEach((ref) => {
    const el = document.createElement('article');
    el.className = 'poster-reference-item';
    el.innerHTML = `<div class="poster-timeline-title">${ref.name || ''}</div><div class="poster-timeline-meta">${ref.position || ''} ${ref.phone ? '• ' + ref.phone : ''}</div>${ref.description ? `<div class="poster-timeline-body">${ref.description}</div>` : ''}`;
    referencesList.appendChild(el);
  });

  /* Awards - Visibility Guard */
  const awardsSectionContainer = $('#awardsList');
  if (awardsSectionContainer) {
    const awardItems = window.RxResumeData.getItems(resume, 'awards');
    awardsSectionContainer.closest('.poster-section').hidden = awardItems.length === 0;
  }

  /* Certifications - Visibility Guard */
  const certsSectionContainer = $('#certificationsList');
  if (certsSectionContainer) {
    const certItems = window.RxResumeData.getItems(resume, 'certifications');
    certsSectionContainer.closest('.poster-section').hidden = certItems.length === 0;
  }

  /* Publications - Visibility Guard */
  const pubsSectionContainer = $('#publicationsList');
  if (pubsSectionContainer) {
    const pubItems = window.RxResumeData.getItems(resume, 'publications');
    pubsSectionContainer.closest('.poster-section').hidden = pubItems.length === 0;
  }

  /* References - Visibility Guard */
  const refsSectionContainer = $('#referencesList');
  if (refsSectionContainer) {
    const refItems = window.RxResumeData.getItems(resume, 'references');
    refsSectionContainer.closest('.poster-section').hidden = refItems.length === 0;
  }

  /* Volunteer - Visibility Guard */
  const volunteerSectionContainer = $('#volunteerListLeft');
  if (volunteerSectionContainer) {
    const volItems = window.RxResumeData.getItems(resume, 'volunteer');
    volunteerSectionContainer.closest('.poster-section').hidden = volItems.length === 0;
  }

  /* Languages - Visibility Guard */
  const langSectionContainer = $('#languagesListLeft');
  if (langSectionContainer) {
    const langItems = window.RxResumeData.getItems(resume, 'languages');
    langSectionContainer.closest('.poster-section').hidden = langItems.length === 0;
  }

  /* Interests - Visibility Guard */
  const interestsSectionContainer = $('#interestsListLeft');
  if (interestsSectionContainer) {
    const interestItems = window.RxResumeData.getItems(resume, 'interests');
    interestsSectionContainer.closest('.poster-section').hidden = interestItems.length === 0;
  }

  /* Skills - Visibility Guard */
  const skillsSectionContainer = $('#skillsListLeft');
  if (skillsSectionContainer) {
    const skillItems = window.RxResumeData.getItems(resume, 'skills');
    skillsSectionContainer.closest('.poster-section').hidden = skillItems.length === 0;
  }

  /* Education - Visibility Guard */
  const eduSectionContainer = $('#educationList');
  if (eduSectionContainer) {
    const eduItems = window.RxResumeData.getItems(resume, 'education');
    eduSectionContainer.closest('.poster-section').hidden = eduItems.length === 0;
  }

  /* Profiles - Visibility Guard */
  const profilesSectionContainer = $('#profilesGrid');
  if (profilesSectionContainer) {
    const profileItems = window.RxResumeData.getItems(resume, 'profiles');
    profilesSectionContainer.closest('.poster-section').hidden = profileItems.length === 0;
  }

  /* Experience - Visibility Guard */
  const expSectionContainer = $('#experienceList');
  if (expSectionContainer) {
    const expItems = window.RxResumeData.getItems(resume, 'experience');
    expSectionContainer.closest('.poster-section').hidden = expItems.length === 0;
  }

  /* Projects - Visibility Guard */
  const projSectionContainer = $('#projectsGrid');
  if (projSectionContainer) {
    const projItems = window.RxResumeData.getItems(resume, 'projects');
    projSectionContainer.closest('.poster-section').hidden = projItems.length === 0;
  }

  /* Summary - Visibility Guard */
  const summarySection = document.querySelector('#summaryText')?.closest('.poster-intro');
  if (summarySection) {
    const summaryContent = resume.summary?.content;
    summarySection.hidden = !summaryContent || resume.summary?.hidden;
  }

  /* Custom Sections */
  const customSectionsContainer = $('#customSectionsContainer');
  const customSections = window.RxResumeData.getCustomSections(resume);
  if (customSectionsContainer && customSections.length > 0) {
    customSections.forEach(customSection => {
      const sectionEl = document.createElement('section');
      sectionEl.id = 'custom-' + (customSection.id || customSection.title.toLowerCase().replace(/\s+/g, '-'));
      sectionEl.className = 'poster-section custom-section';
      
      const titleEl = document.createElement('h2');
      titleEl.className = 'poster-section-title';
      titleEl.textContent = customSection.title || '';
      sectionEl.appendChild(titleEl);
      
      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'custom-items custom-items-' + (customSection.type || 'default');
      
      // Render items based on custom section type
      (customSection.items || []).forEach(item => {
        if (!item.hidden) {
          const itemEl = document.createElement('div');
          itemEl.className = 'custom-item poster-custom-item';
          
          // Render based on item type
          if (customSection.type === 'experience' || customSection.type === 'volunteer') {
            itemEl.innerHTML = `<div class="poster-timeline-title">${item.position || item.organization || ''}</div><div class="poster-timeline-meta">${item.company || item.period || ''}</div>${item.description ? `<div class="poster-timeline-body">${item.description}</div>` : ''}`;
          } else if (customSection.type === 'projects') {
            const link = window.RxResumeData.getLink(item.website);
            itemEl.innerHTML = `<div class="poster-project-title">${item.name || ''}</div><div class="poster-project-desc">${item.description || ''}</div>${link ? `<a href="${link}" target="_blank" rel="noopener" class="poster-project-link">Open</a>` : ''}`;
          } else if (customSection.type === 'education') {
            itemEl.innerHTML = `<div class="poster-timeline-title">${item.degree || ''} • ${item.school || ''}</div><div class="poster-timeline-meta">${item.area || ''} ${item.grade ? '• ' + item.grade : ''}</div>`;
          } else if (customSection.type === 'skills') {
            itemEl.className += ' poster-skill';
            itemEl.textContent = item.name || '';
          } else if (customSection.type === 'awards' || customSection.type === 'certifications' || customSection.type === 'publications') {
            const link = window.RxResumeData.getLink(item.website);
            itemEl.innerHTML = `<div class="poster-timeline-title">${link ? `<a href="${link}" target="_blank" rel="noopener">${item.title}</a>` : item.title}</div><div class="poster-timeline-meta">${item.issuer || item.publisher || item.awarder || ''} ${item.date ? '• ' + item.date : ''}</div>${item.description ? `<div class="poster-timeline-body">${item.description}</div>` : ''}`;
          } else if (customSection.type === 'languages') {
            itemEl.innerHTML = `<span class="poster-language-name">${item.language || ''}</span>${item.fluency ? `<span class="poster-language-fluency">${item.fluency}</span>` : ''}`;
          } else if (customSection.type === 'interests') {
            itemEl.innerHTML = `<div class="poster-interest-name">${item.name || ''}</div>${item.keywords && item.keywords.length > 0 ? `<div class="poster-interest-keywords">${item.keywords.join(', ')}</div>` : ''}`;
          } else if (customSection.type === 'references') {
            itemEl.innerHTML = `<div class="poster-timeline-title">${item.name || ''}</div><div class="poster-timeline-meta">${item.position || ''} ${item.phone ? '• ' + item.phone : ''}</div>${item.description ? `<div class="poster-timeline-body">${item.description}</div>` : ''}`;
          } else if (customSection.type === 'profiles') {
            const link = window.RxResumeData.getLink(item.website);
            itemEl.innerHTML = `${link ? `<a href="${link}" target="_blank" rel="noopener">${item.username || item.network || ''}</a>` : (item.username || item.network || '')}`;
          } else {
            itemEl.innerHTML = item.content || item.description || item.name || '';
          }
          
          itemsDiv.appendChild(itemEl);
        }
      });
      
      sectionEl.appendChild(itemsDiv);
      customSectionsContainer.appendChild(sectionEl);
    });
  }

  updateNavigationLinks();
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
      const pictureWidth = profileArt.clientWidth || pictureMeta.width || pictureMeta.size || 140;
      const pictureHeight = profileArt.clientHeight || pictureMeta.height || (pictureWidth / (pictureMeta.aspectRatio || 1));

      const container = document.createElement('div');
      container.style.width = pictureWidth + 'px';
      container.style.height = pictureHeight + 'px';
      container.style.overflow = 'hidden';
      container.style.position = 'relative';
      
      // Apply border
      if (pictureMeta.borderWidth) {
        container.style.borderWidth = (pictureMeta.borderWidth * 4 / 3) + 'px';
        container.style.borderColor = pictureMeta.borderColor || 'transparent';
        container.style.borderStyle = 'solid';
      }
      
      // Render as standalone circular photo to avoid square placeholder corners.
      container.style.borderRadius = '50%';
      
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
