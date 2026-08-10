# Build Scripts

This directory contains scripts for creating production builds of the AI Maturity Index Platform.

## Build Process

### 1. Development Build

```bash
npm run build
```

This creates a standard Vite build in the `dist` folder.

### 2. Production Build

```bash
npm run build:prod
```

This creates a complete production-ready build that includes:

- Frontend build (dist folder)
- Server.js file copied to dist
- Production package.json with minimal dependencies
- Ready for deployment

## Deployment

After running `npm run build:prod`, you can deploy the application:

1. **Local Testing:**

   ```bash
   cd dist
   npm install
   npm start
   ```

2. **Production Deployment:**
   - Upload the entire `dist` folder to your server
   - Run `npm install` in the dist directory
   - Start with `npm start` or `node server.js`

## Build Scripts Breakdown

- `build:prod`: Main production build command
- `copy-server`: Copies server.js to dist folder
- `create-prod-package`: Creates a minimal package.json for production
- `start:prod`: Starts the production server from dist folder

## File Structure After Build

```
dist/
├── index.html
├── assets/
├── server.js
└── package.json (production version)
```

The production package.json only includes the `express` dependency needed to run the server.
