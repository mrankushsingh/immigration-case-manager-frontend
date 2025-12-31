# Fix: 404 Errors for Assets on Railway

## Problem

After deploying to Railway, you're seeing 404 errors for JavaScript and CSS files:
- `utils-141fa657.js: Failed to load resource: 404`
- `index-c02210d5.js: Failed to load resource: 404`
- `index-4603251c.css: Failed to load resource: 404 (MIME type 'text/html')`

## Root Cause

`vite preview` doesn't always serve static assets correctly on Railway, especially with SPA routing. The asset filenames have content hashes that change with each build, and the server needs to properly serve them.

## Solution

Use `serve` package instead of `vite preview` for production serving. The `serve` package is specifically designed for serving static files and handles SPA routing correctly.

## Changes Made

1. **Updated `railway.json`**: Changed from `vite preview` to `serve dist`
2. **Updated `nixpacks.toml`**: Changed start command to use `serve`
3. **Updated `package.json`**: Added `serve` as devDependency and added serve script
4. **Updated `vite.config.ts`**: Added explicit build output configuration

## Deployment Steps

1. **Commit and push these changes:**
   ```bash
   git add .
   git commit -m "Fix Railway 404 errors: Use serve instead of vite preview"
   git push
   ```

2. **Railway will automatically:**
   - Install dependencies (including `serve`)
   - Build the project (`npm run build`)
   - Start the server with `serve dist -s -l $PORT`

3. **Verify deployment:**
   - Check Railway logs for successful build
   - Visit your Railway URL
   - Check browser console - should see no 404 errors

## How It Works

- `serve dist -s -l $PORT`:
  - `dist`: Directory to serve (Vite build output)
  - `-s`: Single-page application mode (serves index.html for all routes)
  - `-l $PORT`: Listen on Railway's PORT environment variable

## Alternative: If serve doesn't work

If you still see issues, you can also try:

1. **Use a custom server script:**
   ```javascript
   // server.js
   import express from 'express';
   import { fileURLToPath } from 'url';
   import { dirname, join } from 'path';
   
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);
   
   const app = express();
   const port = process.env.PORT || 3000;
   
   app.use(express.static(join(__dirname, 'dist')));
   
   app.get('*', (req, res) => {
     res.sendFile(join(__dirname, 'dist', 'index.html'));
   });
   
   app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });
   ```

2. **Update start command:**
   ```json
   "startCommand": "node server.js"
   ```

## Verification

After deployment, check:
- ✅ No 404 errors in browser console
- ✅ CSS loads correctly (no MIME type errors)
- ✅ JavaScript files load correctly
- ✅ Application works as expected

