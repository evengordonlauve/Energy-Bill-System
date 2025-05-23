# Energy-Bill-System

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
