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

1. **Scans for toggle blocks** with `.wp-block-obb-toggle-block` class
2. **Extracts repository information** from Door43 URLs within each block
3. **Queries the Door43 catalog API** to get the latest version: `https://qa.door43.org/api/v1/catalog/search?owner=X&repo=Y`
4. **Compares versions** and updates if a newer version is available
5. **Updates all relevant links and text** with the new version number
6. **Converts relative links** to absolute unfoldingword.org URLs

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
```

### Option 2: Any Website

Add the script tag to your HTML head or before the closing `</body>` tag:

```html
<script src="https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js"></script>
```

### Option 3: Conditional Loading

Load only on specific pages:

```html
<script>
  if (window.location.pathname.includes('/for-translators/content/') || window.location.pathname.includes('/for-translators/training/')) {
    var script = document.createElement('script');
    script.src = 'https://unfoldingword.github.io/uw-website-resource-version-updater/version-updater.js';
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
const CATALOG_API_BASE = 'https://qa.door43.org/api/v1/catalog/search';
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

- `Starting version update process...`
- `Found X toggle blocks to process`
- `Updating owner/repo from vX.X to vY.Y`
- `Updated download/release/preview link: ...`
- `Updated status text: ...`

### Example Output

```
Starting version update process...
Found 25 toggle blocks to process
Updating unfoldingWord/el-x-koine_ugnt from v0.33 to v0.34
Updated download link: https://git.door43.org/.../v0.33/... -> https://git.door43.org/.../v0.34/...
Updated status text: Status: In Progress – v0.34
Version update process completed
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
