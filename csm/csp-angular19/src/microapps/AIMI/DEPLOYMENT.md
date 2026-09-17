# Deployment Guide

This guide explains how to create and deploy a production build of the AI Maturity Index Platform.

## Quick Start

### 1. Create Production Build

```bash
npm run build:prod
```

This command will:

- Build the frontend application
- Copy `server.js` to the `dist` folder
- Create a production-ready `package.json` in the `dist` folder

### 2. Test Locally

```bash
cd dist
npm install
npm start
```

The application will be available at `http://localhost:3000`

## Build Process Details

### What Gets Built

The `build:prod` command creates a complete deployment package in the `dist` folder:

```
dist/
├── index.html          # Main HTML file
├── assets/             # Compiled CSS and JS files
├── favicon.svg         # Application icon
├── server.js           # Express server for serving the app
└── package.json        # Production dependencies (express only)
```

### Build Scripts

- `npm run build` - Standard Vite build
- `npm run build:prod` - Complete production build with server
- `npm run copy-server` - Copy server.js to dist
- `npm run create-prod-package` - Create production package.json
- `npm run start:prod` - Start production server from dist

## Deployment Options

### Option 1: Traditional Server Deployment

1. Run `npm run build:prod`
2. Upload the entire `dist` folder to your server
3. SSH into your server and run:
   ```bash
   cd dist
   npm install
   npm start
   ```

### Option 2: Docker Deployment

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY dist/ .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Cloud Platform Deployment

Most cloud platforms (Heroku, Vercel, Netlify) can deploy directly from the `dist` folder.

## Environment Variables

The server uses these environment variables:

- `PORT` - Server port (default: 3000)

## Production Considerations

1. **Security**: The production build only includes the `express` dependency
2. **Performance**: Assets are optimized and minified
3. **Portability**: The entire application is self-contained in the `dist` folder
4. **Scalability**: The Express server can be easily scaled horizontally

## Troubleshooting

### Build Issues

- Ensure all dependencies are installed: `npm install`
- Clear cache if needed: `rm -rf node_modules && npm install`

### Runtime Issues

- Check if port 3000 is available
- Verify Node.js version (>=18.0.0)
- Check server logs for error messages

## File Changes Summary

### Modified Files:

- `package.json` - Added build scripts
- `server.js` - Updated for dist folder compatibility

### New Files:

- `scripts/createProdPackage.js` - Creates production package.json
- `scripts/README.md` - Build script documentation
- `DEPLOYMENT.md` - This deployment guide

### Impact on Other Functionality:

- **Development workflow**: No impact - `npm run dev` still works as before
- **Testing**: No impact - existing tests continue to work
- **CI/CD**: Can now easily integrate production builds
- **Deployment**: Simplified deployment process with self-contained builds
