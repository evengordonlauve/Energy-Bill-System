# Energy-Bill-System
This project contains a minimal Next.js application with Firebase Authentication and Tailwind CSS. Users can register, log in with email and password, and request password reset emails.

## Setup

1. Install dependencies (requires network access):
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. Run the development server:
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

`pages/AdminPanel.js` is protected. The page checks a cookie named `role` and only allows access when its value is `developer`. Other users are redirected to the front page.
