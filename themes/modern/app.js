let resume = null;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

async function loadResumeData() {
  try {
    resume = await window.RxResumeData.loadResume(CONFIG.paths.resumeData);
    initializePage();
    loadProfileArt();
    setTimeout(() => {
      if (window.scrollObserver) {
        initScrollAnimations();
      }
    }, 200);
  } catch (error) {
    console.error('Error loading resume data:', error);
    document.body.innerHTML = CONFIG.errors.resumeLoadError;
  }
}

/* Theme */
const body = document.body;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem(CONFIG.storage.theme);

// Apply saved theme
if (savedTheme) {
  const themeClasses = savedTheme.split(' ').filter(c => c);
  themeClasses.forEach(cls => {
    if (cls.startsWith('theme-')) {
      body.classList.add(cls);
    }
  });
}

function updateThemeColor() {
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', body.classList.contains('theme-dark') 
      ? CONFIG.theme.colors.dark 
      : CONFIG.theme.colors.light);
  }
}

function saveTheme() {
  const classes = Array.from(body.classList).filter(c => c.startsWith('theme-')).join(' ');
  localStorage.setItem(CONFIG.storage.theme, classes);
}

updateThemeColor();

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
    $('#footerEmail').href = `mailto:${basics.email}`;
  }

  if (basics.location) {
    $('#footerLocation').textContent = basics.location;
  }

  const summarySection = resume.summary;
  $('#summaryText').innerHTML = summarySection?.hidden ? '' : (summarySection?.content || '');

  const profiles = window.RxResumeData.getItems(resume, 'profiles');

  const github = profiles.find((p) => (p.network || '').toLowerCase().includes('github'));
  const linkedin = profiles.find((p) => (p.network || '').toLowerCase().includes('linkedin'));
  if (github) {
    const githubUrl = window.RxResumeData.getLink(github.website);
    if (githubUrl) {
      $('#githubLink').href = githubUrl;
      $('#footerGithub').href = githubUrl;
    }
  }
  if (linkedin) {
    const linkedinUrl = window.RxResumeData.getLink(linkedin.website);
    if (linkedinUrl) {
      $('#linkedinLink').href = linkedinUrl;
      $('#footerLinkedin').href = linkedinUrl;
    }
  }

  const websiteUrl = window.RxResumeData.getLink(basics.website);
  if (websiteUrl) {
    const footerLinks = $('.footer-links');
    if (footerLinks && !$('#footerWebsite')) {
      const websiteLink = document.createElement('a');
      websiteLink.id = 'footerWebsite';
      websiteLink.href = websiteUrl;
      websiteLink.target = '_blank';
      websiteLink.rel = 'noopener';
      websiteLink.textContent = basics.website.label || websiteUrl;
      footerLinks.appendChild(websiteLink);
    }
  }

  const headlineTarget = $('#footerHeadline');
  if (headlineTarget) {
    headlineTarget.textContent = basics.headline || '';
  }

function enableTilt(cards) {
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -CONFIG.animation.tilt.range;
      const ry = ((x / rect.width) - 0.5) * CONFIG.animation.tilt.range;
      card.style.transform = `perspective(${CONFIG.animation.tilt.perspective}) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = `perspective(${CONFIG.animation.tilt.perspective}) rotateX(0) rotateY(0)`;
    });
  });
}

  /* Experience */
  const expList = document.getElementById('experienceList');
  window.RxResumeData.getItems(resume, 'experience').forEach(item => {
    const el = document.createElement('article');
    el.className = 'timeline-item animate-on-scroll';
    
    // Create company name with link if website exists
    const companyName = item.website?.url 
      ? `<a href="${item.website.url}" target="_blank" rel="noopener" class="company-link">${item.company}</a>`
      : item.company;
    
    el.innerHTML = `
      <div class="timeline-head">
        <div>
          <div class="timeline-title">${item.position} • ${companyName}</div>
          <div class="timeline-meta">${item.period || ''}</div>
        </div>
      </div>
      <div class="timeline-body">${item.description || ''}</div>
    `;
    expList.appendChild(el);
  });

  /* Projects */
  const projectsGrid = document.getElementById('projectsGrid');
  const projectCards = [];
  window.RxResumeData.getItems(resume, 'projects').forEach(p => {
    const el = document.createElement('article');
    el.className = 'card tilt animate-on-scroll';
    const projectLink = window.RxResumeData.getLink(p.website);
    el.innerHTML = `
      <div class="card-title">${p.name}</div>
      <div class="card-meta"></div>
      <div class="card-body">${p.description || ''}</div>
      <div class="card-actions">
        <div class="tag-row"></div>
        ${projectLink ? `<a href="${projectLink}" target="_blank" class="btn btn-ghost">Open</a>` : ''}
      </div>
    `;
    projectsGrid.appendChild(el);
    projectCards.push(el);
  });
  enableTilt(projectCards);

  /* Education */
  const eduList = document.getElementById('educationList');
  window.RxResumeData.getItems(resume, 'education').forEach(ed => {
    const el = document.createElement('article');
    el.className = 'edu-item animate-on-scroll';
    el.innerHTML = `
      <div class="timeline-title">${ed.degree || ''} • ${ed.school || ''}</div>
      <div class="timeline-meta">${ed.area || ''} ${ed.grade ? '• ' + ed.grade : ''} • ${ed.period || ''}</div>
      <div class="timeline-body">${ed.description || ''}</div>
    `;
    eduList.appendChild(el);
  });

  /* Skills */
  const skillsCloud = document.getElementById('skillsCloud');
  window.RxResumeData.getItems(resume, 'skills').forEach(s => {
    const el = document.createElement('span');
    el.className = 'skill animate-on-scroll';
    el.textContent = s.name;
    skillsCloud.appendChild(el);
  });

  /* Languages */
  const languagesList = document.getElementById('languagesList');
  if (languagesList) {
    const languages = window.RxResumeData.getItems(resume, 'languages');
    if (languages.length > 0) {
      languagesList.innerHTML = languages.map((lang, index) => {
        const fluency = lang.fluency || '';
        return `
          <div class="language-item animate-on-scroll" style="transition-delay: ${index * 0.1}s">
            <span class="language-name">${lang.language}</span>
            ${fluency ? `<span class="language-fluency">${fluency}</span>` : ''}
          </div>
        `;
      }).join('');
    }
  }
}

/* Load Profile Art */
async function loadProfileArt() {
  const profileArt = document.getElementById('profileArt');
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

      profileArt.innerHTML = '';
      container.appendChild(img);
      profileArt.appendChild(container);
    } else {
      // Fallback: try loading from static HTML file
      const response = await fetch(CONFIG.paths.profileArt);
      const html = await response.text();
      profileArt.innerHTML = html;
    }
  } catch (error) {
    console.log(CONFIG.errors.profileArtNotFound);
    profileArt.innerHTML = CONFIG.fallbacks.profileArt || '';
  }
}
            
// Load profile art after resume data is loaded (called in initializePage)
function loadProfileArtAfterResume() {
  loadProfileArt();
}

/* Scroll Animations with Intersection Observer */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Store observer globally for re-use
  window.scrollObserver = observer;

  // Observe all cards
  document.querySelectorAll('.card.animate-on-scroll').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });

  // Observe timeline items
  document.querySelectorAll('.timeline-item.animate-on-scroll').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
  });

  // Observe education items
  document.querySelectorAll('.edu-item.animate-on-scroll').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
  });

  // Observe skills
  document.querySelectorAll('.skill.animate-on-scroll').forEach((skill, index) => {
    skill.style.transitionDelay = `${index * 0.05}s`;
    observer.observe(skill);
  });

  // Observe language items
  document.querySelectorAll('.language-item.animate-on-scroll').forEach((item, index) => {
    observer.observe(item);
  });

  // Observe sections
  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
}

/* Parallax Effect */
function initParallax() {
  const hero = document.querySelector('.hero');
  const orbs = document.querySelectorAll('.orb');
  
  if (!hero) return;

  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;

    // Only apply parallax to orbs, not profile art
    orbs.forEach((orb, index) => {
      const speed = (index + 1) * 0.2;
      orb.style.transform = `translateY(${rate * speed}px)`;
    });

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick);
}

/* Smooth Scroll for Navigation Links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#top') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* Enhanced Micro-interactions */
function initMicroInteractions() {
  // Button ripple effect
  document.querySelectorAll('.btn, .chip, .icon-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Card hover glow effect
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const angleX = (y - centerY) / 10;
      const angleY = (centerX - x) / 10;
      
      this.style.setProperty('--mouse-x', `${x}px`);
      this.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* Add ripple effect styles dynamically */
function addRippleStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .btn, .chip, .icon-btn {
      position: relative;
      overflow: hidden;
    }
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    }
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Load resume data when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    addRippleStyles();
    initSmoothScroll();
    initMicroInteractions();
    
    // Initialize animations after data loads
    setTimeout(() => {
      initScrollAnimations();
      initParallax();
    }, 300);
  });
} else {
  loadResumeData();
  addRippleStyles();
  initSmoothScroll();
  initMicroInteractions();
  
  // Initialize animations after data loads
  setTimeout(() => {
    initScrollAnimations();
    initParallax();
  }, 300);
}