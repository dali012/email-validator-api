# Email Validator API

A robust and scalable API service for validating email addresses built on Cloudflare Workers. This API provides both single and bulk email validation capabilities with comprehensive validation checks.

## Features

- ✅ Single email validation
- ✅ Bulk email validation
- ✅ API key authentication
- ✅ Interactive OpenAPI documentation
- ✅ Comprehensive validation checks (syntax, MX records, disposable domains, etc.)
- ✅ Cloudflare D1 database integration

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (>=18)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Cloudflare account](https://dash.cloudflare.com/sign-up) with Workers enabled

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dali012/email-validator-api.git
   cd email-validator-api
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

### Development

Run the development server:

```bash
pnpm dev
```

This starts a local development server at <http://localhost:8787> with the Cloudflare Workers runtime.

## Deployment

Deploy to Cloudflare Workers:

```bash
pnpm deploy
```

## Cloudflare Workers Configuration

This project uses Cloudflare Workers with the following bindings:

### KV Namespace Bindings

The application uses two KV namespaces:

```json
{
  "kv_namespaces": [{ "binding": "EMAIL_RESULTS", "id": "enter_id_here" }]
}
```

- `EMAIL_RESULTS`: Stores validation results for caching and performance.

### D1 Database Binding

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "email_validator",
      "database_id": "enter_id_here"
    }
  ]
}
```

### Setting Up Bindings

#### Create KV Namespaces

```bash
npx wrangler kv namespace create "EMAIL_RESULTS"
```

#### Create D1 Database

```bash
npx wrangler d1 create email_validator
```

Then update your `wrangler.jsonc` with the IDs returned from these commands.

## API Usage Examples

### Create an API Key

```bash
curl -X POST https://your-api-domain.com/api/create-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Application",
    "email": "developer@example.com",
    "secretKey": "your-secret-password-here"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "apiKey": "ek_1234567890abcdef1234567890abcdef",
    "name": "My Application",
    "expiresAt": "2026-03-19T00:00:00.000Z"
  }
}
```

### Validate a Single Email

```bash
curl -X GET "https://your-api-domain.com/api/validate?email=test@example.com" \
  -H "x-api-key: ek_1234567890abcdef1234567890abcdef"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "is_valid": true,
    "score": 0.95,
    "checks": {
      "syntax": true,
      "mx_records": true,
      "disposable": false,
      "role_account": false,
      "free_provider": true
    }
  }
}
```

### Validate Multiple Emails (Bulk)

```bash
curl -X POST https://your-api-domain.com/api/validate/bulk \
  -H "Content-Type: application/json" \
  -H "x-api-key: ek_1234567890abcdef1234567890abcdef" \
  -d '{ "emails": ["valid@example.com", "invalid@", "info@example.org"] }'
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "email": "valid@example.com",
      "is_valid": true,
      "score": 0.95,
      "checks": {
        "syntax": true,
        "mx_records": true,
        "disposable": false,
        "role_account": false,
        "free_provider": true
      }
    },
    {
      "email": "invalid@",
      "is_valid": false,
      "score": 0.0,
      "checks": {
        "syntax": false,
        "mx_records": false,
        "disposable": false,
        "role_account": false,
        "free_provider": false
      }
    },
    {
      "email": "info@example.org",
      "is_valid": true,
      "score": 0.85,
      "checks": {
        "syntax": true,
        "mx_records": true,
        "disposable": false,
        "role_account": true,
        "free_provider": false
      }
    }
  ]
}
```

## Environment Variables

| Variable                 | Description                                      | Required | Default |
| ------------------------ | ------------------------------------------------ | -------- | ------- |
| SECRET_KEY               | Secret key for API key generation and validation | Yes      | -       |
| API_KEY_EXPIRATION_DAYS  | Number of days until API keys expire             | No       | 365     |
| CACHE_EXPIRATION_SECONDS | Time in seconds to cache email validation        | No       | 86400   |
| RATE_LIMIT_REQUESTS      | Maximum requests per minute for an API key       | No       | 60      |
| ADMIN_API_KEY            | Special API key for admin operations             | No       | -       |

For local development, set these in `.dev.vars`:

```bash
ADMIN_SECRET_KEY=your-admin-key-here
```

## Project Structure

```text
/
├── migrations/              # D1 database migration files
│   └── schema.sql           # Database schema definition
├── src/
│   ├── constants/           # Application constants
│   ├── endpoints/           # API route handlers
│   ├── middlewares/         # HTTP middleware functions
│   ├── utils/               # Utility functions
│   └── index.ts             # Application entry point
├── .env.example             # Example environment variables
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── wrangler.jsonc           # Cloudflare Workers config
└── README.md                # Project documentation
```

## Contributing Guidelines

1. **Fork** the repository.
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Commit your changes**: `git commit -m "Add feature XYZ"`
4. **Push to your branch**: `git push origin feature/your-feature-name`
5. **Open a pull request**.

## Code Style

- Uses **ESLint** for linting and **Prettier** for formatting.
- Run the linter: `pnpm lint`
- Format code: `pnpm format`

## License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.
