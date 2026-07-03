# BattleFace Code Challenge

Full-stack travel insurance quotation challenge built with a Laravel API and an Angular Material client.

The application supports demo-user authentication, JWT cookie sessions, quotation calculation for one or more travellers, currency conversion, validation feedback, local Docker review, and Kubernetes deployment assets.

## What Is Included

- Demo login backed by PostgreSQL-seeded user credentials.
- HTTP-only JWT cookie authentication, with bearer-token support for direct API tests.
- Quotation calculation from traveller ages, inclusive travel dates, and selected currency.
- Angular Material login and quotation workflow.
- Backend feature/unit tests and frontend Vitest service/validator tests.
- Docker Compose for local full-stack review.
- Production-oriented backend/frontend Dockerfiles and a Helm chart.
- GitHub Actions workflow that builds GHCR images and pins Helm values to the commit SHA.

## Stack

- Backend: Laravel 13, PHP 8.4 container runtime, PostgreSQL, `firebase/php-jwt`.
- Frontend: Angular 20, TypeScript, Angular Material, RxJS.
- Tests: PHPUnit for backend, Vitest for frontend.
- Deployment: Docker, GHCR, Helm, Traefik `IngressRoute`.

## Architecture Summary

The backend keeps the HTTP layer small:

- `routes/api.php` exposes `POST /auth/login`, `POST /auth/logout`, and protected `POST /quotation`.
- `AuthController` validates the demo user and issues the JWT cookie.
- `EnsureValidJwtToken` accepts either the HTTP-only cookie or an `Authorization: Bearer` token.
- `QuotationRequest` owns request validation and age parsing.
- `QuotationCalculator` owns the age-band, trip-length, and currency-rate calculation.
- `DatabaseSeeder` creates the configured demo user from environment-supplied credentials.

The frontend keeps API access and form presentation separate:

- `AuthApiService` handles login/logout calls.
- `QuotationApiService` handles quote creation and API error message extraction.
- `LoginForm`, `QuotationForm`, and `QuoteResult` render the primary workflow.
- `dateRangeValidator` mirrors the API's end-date-after-start-date rule in the UI.

## Project Layout

- `backend/`: Laravel API, migrations, seeders, tests, and configuration.
- `frontend/`: Angular Material client and Vitest tests.
- `deploy/docker/`: production-style backend/frontend Dockerfiles and nginx config.
- `deploy/chart/`: Helm chart for backend, frontend, Postgres, secrets, and Traefik ingress.
- `docker-compose.yml`: local full-stack review environment.
- `docs/`: architecture, engineering decisions, backend, frontend, testing, and deployment notes.

## Quick Start

Prerequisites:

- Docker and Docker Compose.
- `openssl` for local secret generation.

```bash
export APP_KEY="$(docker run --rm composer:2 php -r 'echo "base64:".base64_encode(random_bytes(32));')"
export DB_PASSWORD="$(openssl rand -base64 24)"
export QUOTATION_JWT_SECRET="$(openssl rand -base64 32)"
export QUOTATION_DEMO_PASSWORD="choose-a-local-demo-password"
docker compose up
```

Endpoints:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8001`
- Postgres: internal Compose service `postgres:5432`

Use the configured demo credentials in the Angular app:

```text
demo@battleface.test / $QUOTATION_DEMO_PASSWORD
```

## API Example

Create a login cookie:

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"demo@battleface.test","password":"'"$QUOTATION_DEMO_PASSWORD"'"}'
```

Request a quotation:

```bash
curl -X POST http://localhost:8001/quotation \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"age":"28,35","currency_id":"EUR","start_date":"2026-10-01","end_date":"2026-10-30"}'
```

Expected total for the worked example is `117.00`.

## Verification

Run backend tests without host PHP:

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD/backend":/app -w /app composer:2 ./vendor/bin/phpunit
```

Run frontend tests and build:

```bash
cd frontend
npm install
npm test
npm run build
```

## Deployment

Build images from the repository root:

```bash
docker build -f deploy/docker/backend/Dockerfile -t battleface-backend:latest .
docker build -f deploy/docker/frontend/Dockerfile -t battleface-frontend:latest .
```

Render the Helm chart:

```bash
helm template battleface deploy/chart \
  --set backend.appKey="$APP_KEY" \
  --set backend.jwtSecret="$QUOTATION_JWT_SECRET" \
  --set backend.demoPassword="$QUOTATION_DEMO_PASSWORD" \
  --set postgres.password="$DB_PASSWORD"
```

Production-style deployment uses GHCR images, chart-managed runtime configuration, Traefik Basic Auth, and explicit Kubernetes secrets for credentials.

## Documentation

- [Architecture](docs/architecture.md)
- [Engineering Decisions](docs/decisions.md)
- [Backend Development](docs/backend.md)
- [Frontend Development](docs/frontend.md)
- [Testing](docs/testing.md)
- [Docker Deployment](docs/docker.md)
