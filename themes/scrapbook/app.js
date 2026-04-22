let resume = null;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
  window.RxResumeData.getItems(resume, 'experience').forEach((item, index) => {
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
  window.RxResumeData.getItems(resume, 'projects').forEach((p, index) => {
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
  window.RxResumeData.getItems(resume, 'education').forEach((ed, index) => {
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
