# Energy-Bill-System

This repository now provides a very small Next.js skeleton with placeholder pages for a Dashboard, Customers, Cost Calculations, Checklists and Administration. The site is automatically deployed to Azure via GitHub Actions.

## Setup

1. Install dependencies (requires network access):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the placeholder page.

## Continuous Deployment

The repository includes a GitHub Actions workflow that builds and deploys the
application to an Azure Web App named `acronenergysystemtools` whenever changes
are pushed to the `main` branch. After the deployment, Azure automatically runs
the `npm start` command defined in `package.json` to launch the Next.js server.

Accepted pull requests that merge into `main` will therefore trigger a new build
and deployment to the production Web App.
