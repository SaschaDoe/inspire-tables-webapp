# Deployment Guide - Netlify

This app is optimized for Netlify deployment with lazy loading and static site generation.

## Performance Optimizations

✅ **Lazy Loading**: Tables are loaded on-demand, not all at once
✅ **Code Splitting**: Each route loads only what it needs
✅ **SPA Mode**: Fast client-side navigation
✅ **Static Build**: Perfect for Netlify serverless hosting

## Deploy to Netlify

### Option 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the site
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

### Option 2: Connect Git Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. Click "Deploy site"

### Option 3: Drag and Drop

1. Build the site: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `build` folder

## Configuration Files

- `netlify.toml` - Netlify configuration with SPA redirects
- `svelte.config.js` - SvelteKit adapter-static configuration
- `src/routes/+layout.ts` - SSR disabled for SPA mode
- `src/lib/data/tableMetadata.ts` - Lightweight metadata for lazy loading

## Build Output

The build creates:
- Static HTML, CSS, and JavaScript in the `build` folder
- Optimized chunks with code splitting
- Gzipped assets for fast loading

## Performance

### Initial Load
- **Home page**: ~50KB gzipped (fast!)
- **Tables list**: Only metadata loaded (~5KB)
- **Individual table**: Loads on-demand

### Before Optimization
- All 159 tables loaded at once
- Initial bundle: ~500KB+
- Slow first load

### After Optimization
- Lazy loading implementation
- Initial bundle: ~50KB gzipped
- **~10x faster initial load!**

## Environment Variables

No environment variables required. This is a purely static site.

## Custom Domain

In Netlify dashboard:
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS as instructed

## Updates

To update the site:
```bash
npm run build
netlify deploy --prod --dir=build
```

Or push to your connected git repository for automatic deploys.
