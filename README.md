# Energy-Bill-System
This project contains a minimal Next.js application using PostgreSQL for user data and Tailwind CSS. Users can register, log in with email and password, and request password reset tokens.

## Setup

1. Install dependencies (requires network access):
   ```bash
   npm install
   ```
2. Create a PostgreSQL database and add your connection details to a `.env.local`
main
   DB_USER=youruser
   DB_PASS=yourpass
   DB_HOST=localhost
   DB_NAME=energy
   DB_PORT=5432
   ```

   The provided SQL schema in `sql/schema.sql` can be used to create the required tables:
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f sql/schema.sql
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

`pages/AdminPanel.js` is protected. The page verifies the logged-in user's groups from the session and only allows access to members of the `admin` group.
