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
    { href: '#profilesGrid', label: 'Profiles', container: '#profilesSection' },
    { href: '#experienceList', label: 'Experience', container: '#experience' },
    { href: '#projectsList', label: 'Projects', container: '#projects' },
    { href: '#skillsLexicon', label: 'Skills', container: '#skillsSection' },
    { href: '#educationText', label: 'Education', container: '#educationSection' },
    { href: '#languagesList', label: 'Languages', container: '#languagesSection' },
    { href: '#interestsList', label: 'Interests', container: '#interestsSection' },
    { href: '#awardsList', label: 'Awards', container: '#awardsSection' },
    { href: '#certificationsList', label: 'Certifications', container: '#certificationsSection' },
    { href: '#publicationsList', label: 'Publications', container: '#publicationsSection' },
    { href: '#volunteerList', label: 'Volunteer', container: '#volunteerSection' },
    { href: '#referencesList', label: 'References', container: '#referencesSection' },
  ];

  // Add custom sections (after standard)
  const customContainer = document.getElementById('customSectionsContainer');
  if (customContainer) {
    const customSections = customContainer.querySelectorAll('.custom-section-block');
    customSections.forEach((section) => {
      const title = section.querySelector('.mini-title')?.textContent;
      if (title) {
        sections.push({
          href: `#${section.id || 'custom-section'}`,
          label: title,
          container: `#${section.id || 'custom-section'}`
        });
      }
    });
  }

  // Find existing nav links
  const existingLinks = nav.querySelectorAll('a:not(.theme-opt)');
  
  // Remove old section links
  existingLinks.forEach(link => {
    if (link.href && link.href.includes('#')) {
      link.remove();
    }
  });

  // Add nav links for visible sections only
  sections.forEach((section) => {
    const container = document.querySelector(section.container);
    // Only add if container exists and is visible
    if (isVisible(container)) {
      const link = document.createElement('a');
      link.href = section.href;
      link.textContent = section.label;
      nav.appendChild(link);
    }
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeRichText(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");

  const blockedTags = ["script", "style", "iframe", "object", "embed", "link", "meta"];
  blockedTags.forEach((tag) => {
    template.content.querySelectorAll(tag).forEach((node) => node.remove());
  });

  template.content.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = (attr.value || "").trim();

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        return;
      }

      if ((name === "href" || name === "src") && /^javascript:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    });

    if (el.tagName.toLowerCase() === "a") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener nofollow");
    }
  });

  return template.innerHTML;
}

function firstText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function formatToday() {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

function roleTokens(basics, skills) {
  const headline = firstText(basics.headline);
  const fromHeadline = headline
    .split(/[|,/]+|\s-\s/g)
    .map((token) => token.trim())
    .filter(Boolean);

  if (fromHeadline.length >= 2) {
    return fromHeadline.slice(0, 4);
  }

  return skills
    .map((skill) => firstText(skill.name))
    .filter(Boolean)
    .slice(0, 4);
}

function profileLinks(profiles) {
  const lowered = (text) => String(text || "").toLowerCase();
  const findByNetwork = (name) => profiles.find((profile) => lowered(profile.network).includes(name));

  const github = findByNetwork("github");
  const linkedin = findByNetwork("linkedin");

  return {
    github: github ? window.RxResumeData.getLink(github.website) : "",
    linkedin: linkedin ? window.RxResumeData.getLink(linkedin.website) : "",
  };
}

function renderRoles(roles) {
  const container = $("#headlineRoles");
  const safeRoles = roles.length ? roles : ["Software Engineer", "Builder", "Problem Solver"];
  const fragments = [];

  safeRoles.forEach((role, index) => {
    fragments.push(`<span>${escapeHtml(role)}</span>`);
    if (index < safeRoles.length - 1) {
      fragments.push('<span class="dot">*</span>');
    }
  });

  container.innerHTML = fragments.join("");
}

function renderExperience(experience) {
  const container = $("#experienceList");
  const items = experience.slice(0, 3);

  container.innerHTML = items
    .map((item) => {
      const company = firstText(item.company, "Confidential Team");
      const position = firstText(item.position, "Engineering Contributor");
      const period = firstText(item.period || item.date, "Recent");
      const description = firstText(item.description, "Delivered high-impact engineering outcomes.");

      return `
        <article class="exp-item">
          <div class="exp-head">
            <h3 class="exp-title">${escapeHtml(position)} at ${escapeHtml(company)}</h3>
          </div>
          <p class="exp-meta">${escapeHtml(period)}</p>
          <div class="exp-body">${sanitizeRichText(description)}</div>
        </article>
      `;
    })
    .join("");
}

function renderFocus(skills) {
  const container = $("#focusAreas");
  const picks = skills.slice(0, 4);

  container.innerHTML = picks
    .map((skill) => {
      const name = firstText(skill.name, "Engineering");
      const body = firstText(
        skill.description || skill.level,
        "Hands-on delivery with strong quality, reliability, and performance discipline."
      );

      return `
        <article class="focus-item">
          <h4>${escapeHtml(name)}</h4>
          <p>${escapeHtml(body)}</p>
        </article>
      `;
    })
    .join("");
}

function renderProjects(projects) {
  const container = $("#projectsList");
  const items = projects.slice(0, 4);

  container.innerHTML = items
    .map((project, index) => {
      const name = firstText(project.name, `Project ${index + 1}`);
      const desc = firstText(project.description, "Production-grade project delivery with measurable business impact.");
      const url = window.RxResumeData.getLink(project.website);

      return `
        <article class="project-item">
          <h4>${escapeHtml(name)}</h4>
          <div class="project-body">${sanitizeRichText(desc)}</div>
          ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">Read More</a>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderLanguages(languages) {
  const container = $("#languagesList");
  container.innerHTML = languages
    .slice(0, 5)
    .map((item) => {
      const lang = firstText(item.language, "English");
      const fluency = firstText(item.fluency, "Professional");
      return `<div class="language-row"><span>${escapeHtml(lang)}</span><span class="fluency">${escapeHtml(fluency)}</span></div>`;
    })
    .join("");
}

function setAnchorHref(selector, href) {
  const el = $(selector);
  if (!el || !href) return;
  el.href = href;
}

function renderInterests(items) {
  const container = $('#interestsList');
  const block = container ? container.closest('.interests-block') : null;
  if (!items.length) { if (block) block.hidden = true; return; }
  if (block) block.hidden = false;
  items.forEach(function(interest) {
    var el = document.createElement('div');
    el.className = 'np-interest-item';
    el.innerHTML = '<span class="np-interest-name">' + escapeHtml(interest.name || '') + '</span>' +
      (interest.keywords && interest.keywords.length ? '<span class="np-interest-keywords">' + escapeHtml(interest.keywords.join(', ')) + '</span>' : '');
    container.appendChild(el);
  });
}

function renderAwards(items) {
  const container = $('#awardsList');
  const block = container ? container.closest('.awards-block') : null;
  if (!items.length) { if (block) block.hidden = true; return; }
  if (block) block.hidden = false;
  items.forEach(function(award) {
    var link = window.RxResumeData.getLink(award.website);
    var el = document.createElement('article');
    el.className = 'np-timeline-item';
    el.innerHTML = '<div class="np-item-title">' + (link ? '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener nofollow">' + escapeHtml(award.title || '') + '</a>' : escapeHtml(award.title || '')) + '</div>' +
      '<div class="np-item-meta">' + escapeHtml(award.awarder || '') + (award.date ? ' · ' + escapeHtml(award.date) : '') + '</div>' +
      (award.description ? '<div class="np-item-body">' + sanitizeRichText(award.description) + '</div>' : '');
    container.appendChild(el);
  });
}

function renderCertifications(items) {
  const container = $('#certificationsList');
  const block = container ? container.closest('.certifications-block') : null;
  if (!items.length) { if (block) block.hidden = true; return; }
  if (block) block.hidden = false;
  items.forEach(function(cert) {
    var link = window.RxResumeData.getLink(cert.website);
    var el = document.createElement('article');
    el.className = 'np-timeline-item';
    el.innerHTML = '<div class="np-item-title">' + (link ? '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener nofollow">' + escapeHtml(cert.title || '') + '</a>' : escapeHtml(cert.title || '')) + '</div>' +
      '<div class="np-item-meta">' + escapeHtml(cert.issuer || '') + (cert.date ? ' · ' + escapeHtml(cert.date) : '') + '</div>' +
      (cert.description ? '<div class="np-item-body">' + sanitizeRichText(cert.description) + '</div>' : '');
    container.appendChild(el);
  });
}

function renderPublications(items) {
  const container = $('#publicationsList');
  const block = container ? container.closest('.publications-block') : null;
  if (!items.length) { if (block) block.hidden = true; return; }
  if (block) block.hidden = false;
  items.forEach(function(pub) {
    var link = window.RxResumeData.getLink(pub.website);
    var el = document.createElement('article');
    el.className = 'np-timeline-item';
    el.innerHTML = '<div class="np-item-title">' + (link ? '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener nofollow">' + escapeHtml(pub.title || '') + '</a>' : escapeHtml(pub.title || '')) + '</div>' +
      '<div class="np-item-meta">' + escapeHtml(pub.publisher || '') + (pub.date ? ' · ' + escapeHtml(pub.date) : '') + '</div>' +
      (pub.description ? '<div class="np-item-body">' + sanitizeRichText(pub.description) + '</div>' : '');
    container.appendChild(el);
  });
}

function renderVolunteer(items) {
  const container = $('#volunteerList');
  const block = container ? container.closest('.volunteer-block') : null;
  if (!items.length) { if (block) block.hidden = true; return; }
  if (block) block.hidden = false;
  items.forEach(function(vol) {
    var el = document.createElement('article');
    el.className = 'np-timeline-item';
    el.innerHTML = '<div class="np-item-title">' + escapeHtml(vol.organization || '') + '</div>' +
      '<div class="np-item-meta">' + escapeHtml(vol.position || '') + (vol.period ? ' · ' + escapeHtml(vol.period) : '') + (vol.location ? ' · ' + escapeHtml(vol.location) : '') + '</div>' +
      (vol.description ? '<div class="np-item-body">' + sanitizeRichText(vol.description) + '</div>' : '');
    container.appendChild(el);
  });
}

function renderReferences(items) {
  const container = $('#referencesList');
  const block = container ? container.closest('.references-block') : null;
  if (!items.length) { if (block) block.hidden = true; return; }
  if (block) block.hidden = false;
  items.forEach(function(ref) {
    var el = document.createElement('article');
    el.className = 'np-timeline-item';
    el.innerHTML = '<div class="np-item-title">' + escapeHtml(ref.name || '') + '</div>' +
      '<div class="np-item-meta">' + escapeHtml(ref.position || '') + (ref.phone ? ' · ' + escapeHtml(ref.phone) : '') + '</div>' +
      (ref.description ? '<div class="np-item-body">' + sanitizeRichText(ref.description) + '</div>' : '');
    container.appendChild(el);
  });
}

function renderCustomSections(resume) {
  var container = $('#customSectionsContainer');
  if (!container) return;
  var sections = window.RxResumeData.getCustomSections(resume);
  if (!sections.length) return;
  sections.forEach(function(customSection) {
    var block = document.createElement('div');
    block.className = 'boxed-block custom-section-block';
    var title = document.createElement('h3');
    title.className = 'mini-title';
    title.textContent = customSection.title || '';
    block.appendChild(title);
    (customSection.items || []).filter(function(i) { return !i.hidden; }).forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'np-timeline-item';
      var name = item.name || item.title || item.organization || item.position || '';
      var meta = [item.company || item.issuer || item.publisher || item.awarder || item.school || '', item.date || item.period || ''].filter(Boolean).join(' · ');
      var link = window.RxResumeData.getLink(item.website);
      el.innerHTML = '<div class="np-item-title">' + (link ? '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener nofollow">' + escapeHtml(name) + '</a>' : escapeHtml(name)) + '</div>' +
        (meta ? '<div class="np-item-meta">' + escapeHtml(meta) + '</div>' : '') +
        (item.description ? '<div class="np-item-body">' + sanitizeRichText(item.description) + '</div>' : '');
      block.appendChild(el);
    });
    container.appendChild(block);
  });
}

async function loadResumeWithFallback() {
  const configuredPath = CONFIG && CONFIG.paths && CONFIG.paths.resumeData ? CONFIG.paths.resumeData : "";
  const candidates = [
    configuredPath,
    "../../resume/Reactive Resume.json",
    "/awesome-github-portfolio/resume/Reactive Resume.json",
    "resume/Reactive Resume.json",
  ].filter(Boolean);

  let lastError = null;
  for (const path of candidates) {
    try {
      return await window.RxResumeData.loadResume(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to load resume data from any known path.");
}

async function initialize() {
  try {
    const resume = await loadResumeWithFallback();
    const basics = resume.basics || {};
    const summary = resume.summary || {};
    const profiles = window.RxResumeData.getItems(resume, "profiles");
    const skills = window.RxResumeData.getItems(resume, "skills");
    const experience = window.RxResumeData.getItems(resume, "experience");
    const projects = window.RxResumeData.getItems(resume, "projects");
    const languages = window.RxResumeData.getItems(resume, "languages");
    const education = window.RxResumeData.getItems(resume, "education");

    const todayDateEl = $("#todayDate");
    if (todayDateEl) {
      todayDateEl.textContent = formatToday();
    }
    $$('[data-name]').forEach((el) => {
      el.textContent = firstText(basics.name, "Developer Portfolio");
    });

    renderRoles(roleTokens(basics, skills));

    const summaryText = summary.hidden ? "" : firstText(summary.content, firstText(basics.headline, "Building dependable software systems."));
    const summaryEl = $("#summaryText");
    if (summaryEl) {
      summaryEl.innerHTML = sanitizeRichText(summaryText);
    }

    const skillTags = skills
      .slice(0, 12)
      .map((skill) => `<span>${escapeHtml(firstText(skill.name, "Engineering"))}</span>`)
      .join("");
    const lexiconEl = $("#skillsLexicon");
    if (lexiconEl) {
      lexiconEl.innerHTML = skillTags;
    }

    const links = profileLinks(profiles);
    if (basics.email) {
      setAnchorHref("#emailLink", `mailto:${basics.email}`);
    } else {
      const emailLink = $("#emailLink");
      if (emailLink) emailLink.hidden = true;
    }
    
    if (links.github) {
      setAnchorHref("#githubLink", links.github);
    } else {
      const githubLink = $("#githubLink");
      if (githubLink) githubLink.hidden = true;
    }
    
    if (links.linkedin) {
      setAnchorHref("#linkedinLink", links.linkedin);
    } else {
      const linkedinLink = $("#linkedinLink");
      if (linkedinLink) linkedinLink.hidden = true;
    }

    renderExperience(experience);
    renderFocus(skills);
    renderProjects(projects);
    renderLanguages(languages);
    renderInterests(window.RxResumeData.getItems(resume, 'interests'));
    renderAwards(window.RxResumeData.getItems(resume, 'awards'));
    renderCertifications(window.RxResumeData.getItems(resume, 'certifications'));
    renderPublications(window.RxResumeData.getItems(resume, 'publications'));
    renderVolunteer(window.RxResumeData.getItems(resume, 'volunteer'));
    renderReferences(window.RxResumeData.getItems(resume, 'references'));
    renderCustomSections(resume);

    const edu = education[0];
    const degree = firstText(edu?.studyType);
    const area = firstText(edu?.area);
    const institution = firstText(edu?.institution, "Academic Highlights");
    const score = firstText(edu?.score);
    const date = firstText(edu?.date || edu?.period);
    const educationEl = $("#educationText");
    if (educationEl) {
      educationEl.innerHTML = `${escapeHtml([degree, area].filter(Boolean).join(" in "))}<br>${escapeHtml(institution)}<br>${escapeHtml([score, date].filter(Boolean).join(" - "))}`;
    }

    const pictureUrl = window.RxResumeData.getPictureUrl(resume);
    const profileImage = $("#profileImage");
    if (profileImage) {
      if (pictureUrl) {
        profileImage.src = pictureUrl;
        profileImage.hidden = false;
      } else {
        profileImage.hidden = true;
      }
    }

    const location = firstText(basics.location, "Digital Edition");
    const footerCopyEl = $("#footerCopy");
    if (footerCopyEl) {
      footerCopyEl.textContent = [
        `Published by ${firstText(basics.name, "Portfolio Author")}`,
        `Digital presence from ${location}`,
        "Distributed worldwide",
      ].join("\n");
    }

    setAnchorHref("#resumeLink", window.RxResumeData.getLink(basics.custom));
    const footerLegalEl = $("#footerLegal");
    if (footerLegalEl) {
      footerLegalEl.textContent = `Copyright ${new Date().getFullYear()} all rights reserved.`;
    }

    // Update navigation with visible sections
    updateNavigationLinks();

  } catch (error) {
    console.error("Error loading resume data:", error);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

document.addEventListener('DOMContentLoaded', initialize);
