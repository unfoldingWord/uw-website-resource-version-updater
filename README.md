# unfoldingWord Version Updater

A JavaScript utility that automatically updates version links and references on unfoldingWord web pages by querying the Door43 catalog API.

## Overview

This script automatically scans unfoldingWord web pages for resource blocks (`.wp-block-obb-toggle-block`) and updates version numbers in:

- Download links (git.door43.org releases)
- Release tag links
- Preview links (preview.door43.org)
- Status text (e.g., "Status: In Progress – v0.33" → "Status: In Progress – v0.34")

## Live Usage

The script is hosted via GitHub Pages and can be embedded on any website by adding:

```html
<script src="https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js"></script>
```

### Current Implementation

This script is currently used on:

- **Content Page**: `https://unfoldingword.org/for-translators/content/`
- **Training Page**: `https://unfoldingword.org/for-translators/training/`

## How It Works

1. **Call updateVersions()** with an map of repository names to update and the version to use if we can't find it in the catalog (catalog fails, or is removed from catalog, etc.)
2. **Makes a single API call** to the Door43 catalog: `https://git.door43.org/api/v1/catalog/search?owner=unfoldingWord&repo=repo1,repo2,repo3`
3. **Maps catalog versions** by repository name for quick lookup
4. **Finds toggle blocks** containing links for each specified repository
5. **Compares versions** and updates if a newer version is available
6. **Updates all relevant links and text** with the new version number

## Usage

After including the script, call the `updateVersions()` function with a map of repository names and default versions:

```html
<script src="version-updater.js"></script>
<script>
  updateVersions({ en_obs: 'v9', en_tn: 'v85', en_ult: 'v85', en_ust: 'v85', en_tw: 'v85', 'el-x-koine_ugnt': 'v0.34', hbo_uhb: 'v2.1.31' });
</script>
```

### API Function Reference

**`updateVersions(repoVersionMap, apiBaseUrl)`**

- **`repoVersionMap`** (Object, required): Object mapping repository names to their default versions
  - Example: `{ en_tw: 'v85', en_tn: 'v85' }`
  - The function will first update all links with these default versions immediately
  - Then query the catalog API and update again if newer versions are found
- **`apiBaseUrl`** (String, optional): Custom API base URL for the catalog service
  - Default: `'https://git.door43.org/api/v1/catalog/search'`
  - Use this parameter to point to a different catalog API instance

#### Examples

**Basic usage:**

```javascript
updateVersions({ en_tw: 'v85', en_tn: 'v85' });
```

**Using a custom API endpoint:**

```javascript
updateVersions({ en_tw: 'v85', en_tn: 'v85' }, 'https://custom-api.example.com/v1/catalog/search');
```

**Multiple repositories:**

```javascript
updateVersions({
  en_obs: 'v9',
  en_tn: 'v85',
  en_ult: 'v85',
  en_ust: 'v85',
  en_tw: 'v85',
  'el-x-koine_ugnt': 'v0.34',
  hbo_uhb: 'v2.1.31',
});
```

### Repository Names

Common unfoldingWord repositories:

- `en_obs` - Open Bible Stories
- `en_tn` - Translation Notes
- `en_ult` - Unlocked Literal Text
- `en_ust` - Unlocked Simplified Text
- `en_tw` - Translation Words
- `en_ta` - Translation Academy
- `en_tq` - Translation Questions
- `el-x-koine_ugnt` - Greek New Testament
- `hbo_uhb` - Hebrew Old Testament

## Features

- ✅ **Automatic version detection** from URL patterns
- ✅ **API integration** with Door43 catalog
- ✅ **Comprehensive URL updates** (downloads, releases, previews)
- ✅ **Status text updates** with proper version formatting
- ✅ **Error handling** and console logging
- ✅ **Non-blocking execution** with API request delays

## Installation Options

### Option 1: WordPress.com (Recommended)

For WordPress.com sites, add a **Custom HTML block** to your page:

```html
<script src="https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js"></script>
<script>
  updateVersions({
    en_obs: 'v9',
    en_tn: 'v85',
    en_ult: 'v85',
    en_ust: 'v85',
    en_tw: 'v85',
    'el-x-koine_ugnt': 'v0.34',
    hbo_uhb: 'v2.1.31',
  });
</script>
```

### Option 2: Any Website

Add the script tag to your HTML head or before the closing `</body>` tag:

```html
<script src="https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js"></script>
<script>
  updateVersions({ en_tw: 'v85', en_tn: 'v85' }); // Specify which repositories to update
</script>
```

### Option 3: Conditional Loading

Load only on specific pages:

```html
<script>
  if (window.location.pathname.includes('/for-translators/content/')) {
    var script = document.createElement('script');
    script.src = 'https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js';
    script.onload = function () {
      updateVersions({
        en_obs: 'v9',
        en_tn: 'v85',
        en_ult: 'v85',
        en_ust: 'v85',
        en_tw: 'v85',
        'el-x-koine_ugnt': 'v0.34',
        hbo_uhb: 'v2.1.31',
      });
      console.log('Version updater script loaded and executed for content page.');
    };
    document.head.appendChild(script);
  } else if (window.location.pathname.includes('/for-translators/training/')) {
    var script = document.createElement('script');
    script.src = 'https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js';
    script.onload = function () {
      updateVersions({
        en_ta: 'v85',
        en_tw: 'v85',
        en_tn: 'v85',
      });
      console.log('Version updater script loaded and executed for training page.');
    };
    document.head.appendChild(script);
  }
</script>
```

## Development & Deployment

### Setup Development Environment

1. **Clone the repository:**

   ```bash
   git clone https://github.com/unfoldingword/uw-website-resource-version-updater.git
   cd uw-website-resource-version-updater
   ```

2. **Test locally:**
   Open `content.html` or `training.html` in your browser to test the script functionality.

### Making Changes

1. **Edit the script:**

   ```bash
   # Modify version-updater.js with your changes
   vim version-updater.js
   ```

2. **Test your changes:**

   - Open the HTML files in a browser
   - Check the browser console for logs
   - Verify version updates work correctly

3. **Commit and push:**
   ```bash
   git add version-updater.js
   git commit -m "Update version updater functionality"
   git push origin main
   ```

### Deploying to GitHub Pages

1. **Enable GitHub Pages:**

   - Go to your repository settings
   - Navigate to **Pages** section
   - Select **Source**: Deploy from a branch
   - Choose **Branch**: `main` (or `master`)
   - Click **Save**

2. **Your script will be available at:**

   ```
   https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js
   ```

3. **Update websites:**
   Any website linking to your GitHub Pages URL will automatically use the updated script.

### Development Workflow

```bash
# 1. Make changes locally
vim version-updater.js

# 2. Test with local HTML files
open content.html  # or use your preferred browser

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Deploy to GitHub Pages
git push origin main

# 5. Changes are live immediately at:
# https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js
```

## Configuration

### API Endpoint

The script uses the Door43 catalog API:

```javascript
const CATALOG_API_BASE = 'https://git.door43.org/api/v1/catalog/search';
```

### URL Patterns

The script recognizes these Door43 URL patterns:

- Download: `https://git.door43.org/owner/repo/releases/download/version/`
- Releases: `https://git.door43.org/owner/repo/releases/tag/version`
- Preview: `https://preview.door43.org/u/owner/repo/version/`

### Status Text Pattern

Updates version numbers in status text matching: `v[\d\.]+` (e.g., v0.33, v1.2.5)

## Testing

### Browser Console

When the script runs, check the browser console for:

- `Starting version update process for repos: en_tw, en_tn, ...`
- `Fetching catalog data for repos: en_tw, en_tn, ...`
- `Loaded catalog data for X repositories`
- `Updating repo from vX.X to vY.Y`
- `Updated download/release/preview link: ...`
- `Updated status text: ...`

### Example Output

```
Starting version update process for repos: en_tw, en_tn
Fetching catalog data for repos: en_tw, en_tn
Loaded catalog data for 2 repositories
Found version update for en_tw: v84 -> v85
Updating en_tw from v84 to v85
Updated download link: https://git.door43.org/.../v84/... -> https://git.door43.org/.../v85/...
Updated preview link: https://preview.door43.org/.../v84 -> https://preview.door43.org/.../v85
Updated status text: Status: Released – v85
en_tn is already up to date (v84)
Version update process completed
```

### Testing with Local Files

Use the included test files to verify functionality:

```bash
# Comprehensive test suite with multiple scenarios
open test-suite.html

# Test the en_tw repository update
open test-en-tw.html

# Test multiple repositories (content page)
open content.html

# Test training page repositories
open training.html
```

## Quick Reference

### Basic Usage

```html
<script src="version-updater.js"></script>
<script>
  updateVersions({
    en_tw: 'v85',
    en_tn: 'v85',
  });
</script>
```

### Common Repository Arrays

**Content Page:**

```javascript
updateVersions({
  en_obs: 'v9',
  en_tn: 'v85',
  en_ult: 'v85',
  en_ust: 'v85',
  en_tw: 'v85',
  'el-x-koine_ugnt': 'v0.34',
  hbo_uhb: 'v2.1.31',
});
```

**Training Page:**

```javascript
updateVersions({ en_ta: 'v85' });
```

**Custom Selection:**

```javascript
updateVersions({ en_tw: 'v85' }); // Single repository
updateVersions({ en_tw: 'v85', en_tn: 'v85' }); // Multiple repositories
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly with the provided HTML files
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Live Example**: Visit [unfoldingword.org/for-translators/content/](https://unfoldingword.org/for-translators/content/) to see the script in action.
