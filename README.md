# Energy-Bill-System
This project contains a minimal Next.js application using a simple JSON file for user data and Tailwind CSS. Users can register, log in with email and password, and request password reset tokens.

## Setup

1. Install dependencies (requires network access):
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the login page.

This project now includes a minimal Next.js setup.

## Development

Install dependencies (requires network access):

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

## AdminPanel

`pages/AdminPanel.js` is protected. The page verifies the logged-in user's groups from the session and only allows access to members of the `admin` group.
