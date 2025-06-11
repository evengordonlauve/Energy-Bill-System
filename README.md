# Energy-Bill-System

This repository now provides a very small Next.js skeleton with placeholder pages for a Dashboard, Customers, Cost Calculations, Checklists and Administration. The site is automatically deployed to Azure via GitHub Actions.

## Recent Changes

* Removed the unused `Figma design` prototype directory.
* Dropped `autoprefixer` and the custom `postcss.config.js` since Next.js already handles vendor prefixing.
* Added an admin-only checklist tool to create new checklists stored in localStorage.

## Setup

1. Install dependencies (requires network access). This will also install the
   TypeScript dev dependencies specified in `package.json`:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the placeholder page.

### ThingsBoard integration

The app can load customers and users from a ThingsBoard instance. Copy
`.env.local.example` to `.env.local` and fill in your ThingsBoard client ID,
client secret and API URL:

```bash
cp .env.local.example .env.local
# edit .env.local
```

These environment variables are read by the Next.js API routes to authenticate
against ThingsBoard using the client credentials flow.

## Continuous Deployment

The repository includes a GitHub Actions workflow that builds and deploys the
application to an Azure Web App named `acronenergysystemtools` whenever changes
are pushed to the `main` branch. After the deployment, Azure automatically runs
the `npm start` command defined in `package.json` to launch the Next.js server.

Accepted pull requests that merge into `main` will therefore trigger a new build
and deployment to the production Web App.
