# Energy-Bill-System
This project contains a minimal Next.js application using PostgreSQL for user data and Tailwind CSS. Users can register, log in with email and password, and request password reset tokens.

## Setup

1. Install dependencies (requires network access):
   ```bash
   npm install
   ```
2. Create a PostgreSQL database and add your connection details to a `.env.local`
   ```env
   AZURE_POSTGRESQL_USER=youruser
   AZURE_POSTGRESQL_PASSWORD=yourpass
   AZURE_POSTGRESQL_HOST=localhost
   AZURE_POSTGRESQL_PORT=5432
   AZURE_POSTGRESQL_DATABASE=energy
   AZURE_POSTGRESQL_SSL=true
   ```

   The provided SQL schema in `sql/schema.sql` can be used to create the required tables:
   ```bash
   psql -h $AZURE_POSTGRESQL_HOST -U $AZURE_POSTGRESQL_USER -d $AZURE_POSTGRESQL_DATABASE -f sql/schema.sql
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
