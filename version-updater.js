/**
 * Version Updater for unfoldingWord Resources
 * Automatically checks for and updates version links in web pages
 * by querying the Door43 catalog API
 */

(function () {
  'use strict';

  const DEFAULT_CATALOG_API_BASE = 'https://git.door43.org/api/v1/catalog/search';

  // Regex patterns to match different URL types
  const URL_PATTERNS = {
    download: /https:\/\/git\.door43\.org\/([^\/]+)\/([^\/]+)\/releases\/download\/([^\/]+)\//g,
    releases: /https:\/\/git\.door43\.org\/([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)/g,
    preview: /https:\/\/preview\.door43\.org\/u\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?/g
  };

  // Pattern to match status text with version (v followed by digits and dots)
  const STATUS_PATTERN = /v[\d\.]+/g;

  /**
   * Makes a bulk API request to the catalog to get the latest versions for multiple repos
   * @param {string[]} repos - Array of repository names
   * @param {string} apiBaseUrl - Base URL for the catalog API
   * @returns {Promise<Object>} - Map of repo names to version
   */
  async function getLatestCatalogVersion(repos, apiBaseUrl) {
    try {
      const url = `${apiBaseUrl}?owner=unfoldingWord&repo=${repos.join(',')}`;
      console.log(`Fetching catalog data for repos: ${repos.join(', ')}`);

      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch catalog: ${response.status}`);
        return {};
      }

      const data = await response.json();
      const catalogVersions = {};

      if (data && data.data && Array.isArray(data.data)) {
        data.data.forEach(entry => {
          if (entry.name && entry.branch_or_tag_name) {
            catalogVersions[entry.name] = entry.branch_or_tag_name;
          }
        });
        console.log(`Loaded catalog data for ${Object.keys(catalogVersions).length} repositories`);
      } else {
        console.warn('No data found in catalog response');
      }

      return catalogVersions;
    } catch (error) {
      console.error('Error fetching catalog:', error);
      return {};
    }
  }

  /**
   * Extracts repository name from a Door43 URL
   * @param {string} url - The URL to parse
   * @returns {Object|null} - Object with repo info, or null if not found
   */
  function extractRepoInfo(url) {
    // Try each pattern to extract repo info
    for (const [type, pattern] of Object.entries(URL_PATTERNS)) {
      pattern.lastIndex = 0; // Reset regex state
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
   * Updates all toggle blocks that contain links for a specific repository
   * @param {string} repo - Repository name to update
   * @param {string} newVersion - New version to set
   * @param {NodeList} toggleBlocks - List of all toggle blocks on the page
   */
  function updateRepoBlockWithVersion(repo, newVersion, toggleBlocks) {
    console.log(`Updating repository: ${repo} to version ${newVersion}`);

    // Find all toggle blocks that contain links for this repo
    const matchingBlocks = findBlocksForRepo(repo);

    if (matchingBlocks.length === 0) {
      console.warn(`No toggle blocks found for repository: ${repo}`);
      return;
    }

    // Update each block with the new version
    matchingBlocks.forEach(({ block, currentVersion }) => {
      if (currentVersion !== newVersion) {
        updateBlockUrls(block, repo, currentVersion, newVersion);
      } else {
        console.log(`No update needed for ${repo}, already at version ${newVersion}`);
      }
    });
  }

  /**
   * Updates all URLs in a toggle block with the new version
   * @param {Element} block - The toggle block element
   * @param {string} repo - Repository name
   * @param {string} oldVersion - Current version
   * @param {string} newVersion - New version to update to
   */
  function updateBlockUrls(block, repo, oldVersion, newVersion) {
    console.log(`Updating ${repo} from ${oldVersion} to ${newVersion}`);

    // Find all links in the block
    const links = block.querySelectorAll('a[href]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || !href.includes(repo)) return;

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
          console.log(`Updated status text: ${newText}`);
        }
      }
    });
  }

  /**
   * Finds toggle blocks that contain links for a specific repository
   * @param {string} repo - Repository name to search for
   * @returns {Array} - Array of objects containing block and version info
   */
  function findBlocksForRepo(repo) {
    const toggleBlocks = document.querySelectorAll('.wp-block-obb-toggle-block');
    const matchingBlocks = [];

    toggleBlocks.forEach(block => {
      const links = block.querySelectorAll('a[href*="git.door43.org"], a[href*="preview.door43.org"]');

      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && href.includes(repo)) {
          const repoInfo = extractRepoInfo(href);
          if (repoInfo && repoInfo.repo === repo) {
            matchingBlocks.push({
              block: block,
              currentVersion: repoInfo.currentVersion
            });
            break; // Found a match in this block, move to next block
          }
        }
      }
    });

    return matchingBlocks;
  }

  /**
   * Main function that updates versions for specified repositories
   * @param {Object} repoVersionMap - Object mapping repository names to their default versions
   * @param {string} [apiBaseUrl] - Optional API base URL (defaults to Door43 catalog API)
   */
  async function updateVersions(repoVersionMap, apiBaseUrl = DEFAULT_CATALOG_API_BASE) {
    if (!repoVersionMap || typeof repoVersionMap !== 'object' || Object.keys(repoVersionMap).length === 0) {
      console.error('updateVersions requires an object of repository names and their known version');
      return;
    }

    console.log("Starting version update process for repos:", repoVersionMap);
    if (apiBaseUrl !== DEFAULT_CATALOG_API_BASE) {
      console.log(`Using custom API base URL: ${apiBaseUrl}`);
    }

    // Find all toggle blocks first
    const toggleBlocks = document.querySelectorAll('.wp-block-obb-toggle-block');
    if (toggleBlocks.length === 0) {
      console.log('No toggle blocks found on this page');
      return;
    }

    console.log(`Found ${toggleBlocks.length} toggle blocks on the page`);

    // First pass: Update all repositories with their default versions
    for (const repo in repoVersionMap) {
      console.log(`Setting repository: ${repo} to default version: ${repoVersionMap[repo]}`);
      updateRepoBlockWithVersion(repo, repoVersionMap[repo], toggleBlocks);
    }

    // Get catalog data for all repos in one API call
    let catalogVersions = await getLatestCatalogVersion(Object.keys(repoVersionMap), apiBaseUrl);

    if (Object.keys(catalogVersions).length === 0) {
      console.warn('No catalog entries found, staying with default versions');
      return;
    }

    // Second pass: Update with catalog versions if different from defaults
    for (const repo in repoVersionMap) {
      if (!catalogVersions[repo]) {
        console.warn(`No catalog entry found for repository: ${repo}`);
        continue;
      }

      const latestVersion = catalogVersions[repo];
      const defaultVersion = repoVersionMap[repo];

      if (!latestVersion) {
        console.warn(`No version found in catalog for repository: ${repo}`);
        continue;
      }

      if (latestVersion !== defaultVersion) {
        console.log(`Updating ${repo} from default ${defaultVersion} to catalog ${latestVersion}`);
        updateRepoBlockWithVersion(repo, latestVersion, toggleBlocks);
      } else {
        console.log(`${repo} default version ${defaultVersion} matches catalog version`);
      }
    }

    console.log('Version update process completed');
  }

  // Make updateVersions available globally
  window.updateVersions = updateVersions;

})();
