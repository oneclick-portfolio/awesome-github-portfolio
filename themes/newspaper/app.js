const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
    }
    setAnchorHref("#githubLink", links.github);
    setAnchorHref("#linkedinLink", links.linkedin);

    renderExperience(experience);
    renderFocus(skills);
    renderProjects(projects);
    renderLanguages(languages);

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
  } catch (error) {
    console.error("Error loading resume data:", error);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

initialize();
