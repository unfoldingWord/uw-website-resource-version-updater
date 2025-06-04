/**
 * Version Updater for unfoldingWord Resources
 * Automatically checks for and updates version links in web pages
 * by querying the Door43 catalog API
 */

(function () {
  'use strict';

  const CATALOG_API_BASE = 'https://git.door43.org/api/v1/catalog/search';

  // Regex patterns to match different URL types
  const URL_PATTERNS = {
    download: /https:\/\/git\.door43\.org\/([^\/]+)\/([^\/]+)\/releases\/download\/([^\/]+)\//g,
    releases: /https:\/\/git\.door43\.org\/([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)/g,
    preview: /https:\/\/preview\.door43\.org\/u\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?/g
  };

  // Pattern to match status text with version (v followed by digits and dots)
  const STATUS_PATTERN = /v[\d\.]+/g;

  /**
   * Makes an API request to the catalog to get the latest version
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<string|null>} - Latest version or null if not found
   */
  async function getLatestVersion(owner, repo) {
    try {
      const url = `${CATALOG_API_BASE}?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch catalog for ${owner}/${repo}: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        return data.data[0].branch_or_tag_name;
      }

      console.warn(`No data found in catalog for ${owner}/${repo}`);
      return null;
    } catch (error) {
      console.error(`Error fetching catalog for ${owner}/${repo}:`, error);
      return null;
    }
  }

  /**
   * Extracts owner and repo from a Door43 URL
   * @param {string} url - The URL to parse
   * @returns {Object|null} - Object with owner and repo, or null if not found
   */
  function extractOwnerRepo(url) {
    // Try each pattern to extract owner/repo
    for (const [type, pattern] of Object.entries(URL_PATTERNS)) {
      const match = pattern.exec(url);
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
          currentVersion: match[3],
          type: type
        };
      }
    }
    return null;
  }

  /**
   * Updates all URLs in a toggle block with the new version
   * @param {Element} block - The toggle block element
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} oldVersion - Current version
   * @param {string} newVersion - New version to update to
   */
  function updateBlockUrls(block, owner, repo, oldVersion, newVersion) {
    console.log(`Updating ${owner}/${repo} from ${oldVersion} to ${newVersion}`);

    // Find all links in the block
    const links = block.querySelectorAll('a[href]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Update download URLs
      if (href.includes('git.door43.org') && href.includes('/releases/download/')) {
        const newHref = href.replace(
          `/releases/download/${oldVersion}/`,
          `/releases/download/${newVersion}/`
        ).replace(
          `_${oldVersion}.pdf`,
          `_${newVersion}.pdf`
        );
        link.setAttribute('href', newHref);
        console.log(`Updated download link: ${href} -> ${newHref}`);
      }

      // Update release tag URLs
      if (href.includes('git.door43.org') && href.includes('/releases/tag/')) {
        const newHref = href.replace(
          `/releases/tag/${oldVersion}`,
          `/releases/tag/${newVersion}`
        );
        link.setAttribute('href', newHref);
        console.log(`Updated release link: ${href} -> ${newHref}`);
      }

      // Update preview URLs
      if (href.includes('preview.door43.org')) {
        let newHref = href;
        // Handle URLs with trailing slash
        if (href.includes(`/${oldVersion}/`)) {
          newHref = href.replace(`/${oldVersion}/`, `/${newVersion}/`);
        }
        // Handle URLs without trailing slash
        else if (href.endsWith(`/${oldVersion}`)) {
          newHref = href.replace(`/${oldVersion}`, `/${newVersion}`);
        }

        if (newHref !== href) {
          link.setAttribute('href', newHref);
          console.log(`Updated preview link: ${href} -> ${newHref}`);
        }
      }
    });

    // Update status text
    const paragraphs = block.querySelectorAll('p');
    paragraphs.forEach(p => {
      if (p.textContent.includes('Status:')) {
        const newText = p.textContent.replace(STATUS_PATTERN, newVersion);
        if (newText !== p.textContent) {
          p.textContent = newText;
          console.log(`Updated status text: ${p.textContent}`);
        }
      }
    });
  }

  /**
   * Processes a single toggle block
   * @param {Element} block - The toggle block element
   * @returns {Promise<void>}
   */
  async function processToggleBlock(block) {
    // Find the first Door43 URL to extract owner/repo info
    const links = block.querySelectorAll('a[href*="git.door43.org"], a[href*="preview.door43.org"]');

    if (links.length === 0) {
      return; // No Door43 links found
    }

    let ownerRepoInfo = null;

    // Look for a URL that contains version info
    for (const link of links) {
      const href = link.getAttribute('href');
      ownerRepoInfo = extractOwnerRepo(href);
      if (ownerRepoInfo) {
        break;
      }
    }

    if (!ownerRepoInfo) {
      return; // No parseable Door43 URLs found
    }

    const { owner, repo, currentVersion } = ownerRepoInfo;

    try {
      const latestVersion = await getLatestVersion(owner, repo);

      if (!latestVersion) {
        console.warn(`Could not determine latest version for ${owner}/${repo}`);
        return;
      }

      if (latestVersion !== currentVersion) {
        console.log(`Found version update for ${owner}/${repo}: ${currentVersion} -> ${latestVersion}`);
        updateBlockUrls(block, owner, repo, currentVersion, latestVersion);
      } else {
        console.log(`${owner}/${repo} is already up to date (${currentVersion})`);
      }
    } catch (error) {
      console.error(`Error processing ${owner}/${repo}:`, error);
    }
  }

  /**
   * Updates relative links to use the unfoldingword.org domain
   */
  function updateRelativeLinks() {
    const links = document.querySelectorAll('a[href], img[src], link[href]');

    links.forEach(element => {
      const attrName = element.tagName.toLowerCase() === 'img' ? 'src' : 'href';
      const url = element.getAttribute(attrName);

      if (url && url.startsWith('/') && !url.startsWith('//')) {
        // This is a relative URL, make it absolute
        const newUrl = 'https://unfoldingword.org' + url;
        element.setAttribute(attrName, newUrl);
        console.log(`Updated relative link: ${url} -> ${newUrl}`);
      }
    });
  }

  /**
   * Main function that processes all toggle blocks on the page
   */
  async function updateVersions() {
    console.log('Starting version update process...');

    // Update relative links first
    updateRelativeLinks();

    // Find all toggle blocks
    const toggleBlocks = document.querySelectorAll('.wp-block-obb-toggle-block');

    if (toggleBlocks.length === 0) {
      console.log('No toggle blocks found on this page');
      return;
    }

    console.log(`Found ${toggleBlocks.length} toggle blocks to process`);

    // Process each block with a small delay to avoid overwhelming the API
    for (let i = 0; i < toggleBlocks.length; i++) {
      await processToggleBlock(toggleBlocks[i]);

      // Add a small delay between requests
      if (i < toggleBlocks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('Version update process completed');
  }

  // Run when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateVersions);
  } else {
    // DOM is already ready
    updateVersions();
  }

})();
