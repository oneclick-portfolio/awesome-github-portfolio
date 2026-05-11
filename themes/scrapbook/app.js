let resume = null;
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
    { href: '#experience', label: 'Work', container: '#experience' },
    { href: '#projects', label: 'Projects', container: '#projects' },
    { href: '#education', label: 'Education', container: '#education' },
    { href: '#skills', label: 'Skills', container: '#skills' },
    { href: '#languages', label: 'Languages', container: '#languages' },
    { href: '#interests', label: 'Interests', container: '#interests' },
    { href: '#awards', label: 'Awards', container: '#awards' },
    { href: '#certifications', label: 'Certifications', container: '#certifications' },
    { href: '#publications', label: 'Publications', container: '#publications' },
    { href: '#volunteer', label: 'Volunteer', container: '#volunteer' },
    { href: '#references', label: 'References', container: '#references' },
  ];

  // Add custom sections
  const customSections = document.querySelectorAll('#customSectionsContainer section');
  customSections.forEach((section) => {
    const titleEl = section.querySelector('.cut-out h3');
    const title = titleEl?.textContent;
    if (title && section.id) {
      sections.push({
        href: `#${section.id}`,
        label: title,
        container: `#${section.id}`
      });
    }
  });

  // Find and remove all existing nav links
  const existingLinks = nav.querySelectorAll('a');
  existingLinks.forEach(link => {
    if (link.href && link.href.includes('#')) {
      link.remove();
    }
  });

  // Add nav links for visible sections only
  sections.forEach((section) => {
    const container = document.querySelector(section.container);
    // Only add if container exists and is visible
    if (container && isVisible(container)) {
      const link = document.createElement('a');
      link.href = section.href;
      link.textContent = section.label;
      nav.appendChild(link);
    }
  });
}

async function loadResumeData() {
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    initializePage();
    loadProfilePicture();
    document.getElementById('year').textContent = new Date().getFullYear();
  } catch (error) {
    console.error('Error loading resume data:', error);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

/* Initialize page with resume data */
function initializePage() {
  if (!resume) return;

  const basics = resume.basics || {};
  document.title = [basics.name, basics.headline].filter(Boolean).join(' - ');

  $$('[data-name]').forEach((node) => {
    node.textContent = basics.name || '';
  });
  $$('[data-headline]').forEach((node) => {
    node.textContent = basics.headline || '';
  });

  if (basics.email) {
    $('#emailLink').href = `mailto:${basics.email}`;
  }

  const summarySection = resume.summary;
  const summaryBox = $('#summaryBox');
  if (summarySection?.content && !summarySection?.hidden) {
    summaryBox.classList.remove('hidden');
    summaryBox.innerHTML = summarySection.content;
  }

  const profiles = window.RxResumeData.getItems(resume, 'profiles');

  const github = profiles.find((p) => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find((p) => (p.network || '').toLowerCase().includes('linkedin'));
  
  if (github) {
    const githubUrl = window.RxResumeData.getLink(github.website);
    if (githubUrl) {
      $('#githubLink').href = githubUrl;
    }
  }
  if (linkedin) {
    const linkedinUrl = window.RxResumeData.getLink(linkedin.website);
    if (linkedinUrl) {
      $('#linkedinLink').href = linkedinUrl;
    }
  }

  /* Experience */
  const expGrid = document.getElementById('experienceGrid');
  const expItems = window.RxResumeData.getItems(resume, 'experience');
  if (!expItems.length) { const s = document.getElementById('experience'); if (s) s.hidden = true; }
  expItems.forEach((item, index) => {
    const el = document.createElement('article');
    const colors = ['bg-paper-white border-crayon-blue', 'bg-crayon-yellow', 'bg-paper-white border-crayon-green'];
    const rotations = ['-rotate-1', 'rotate-2', '-rotate-2'];
    const borderColors = ['border-crayon-blue', 'border-marker-black', 'border-crayon-green'];
    
    const colorClass = colors[index % colors.length];
    const rotationClass = rotations[index % rotations.length];
    const borderClass = borderColors[index % borderColors.length];
    const isLight = colorClass.includes('paper-white') || colorClass.includes('crayon-yellow');
    
    const companyName = item.website?.url 
      ? `<a href="${item.website.url}" target="_blank" rel="noopener" class="underline font-bold hover:opacity-80">${item.company}</a>`
      : item.company;

    el.className = `cut-out ${colorClass} p-6 md:p-8 ${rotationClass} shadow-xl border-4 ${borderClass}`;
    el.innerHTML = `
      <div class="flex justify-between font-marker mb-4 ${isLight ? 'text-crayon-blue' : 'text-marker-black'}">
        <span class="font-bold text-lg">${item.position}</span>
        <span class="text-sm">${item.period || ''}</span>
      </div>
      <div class="font-chunky text-xl md:text-2xl mb-3 ${isLight ? 'text-marker-black' : 'text-white'}">${companyName}</div>
      <div class="text-base md:text-lg leading-relaxed ${isLight ? 'text-marker-black' : 'text-white'}">${item.description || ''}</div>
    `;
    expGrid.appendChild(el);
  });

  /* Projects */
  const projectsGrid = document.getElementById('projectsGrid');
  const projItems = window.RxResumeData.getItems(resume, 'projects');
  if (!projItems.length) { const s = document.getElementById('projects'); if (s) s.hidden = true; }
  projItems.forEach((p, index) => {
    const el = document.createElement('article');
    const colors = ['bg-paper-white', 'bg-crayon-yellow', 'bg-paper-white'];
    const rotations = ['rotate-1', '-rotate-2', 'rotate-2'];
    const borderClasses = ['border-crayon-blue', 'border-marker-black', 'border-crayon-green'];
    
    const colorClass = colors[index % colors.length];
    const rotationClass = rotations[index % rotations.length];
    const borderClass = borderClasses[index % borderClasses.length];
    const projectLink = window.RxResumeData.getLink(p.website);
    const isLight = true; // Projects are all on light backgrounds
    
    let tagsHtml = '';
    if (p.keywords && Array.isArray(p.keywords)) {
      tagsHtml = p.keywords
        .slice(0, 3)
        .map(k => `<span class="bg-white px-2 py-1 font-bold text-xs md:text-sm rounded-full">${k}</span>`)
        .join('');
    }

    el.className = `cut-out ${colorClass} p-6 md:p-8 border-4 ${borderClass} ${rotationClass} shadow-xl`;
    el.innerHTML = `
      <div class="flex justify-between font-marker mb-3 text-crayon-blue">
        <span class="font-bold">#${index + 1}</span>
      </div>
      <h4 class="font-chunky text-2xl md:text-3xl mb-3 text-marker-black">${p.name}</h4>
      <p class="text-base md:text-lg mb-4 leading-relaxed text-marker-black">${p.description || ''}</p>
      <div class="flex gap-2 flex-wrap">
        ${tagsHtml}
      </div>
      ${projectLink ? `<div class="mt-4"><a href="${projectLink}" target="_blank" rel="noopener" class="cut-out bg-crayon-blue text-white px-4 py-2 font-marker text-sm hover:opacity-80">VISIT</a></div>` : ''}
    `;
    projectsGrid.appendChild(el);
  });

  /* Education */
  const eduGrid = document.getElementById('educationGrid');
  const eduItems = window.RxResumeData.getItems(resume, 'education');
  if (!eduItems.length) { const s = document.getElementById('education'); if (s) s.hidden = true; }
  eduItems.forEach((ed, index) => {
    const el = document.createElement('article');
    const colors = ['bg-paper-white border-crayon-green', 'bg-paper-white border-construction-orange'];
    const rotations = ['rotate-1', '-rotate-1'];
    
    const colorClass = colors[index % colors.length];
    const rotationClass = rotations[index % rotations.length];
    
    el.className = `cut-out ${colorClass} p-6 md:p-8 ${rotationClass} shadow-lg border-4`;
    el.innerHTML = `
      <div class="font-chunky text-2xl md:text-3xl text-marker-black mb-2">${ed.degree || ''}</div>
      <div class="font-marker text-lg md:text-xl text-crayon-blue mb-3">${ed.school || ''}</div>
      <div class="text-sm md:text-base text-marker-black mb-3">
        ${ed.area ? `<span>${ed.area}</span>` : ''} 
        ${ed.grade ? `<span class="font-bold"> • ${ed.grade}</span>` : ''} 
        ${ed.period ? `<span> • ${ed.period}</span>` : ''}
      </div>
      ${ed.description ? `<p class="text-base leading-relaxed text-marker-black">${ed.description}</p>` : ''}
    `;
    eduGrid.appendChild(el);
  });

  /* Skills */
  const skillsGrid = document.getElementById('skillsGrid');
  const skills = window.RxResumeData.getItems(resume, 'skills');
  if (!skills.length) { const s = document.getElementById('skills'); if (s) s.hidden = true; }
  const skillsPerColumn = Math.ceil(skills.length / 2);
  
  let skillColumn1 = '';
  let skillColumn2 = '';
  
  skills.forEach((s, index) => {
    const skillTag = `<span class="cut-out bg-crayon-yellow px-4 py-2 font-marker text-marker-black border-2 border-marker-black text-sm md:text-base inline-block">${s.name}</span>`;
    
    if (index < skillsPerColumn) {
      skillColumn1 += skillTag + ' ';
    } else {
      skillColumn2 += skillTag + ' ';
    }
  });

  if (skillColumn1) {
    const col1 = document.createElement('div');
    col1.className = 'cut-out bg-paper-white p-6 md:p-8 border-4 border-crayon-blue rotate-1 shadow-lg space-y-3';
    col1.innerHTML = skillColumn1;
    skillsGrid.appendChild(col1);
  }

  if (skillColumn2) {
    const col2 = document.createElement('div');
    col2.className = 'cut-out bg-paper-white p-6 md:p-8 border-4 border-crayon-green -rotate-1 shadow-lg space-y-3';
    col2.innerHTML = skillColumn2;
    skillsGrid.appendChild(col2);
  }

  /* Languages */
  const languagesGrid = document.getElementById('languagesGrid');
  const languages = window.RxResumeData.getItems(resume, 'languages');
  if (!languages.length) { const s = document.getElementById('languages'); if (s) s.hidden = true; }
  
  languages.forEach((lang, index) => {
    const el = document.createElement('div');
    const colors = ['bg-crayon-blue text-white', 'bg-construction-orange text-white', 'bg-crayon-green text-white', 'bg-crayon-yellow text-marker-black'];
    const colorClass = colors[index % colors.length];
    const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1'];
    const rotationClass = rotations[index % rotations.length];
    
    el.className = `cut-out ${colorClass} px-6 md:px-8 py-3 md:py-4 font-marker border-2 border-white ${rotationClass} shadow-md text-sm md:text-base`;
    el.textContent = `${lang.language} ${lang.fluency ? '- ' + lang.fluency : ''}`;
    languagesGrid.appendChild(el);
  });

  /* Interests */
  const interestsGrid = document.getElementById('interestsGrid');
  const interestItems = window.RxResumeData.getItems(resume, 'interests');
  if (!interestItems.length) { const s = document.getElementById('interests'); if (s) s.hidden = true; }
  interestItems.forEach(interest => {
    if (!interestsGrid) return;
    const el = document.createElement('div');
    el.className = 'cut-out bg-crayon-yellow px-4 py-2 font-marker text-marker-black border-2 border-marker-black text-sm md:text-base inline-block';
    el.textContent = interest.name || '';
    interestsGrid.appendChild(el);
  });

  /* Awards */
  const awardsList = document.getElementById('awardsList');
  const awardItems = window.RxResumeData.getItems(resume, 'awards');
  if (!awardItems.length) { const s = document.getElementById('awards'); if (s) s.hidden = true; }
  awardItems.forEach((award, index) => {
    if (!awardsList) return;
    const link = window.RxResumeData.getLink(award.website);
    const borderColors = ['border-crayon-blue', 'border-crayon-green', 'border-construction-orange'];
    const rotations = ['-rotate-1', 'rotate-1', '-rotate-2'];
    const el = document.createElement('article');
    el.className = `cut-out bg-paper-white p-6 md:p-8 ${rotations[index % rotations.length]} shadow-xl border-4 ${borderColors[index % borderColors.length]}`;
    el.innerHTML = `
      <div class="font-chunky text-xl md:text-2xl text-marker-black mb-2">${link ? `<a href="${link}" target="_blank" rel="noopener" class="underline hover:opacity-80">${award.title || ''}</a>` : (award.title || '')}</div>
      <div class="font-marker text-sm text-crayon-blue mb-2">${award.awarder || ''}${award.date ? ' · ' + award.date : ''}</div>
      ${award.description ? `<p class="text-sm text-marker-black">${award.description}</p>` : ''}
    `;
    awardsList.appendChild(el);
  });

  /* Certifications */
  const certificationsList = document.getElementById('certificationsList');
  const certItems = window.RxResumeData.getItems(resume, 'certifications');
  if (!certItems.length) { const s = document.getElementById('certifications'); if (s) s.hidden = true; }
  certItems.forEach((cert, index) => {
    if (!certificationsList) return;
    const link = window.RxResumeData.getLink(cert.website);
    const borderColors = ['border-crayon-green', 'border-crayon-blue', 'border-crayon-red'];
    const rotations = ['rotate-1', '-rotate-1', 'rotate-2'];
    const el = document.createElement('article');
    el.className = `cut-out bg-paper-white p-6 md:p-8 ${rotations[index % rotations.length]} shadow-xl border-4 ${borderColors[index % borderColors.length]}`;
    el.innerHTML = `
      <div class="font-chunky text-xl md:text-2xl text-marker-black mb-2">${link ? `<a href="${link}" target="_blank" rel="noopener" class="underline hover:opacity-80">${cert.title || ''}</a>` : (cert.title || '')}</div>
      <div class="font-marker text-sm text-crayon-green mb-2">${cert.issuer || ''}${cert.date ? ' · ' + cert.date : ''}</div>
      ${cert.description ? `<p class="text-sm text-marker-black">${cert.description}</p>` : ''}
    `;
    certificationsList.appendChild(el);
  });

  /* Publications */
  const publicationsList = document.getElementById('publicationsList');
  const pubItems = window.RxResumeData.getItems(resume, 'publications');
  if (!pubItems.length) { const s = document.getElementById('publications'); if (s) s.hidden = true; }
  pubItems.forEach((pub, index) => {
    if (!publicationsList) return;
    const link = window.RxResumeData.getLink(pub.website);
    const borderColors = ['border-crayon-blue', 'border-construction-orange', 'border-crayon-green'];
    const rotations = ['-rotate-2', 'rotate-1', '-rotate-1'];
    const el = document.createElement('article');
    el.className = `cut-out bg-paper-white p-6 md:p-8 ${rotations[index % rotations.length]} shadow-xl border-4 ${borderColors[index % borderColors.length]}`;
    el.innerHTML = `
      <div class="font-chunky text-xl md:text-2xl text-marker-black mb-2">${link ? `<a href="${link}" target="_blank" rel="noopener" class="underline hover:opacity-80">${pub.title || ''}</a>` : (pub.title || '')}</div>
      <div class="font-marker text-sm text-crayon-blue mb-2">${pub.publisher || ''}${pub.date ? ' · ' + pub.date : ''}</div>
      ${pub.description ? `<p class="text-sm text-marker-black">${pub.description}</p>` : ''}
    `;
    publicationsList.appendChild(el);
  });

  /* Volunteer */
  const volunteerList = document.getElementById('volunteerList');
  const volItems = window.RxResumeData.getItems(resume, 'volunteer');
  if (!volItems.length) { const s = document.getElementById('volunteer'); if (s) s.hidden = true; }
  volItems.forEach((vol, index) => {
    if (!volunteerList) return;
    const borderColors = ['border-crayon-red', 'border-crayon-blue', 'border-construction-orange'];
    const rotations = ['rotate-2', '-rotate-1', 'rotate-1'];
    const el = document.createElement('article');
    el.className = `cut-out bg-paper-white p-6 md:p-8 ${rotations[index % rotations.length]} shadow-xl border-4 ${borderColors[index % borderColors.length]}`;
    el.innerHTML = `
      <div class="font-chunky text-xl md:text-2xl text-marker-black mb-2">${vol.organization || ''}</div>
      <div class="font-marker text-sm text-crayon-red mb-2">${vol.position || ''}${vol.period ? ' · ' + vol.period : ''}${vol.location ? ' · ' + vol.location : ''}</div>
      ${vol.description ? `<p class="text-sm text-marker-black">${vol.description}</p>` : ''}
    `;
    volunteerList.appendChild(el);
  });

  /* References */
  const referencesList = document.getElementById('referencesList');
  const refItems = window.RxResumeData.getItems(resume, 'references');
  if (!refItems.length) { const s = document.getElementById('references'); if (s) s.hidden = true; }
  refItems.forEach((ref, index) => {
    if (!referencesList) return;
    const borderColors = ['border-marker-black', 'border-crayon-blue', 'border-crayon-green'];
    const rotations = ['-rotate-1', 'rotate-2', '-rotate-2'];
    const el = document.createElement('article');
    el.className = `cut-out bg-paper-white p-6 md:p-8 ${rotations[index % rotations.length]} shadow-xl border-4 ${borderColors[index % borderColors.length]}`;
    el.innerHTML = `
      <div class="font-chunky text-xl md:text-2xl text-marker-black mb-2">${ref.name || ''}</div>
      <div class="font-marker text-sm text-marker-black mb-2">${ref.position || ''}${ref.phone ? ' · ' + ref.phone : ''}</div>
      ${ref.description ? `<p class="text-sm text-marker-black">${ref.description}</p>` : ''}
    `;
    referencesList.appendChild(el);
  });

  /* Custom Sections */
  const customSectionsContainer = document.getElementById('customSectionsContainer');
  const customSects = window.RxResumeData.getCustomSections(resume);
  if (customSectionsContainer && customSects.length > 0) {
    customSects.forEach(customSection => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'mb-32 relative';
      const headerDiv = document.createElement('div');
      headerDiv.className = 'cut-out bg-crayon-yellow px-8 py-2 inline-block rotate-1 mb-12 border-4 border-white';
      headerDiv.innerHTML = `<h3 class="font-chunky text-3xl md:text-4xl text-marker-black">${customSection.title || ''}</h3>`;
      sectionEl.appendChild(headerDiv);
      const itemsGrid = document.createElement('div');
      itemsGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-8';
      (customSection.items || []).filter(i => !i.hidden).forEach((item, index) => {
        const borderColors = ['border-crayon-blue', 'border-crayon-green', 'border-construction-orange'];
        const rotations = ['-rotate-1', 'rotate-1', '-rotate-2'];
        const el = document.createElement('article');
        el.className = `cut-out bg-paper-white p-6 md:p-8 ${rotations[index % rotations.length]} shadow-xl border-4 ${borderColors[index % borderColors.length]}`;
        const name = item.name || item.title || item.organization || item.position || '';
        const meta = [item.company || item.issuer || item.publisher || item.awarder || item.school || '', item.date || item.period || ''].filter(Boolean).join(' · ');
        const link = window.RxResumeData.getLink(item.website);
        el.innerHTML = `
          <div class="font-chunky text-xl md:text-2xl text-marker-black mb-2">${link ? `<a href="${link}" target="_blank" rel="noopener" class="underline hover:opacity-80">${name}</a>` : name}</div>
          ${meta ? `<div class="font-marker text-sm text-crayon-blue mb-2">${meta}</div>` : ''}
          ${item.description ? `<p class="text-sm text-marker-black">${item.description}</p>` : ''}
        `;
        itemsGrid.appendChild(el);
      });
      sectionEl.appendChild(itemsGrid);
      customSectionsContainer.appendChild(sectionEl);
    });
  }

  // Update navigation links after all content is loaded
  updateNavigationLinks();
}

/* Load Profile Picture */
async function loadProfilePicture() {
  const profilePictureDiv = document.getElementById('profilePicture');
  if (!profilePictureDiv || !resume) return;

  const pictureMeta = window.RxResumeData.getPictureMetadata(resume);
  
  // Check if picture is hidden
  if (pictureMeta.hidden) {
    return;
  }

  try {
    const pictureUrl = window.RxResumeData.getPictureUrl(resume);

    if (pictureUrl) {
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.overflow = 'hidden';
      container.style.position = 'relative';
      container.style.borderRadius = '9999px';
      
      const img = document.createElement('img');
      img.src = pictureUrl;
      img.alt = 'Profile picture';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
      img.style.display = 'block';

      container.appendChild(img);
      profilePictureDiv.innerHTML = '';
      profilePictureDiv.appendChild(container);
    }
  } catch (error) {
    console.log('Profile picture not found');
  }
}

// Load resume data on page load
loadResumeData();
