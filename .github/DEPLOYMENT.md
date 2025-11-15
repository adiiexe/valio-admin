# GitHub Pages Deployment Guide

This project is configured to deploy to GitHub Pages using GitHub Actions.

## Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Push your code:**
   - The workflow will automatically trigger on pushes to the `main` branch
   - You can also manually trigger it from the Actions tab

3. **Access your site:**
   - After deployment, your site will be available at:
     `https://<your-username>.github.io/<repository-name>/`
   - If your repository is named `valio-admin`, the URL will be:
     `https://<your-username>.github.io/valio-admin/`

## Important Notes

- **Base Path Configuration:** If your repository name is not the root URL, you may need to uncomment and set the `basePath` in `next.config.ts`
- **Static Export:** This project uses static export, so API routes are replaced with static JSON files
- **Build Output:** The build output goes to the `out` directory, which is automatically deployed

## Manual Deployment

If you want to test the build locally:

```bash
npm run build
```

The static files will be in the `out` directory.

