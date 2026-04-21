/**
 * RxResume data helpers used by all themes.
 * Exposes window.RxResumeData with:
 *   loadResume(path)               – fetch & return parsed resume JSON
 *   getSection(resume, name)       – return resume.sections[name] or null
 *   getItems(resume, sectionName)  – return visible items of a section
 *   getLink(website)               – return URL string or '' from a website object
 *   getPictureDimensions(resume)   – normalized width/height/aspectRatio
 */
(function () {
  'use strict';

  /**
   * Fetch and parse the resume JSON file.
   * @param {string} path  URL path to the JSON file (e.g. '/resume/Reactive Resume.json')
   * @returns {Promise<Object>}
   */
  async function loadResume(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load resume: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Return the section object for a given section name, or null if not found.
   * @param {Object} resume
   * @param {string} sectionName  e.g. 'experience', 'skills', 'profiles'
   * @returns {Object|null}
   */
  function getSection(resume, sectionName) {
    return (resume && resume.sections && resume.sections[sectionName]) || null;
  }

  /**
   * Return the visible items array from a section.
   * Filters out items with hidden === true and skips hidden sections.
   * @param {Object} resume
   * @param {string} sectionName  e.g. 'experience', 'skills', 'profiles'
   * @returns {Array}
   */
  function getItems(resume, sectionName) {
    const section = getSection(resume, sectionName);
    if (!section || section.hidden) return [];
    return (section.items || []).filter(function (item) {
      return !item.hidden;
    });
  }

  /**
   * Extract the href URL from a website field.
   * The website can be:
   *   - an object with a `url` string  { url: '...', label: '...' }
   *   - a plain string
   *   - null / undefined
   * @param {Object|string|null|undefined} website
   * @returns {string}  URL string, or '' if none / empty
   */
  function getLink(website) {
    if (!website) return '';
    var url = (typeof website === 'object') ? (website.url || '') : String(website);
    return url.trim();
  }

  /**
   * Get the profile picture URL from resume data.
   * @param {Object} resume
   * @returns {string|null}  Picture URL or null if not found
   */
  function getPictureUrl(resume) {
    return (resume && resume.picture && resume.picture.url) || null;
  }

  /**
   * Parse a positive numeric value.
   * @param {unknown} value
   * @param {number} fallback
   * @returns {number}
   */
  function toPositiveNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : fallback;
  }

  /**
   * Get normalized picture dimensions from metadata.
   * Falls back to `size` and a square aspect ratio when explicit dimensions are missing.
   * @param {Object} resume
   * @returns {{width: number, height: number, aspectRatio: number}}
   */
  function getPictureDimensions(resume) {
    var picture = (resume && resume.picture) || {};
    var size = toPositiveNumber(picture.size, 200);
    var rawWidth = toPositiveNumber(picture.width, 0);
    var rawHeight = toPositiveNumber(picture.height, 0);
    var aspectFromMeta = toPositiveNumber(picture.aspectRatio, 0);
    var aspectRatio = aspectFromMeta;

    if (!aspectRatio && rawWidth && rawHeight) {
      aspectRatio = rawWidth / rawHeight;
    }
    if (!aspectRatio) {
      aspectRatio = 1;
    }

    var width = rawWidth || size;
    var height = rawHeight || (width / aspectRatio);

    return {
      width: width,
      height: height,
      aspectRatio: aspectRatio,
    };
  }

  /**
   * Get the profile picture metadata (size, border radius, etc.).
   * @param {Object} resume
   * @returns {Object}  Picture metadata object or empty object
   */
  function getPictureMetadata(resume) {
    var picture = (resume && resume.picture) || {};
    var dimensions = getPictureDimensions(resume);

    return {
      hidden: Boolean(picture.hidden),
      url: picture.url || '',
      size: dimensions.width,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.aspectRatio,
      rotation: Number(picture.rotation) || 0,
      borderRadius: Number.isFinite(Number(picture.borderRadius)) ? Number(picture.borderRadius) : 0,
      borderColor: picture.borderColor || 'rgba(0, 0, 0, 0)',
      borderWidth: Number.isFinite(Number(picture.borderWidth)) ? Number(picture.borderWidth) : 0,
      shadowColor: picture.shadowColor || 'rgba(0, 0, 0, 0.5)',
      shadowWidth: Number.isFinite(Number(picture.shadowWidth)) ? Number(picture.shadowWidth) : 0,
    };
  }

  /**
   * Get basics information (name, email, headline, location, etc.).
   * @param {Object} resume
   * @returns {Object}  Basics object or empty object
   */
  function getBasics(resume) {
    return (resume && resume.basics) || {};
  }

  /**
   * Get summary content HTML.
   * @param {Object} resume
   * @returns {string}  Summary HTML content or empty string
   */
  function getSummary(resume) {
    return (resume && resume.summary && resume.summary.content) || '';
  }

  window.RxResumeData = {
    loadResume: loadResume,
    getSection: getSection,
    getItems: getItems,
    getLink: getLink,
    getPictureUrl: getPictureUrl,
    getPictureDimensions: getPictureDimensions,
    getPictureMetadata: getPictureMetadata,
    getBasics: getBasics,
    getSummary: getSummary,
  };
}());
