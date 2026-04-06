let resume = null;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* Helpers */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function stripHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || '';
}

function line(num, code) {
  return `<div class="vsc-line"><span class="vsc-line-num">${num}</span><span class="vsc-line-code">${code}</span></div>`;
}

async function loadResumeData() {
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);

    renderAllPanels();
    loadProfileArt();
  } catch (error) {
    console.error('Error loading resume data:', error);
    $('#panel-about_me').innerHTML = '<div style="padding:2rem;color:#f38ba8;">Error loading resume data. Check resume/Reactive Resume.json.</div>';
    $('#panel-about_me').classList.add('active');
  }
}

/* Render code panels */
function renderAllPanels() {
  if (!resume) return;
  renderAboutMe();
  renderExperience();
  renderProjects();
  renderSkills();
  renderContact();
}

function renderAboutMe() {
  const b = resume.basics;
  const pictureUrl = window.RxResumeData.getPictureUrl(resume);
  const summary = stripHtml(resume.summary?.content || '').trim();
  const summaryLines = wrapText(summary, 60);

  let n = 1;
  let html = '';
  html += line(n++, `<span class="syn-kw">package</span> <span class="syn-pkg">main</span>`);
  html += line(n++, '');
  html += line(n++, `<span class="syn-kw">import</span> (<span class="syn-str">"fmt"</span>, <span class="syn-str">"skills"</span>)`);
  html += line(n++, '');
  html += line(n++, `<span class="syn-kw">type</span> <span class="syn-type">Developer</span> <span class="syn-kw">struct</span> {`);
  html += line(n++, `    Name     <span class="syn-type">string</span>`);
  html += line(n++, `    Role     <span class="syn-type">string</span>`);
  html += line(n++, `    PhotoURL <span class="syn-type">string</span>`);
  html += line(n++, `}`);
  html += line(n++, '');
  html += line(n++, `<span class="syn-kw">func</span> <span class="syn-func">main</span>() {`);
  html += line(n++, `    arin := <span class="syn-type">Developer</span>{`);
  html += line(n++, `        Name:     <span class="syn-str">"${esc(b.name)}"</span>,`);
  html += line(n++, `        Role:     <span class="syn-str">"${esc(b.headline || '')}"</span>,`);
  html += line(n++, `        PhotoURL: <span class="syn-str">"${esc(pictureUrl || '')}"</span>,`);
  html += line(n++, `    }`);
  html += line(n++, `    fmt.<span class="syn-func">Println</span>(arin)`);
  html += line(n++, `}`);
  html += line(n++, '');

  // Profile art in comment block
  html += line(n++, `<span class="syn-comment">/**</span>`);
  html += `<div class="vsc-profile-embed" id="profileArtVsc"></div>`;
  const commentLines = 6;
  for (let i = 0; i < commentLines; i++) {
    html += line(n++, `<span class="syn-comment">//</span>`);
  }
  html += line(n++, `<span class="syn-comment">*/</span>`);
  html += line(n++, '');

  // Summary as comment block
  html += line(n++, `<span class="syn-comment">// Summary:</span>`);
  summaryLines.forEach(l => {
    html += line(n++, `<span class="syn-comment">// ${esc(l)}</span>`);
  });
  html += line(n++, '');

  $('#panel-about_me').innerHTML = html;

  // Load profile art into embed
  loadProfileArt();
}

function renderExperience() {
  const items = window.RxResumeData.getItems(resume, 'experience');
  let n = 1;
  let html = '';

  html += line(n++, `<span class="syn-comment"># Experience</span>`);
  html += line(n++, '');

  items.forEach((item, idx) => {
    html += line(n++, `<span class="syn-tag">- position</span>: <span class="syn-str">"${esc(item.position)}"</span>`);
    html += line(n++, `  <span class="syn-tag">company</span>: <span class="syn-str">"${esc(item.company)}"</span>`);
    html += line(n++, `  <span class="syn-tag">period</span>: <span class="syn-str">"${esc(item.period || '')}"</span>`);
    const link = window.RxResumeData.getLink(item.website);
    if (link) {
      html += line(n++, `  <span class="syn-tag">website</span>: <span class="syn-link">${esc(link)}</span>`);
    }
    // Parse description bullets
    const desc = stripHtml(item.description || '').trim();
    if (desc) {
      html += line(n++, `  <span class="syn-tag">description</span>: |`);
      const descLines = wrapText(desc, 70);
      descLines.forEach(l => {
        html += line(n++, `    <span class="syn-str">${esc(l)}</span>`);
      });
    }
    if (idx < items.length - 1) html += line(n++, '');
  });

  $('#panel-experience').innerHTML = html;
}

function renderProjects() {
  const items = window.RxResumeData.getItems(resume, 'projects');
  let n = 1;
  let html = '';

  html += line(n++, `{`);
  html += line(n++, `  <span class="syn-key">"projects"</span>: [`);

  items.forEach((p, idx) => {
    html += line(n++, `    {`);
    html += line(n++, `      <span class="syn-key">"name"</span>: <span class="syn-str">"${esc(p.name)}"</span>,`);
    const desc = stripHtml(p.description || '').trim();
    const descEsc = esc(desc.length > 120 ? desc.slice(0, 120) + '...' : desc);
    html += line(n++, `      <span class="syn-key">"description"</span>: <span class="syn-str">"${descEsc}"</span>,`);
    const link = window.RxResumeData.getLink(p.website);
    if (link) {
      html += line(n++, `      <span class="syn-key">"url"</span>: <span class="syn-str">"${esc(link)}"</span>,`);
    }
    html += line(n++, `      <span class="syn-key">"hidden"</span>: <span class="syn-bool">false</span>`);
    html += line(n++, `    }${idx < items.length - 1 ? ',' : ''}`);
  });

  html += line(n++, `  ]`);
  html += line(n++, `}`);

  $('#panel-projects').innerHTML = html;
}

function renderSkills() {
  const skills = window.RxResumeData.getItems(resume, 'skills');
  const languages = window.RxResumeData.getItems(resume, 'languages');
  let n = 1;
  let html = '';

  html += line(n++, `<span class="syn-comment"># Skills & Languages</span>`);
  html += line(n++, '');
  html += line(n++, `<span class="syn-section">[skills]</span>`);

  skills.forEach(s => {
    html += line(n++, `<span class="syn-attr">${esc(s.name.replace(/[\s\/]/g, '_').toLowerCase())}</span> = <span class="syn-bool">true</span>`);
  });

  html += line(n++, '');
  html += line(n++, `<span class="syn-section">[languages]</span>`);

  languages.forEach(l => {
    html += line(n++, `<span class="syn-attr">${esc(l.language.toLowerCase())}</span> = <span class="syn-str">"${esc(l.fluency || 'N/A')}"</span>`);
  });

  // Education
  const education = window.RxResumeData.getItems(resume, 'education');
  if (education.length) {
    html += line(n++, '');
    html += line(n++, `<span class="syn-section">[education]</span>`);
    education.forEach(ed => {
      html += line(n++, '');
      html += line(n++, `<span class="syn-section">[[education.items]]</span>`);
      html += line(n++, `<span class="syn-attr">degree</span> = <span class="syn-str">"${esc(ed.degree || '')}"</span>`);
      html += line(n++, `<span class="syn-attr">school</span> = <span class="syn-str">"${esc(ed.school || '')}"</span>`);
      if (ed.area) html += line(n++, `<span class="syn-attr">area</span> = <span class="syn-str">"${esc(ed.area)}"</span>`);
      if (ed.grade) html += line(n++, `<span class="syn-attr">grade</span> = <span class="syn-str">"${esc(ed.grade)}"</span>`);
      html += line(n++, `<span class="syn-attr">period</span> = <span class="syn-str">"${esc(ed.period || '')}"</span>`);
    });
  }

  $('#panel-skills').innerHTML = html;
}

function renderContact() {
  const b = resume.basics;
  const profiles = window.RxResumeData.getItems(resume, 'profiles');
  const github = profiles.find(p => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find(p => (p.network || '').toLowerCase().includes('linkedin'));
  let n = 1;
  let html = '';

  html += line(n++, `<span class="syn-heading"># Contact</span>`);
  html += line(n++, '');
  html += line(n++, `<span class="syn-heading">## ${esc(b.name)}</span>`);
  html += line(n++, '');
  html += line(n++, `<span class="syn-bullet">-</span> <span class="syn-bold">Email:</span> <span class="syn-link">${esc(b.email)}</span>`);
  if (b.location) {
    html += line(n++, `<span class="syn-bullet">-</span> <span class="syn-bold">Location:</span> ${esc(b.location)}`);
  }
  const websiteUrl = window.RxResumeData.getLink(b.website);
  if (websiteUrl) {
    html += line(n++, `<span class="syn-bullet">-</span> <span class="syn-bold">Portfolio:</span> <span class="syn-link">${esc(websiteUrl)}</span>`);
  }
  if (github) {
    const url = window.RxResumeData.getLink(github.website);
    html += line(n++, `<span class="syn-bullet">-</span> <span class="syn-bold">GitHub:</span> <span class="syn-link">${esc(url)}</span>`);
  }
  if (linkedin) {
    const url = window.RxResumeData.getLink(linkedin.website);
    html += line(n++, `<span class="syn-bullet">-</span> <span class="syn-bold">LinkedIn:</span> <span class="syn-link">${esc(url)}</span>`);
  }
  html += line(n++, '');
  html += line(n++, `<span class="syn-heading">## Headline</span>`);
  html += line(n++, '');
  html += line(n++, `${esc(b.headline || '')}`);
  html += line(n++, `${esc(b.location || '')}`);
  html += line(n++, '');
  html += line(n++, `---`);
  html += line(n++, '');
  html += line(n++, `<span class="syn-comment">*View this portfolio in other themes:*</span>`);
  html += line(n++, `<span class="syn-bullet">-</span> [Default](../modern/index.html)`);
  html += line(n++, `<span class="syn-bullet">-</span> [Graphic](../graphic/index.html)`);
  html += line(n++, `<span class="syn-bullet">-</span> [Newspaper](../newspaper/index.html)`);

  $('#panel-contact').innerHTML = html;

  const emailEl = $('#emailLink');
  if (emailEl) emailEl.href = `mailto:${b.email}`;
}

/* Word wrapping helper */
function wrapText(text, maxLen) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  words.forEach(w => {
    if (cur.length + w.length + 1 > maxLen) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + ' ' + w : w;
    }
  });
  if (cur) lines.push(cur);
  return lines;
}

/* Tab switching */
const tabFileMap = {
  about_me: { name: 'about_me.go', lang: 'Go' },
  experience: { name: 'experience.yml', lang: 'YAML' },
  projects: { name: 'projects.json', lang: 'JSON' },
  skills: { name: 'skills.toml', lang: 'TOML' },
  contact: { name: 'contact.md', lang: 'Markdown' },
};

function switchTab(tabId) {
  // Tabs
  $$('.vsc-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  // Tree items
  $$('.vsc-tree-item').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  // Panels
  $$('.vsc-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tabId}`));
  // Breadcrumb
  const info = tabFileMap[tabId];
  if (info) {
    $('#breadcrumbFile').textContent = info.name;
    $('#statusLang').textContent = info.lang;
  }
}

// Tab click
$$('.vsc-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Tree item click
$$('.vsc-tree-item').forEach(item => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

/* Load Profile Art */
async function loadProfileArt() {
  const profileArtVsc = $('#profileArtVsc');
  if (!profileArtVsc || !resume) return;

  const pictureMeta = window.RxResumeData.getPictureMetadata(resume);
  
  // Check if picture is hidden
  if (pictureMeta.hidden) {
    profileArtVsc.innerHTML = '';
    return;
  }

  try {
    const pictureUrl = window.RxResumeData.getPictureUrl(resume);

    if (pictureUrl) {
      // Create container with aspect ratio
      const container = document.createElement('div');
      container.style.width = (pictureMeta.size || 200) + 'px';
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

      profileArtVsc.innerHTML = '';
      container.appendChild(img);
      profileArtVsc.appendChild(container);
    } else {
      // Fallback: try loading from static HTML file
      const response = await fetch(CONFIG.paths.profileArt);
      const html = await response.text();
      profileArtVsc.innerHTML = html;
    }
  } catch {
    const el = $('#profileArtVsc');
    if (el) el.innerHTML = CONFIG.fallbacks?.profileArt || '';
  }
}

/* Init */
loadResumeData();
