# Git Backlog Management System

A Node.js Express application with comprehensive pre-commit hooks for code quality, testing, and security.

## Features

- 🚀 Express.js REST API
- 🧹 Code linting with ESLint
- 🎨 Code formatting with Prettier
- 🧪 Unit and integration testing with Jest
- 📊 Code coverage reporting
- 🗄️ Database migration scripts
- 🛡️ Static Application Security Testing (SAST)
- 🪝 Pre-commit hooks for quality gates

## Quick Start

1. **Setup the project:**
   ```bash
   ./setup.sh
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

## Pre-commit Pipeline

Every commit automatically runs:

1. **Code Linting** - ESLint checks for code quality
2. **Unit Tests** - Fast isolated tests
3. **Coverage Check** - Ensures 80% code coverage
4. **Database Migrations** - Runs pending schema changes
5. **Security Scan** - SAST analysis for vulnerabilities
6. **Integration Tests** - End-to-end API testing

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/backlog` - List backlog items
- `POST /api/backlog` - Create new backlog item

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm test` - Run all tests with coverage
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run db:migrate` - Run database migrations
- `npm run sast` - Run security analysis
- `npm run precommit` - Run complete pre-commit pipeline

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=git_backlog
DB_USER=postgres
DB_PASSWORD=password
```

### Code Quality

- **ESLint**: Configured with recommended rules
- **Prettier**: Enforces consistent code formatting
- **Jest**: Testing framework with coverage thresholds (80%)

### Security

The SAST scanner checks for:
- Hardcoded passwords and API keys
- Dangerous functions (eval, innerHTML)
- Console.log statements in production
- Environment variable usage

## Project Structure

```
git-backlog/
├── src/
│   └── app.js              # Express application
├── tests/
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── scripts/
│   ├── database.js         # Database migration script
│   └── sast.js            # Security scanning script
├── migrations/             # SQL migration files
├── .git/hooks/
│   └── pre-commit         # Git pre-commit hook
├── .husky/
│   └── pre-commit         # Husky pre-commit hook
├── package.json
├── .eslintrc.js
├── .prettierrc
├── .env.example
└── setup.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit (pre-commit hooks will run automatically)
5. Push and create a pull request

The pre-commit hooks ensure code quality and prevent broken commits from entering the repository.

## License

MIT License
