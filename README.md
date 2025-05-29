#The Pop Guide

A platform for tracking, valuing, and managing Funko Pop collections, with Pro features and retailer onboarding.

## Local Development

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the dev server:**
   ```sh
   npm run dev
   ```
   The app will run on [http://localhost:8080](http://localhost:8080) (or the next available port).

## Favicon & Manifest CORS (BunnyCDN)

If you use a CDN (like BunnyCDN) to serve your favicon and manifest, you must set the correct CORS headers to avoid browser errors:

### BunnyCDN: Set CORS Headers

1. Log in to your BunnyCDN dashboard.
2. Go to your **Pull Zone** (serving your favicon/manifest).
3. In the left menu, select **Edge Rules**.
4. Click **Add Edge Rule**.
5. Set up the rule:
   - **Trigger:** `Request URL`
   - **Pattern:** `/02_the_pop_guide/Favicon/*` (or `*` for all files)
   - **Action:** `Add Header`
   - **Header Name:** `Access-Control-Allow-Origin`
   - **Header Value:** `*`
6. Save the rule.
7. Purge the CDN cache for affected files.
8. Hard refresh your browser.

This ensures your manifest and favicon load without CORS errors.

## Project Structure

- `src/` — React app source code
- `public/` — Static assets (favicons, manifest, etc.)

## Support
For issues or questions, open an issue or contact the maintainer.
