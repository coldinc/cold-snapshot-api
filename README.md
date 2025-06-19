# Cold Snapshot API

Cold Snapshot API provides serverless endpoints for managing snapshots, contacts, log entries and threads stored in Airtable. The project is written in TypeScript and is designed to deploy on [Vercel](https://vercel.com).

## Installation

1. Install Node.js 20.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in your Airtable credentials.

## Development

Useful npm scripts defined in `package.json`:

- `npm run dev` – compile source in watch mode via **tsup**.
- `npm run lint` – check code with ESLint.
- `npm run lint:fix` – automatically fix lint issues.
- `npm run format` – format files with Prettier.
- `npm run format:check` – verify formatting without modifying files.
- `npm run generate:fieldmap` – generate Airtable field mapping helpers and JSON Schema files.
- `npm test` – run the Jest unit tests.

## Testing

Run all unit tests with:

```bash
npm test
```

## Deployment

The repository includes a `vercel.json` configuration. Deploy the API to Vercel using the Vercel CLI or by connecting this repository to a Vercel project:

```bash
vercel deploy
```

Vercel will build the functions found in the `api/` directory and expose them as serverless endpoints.
