# BattleFace Code Challenge Guide

This is a small monorepo for the BattleFace coding challenge.

## Layout

- `backend/` contains the Laravel API.
- `frontend/` contains the Angular Material client.
- `docker-compose.yml` runs both apps for local review.
- `deploy/docker/` contains backend/frontend Dockerfiles.
- `deploy/chart/` contains the Helm chart.

## Backend

- Main endpoint: `POST /quotation`.
- Auth: fake `POST /auth/login` issues a JWT cookie; `Authorization: Bearer <jwt>` also works for direct API tests.
- Login users are stored in Postgres. The demo user is seeded by `DatabaseSeeder`.
- `APP_KEY`, `DB_PASSWORD`, `QUOTATION_JWT_SECRET`, and `QUOTATION_DEMO_PASSWORD` must be supplied explicitly for Docker Compose and Helm; do not add committed fallback secrets.
- Demo email defaults to `demo@battleface.test`, but the password must come from `QUOTATION_DEMO_PASSWORD`.
- Run tests without host PHP:

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD/backend":/app -w /app composer:2 php artisan test
```

If there is no local `.env`, prefer the direct PHPUnit runner to avoid Laravel's `artisan test` wrapper warning about the missing file:

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD/backend":/app -w /app composer:2 ./vendor/bin/phpunit
```

## Frontend

- Angular is pinned to v20 because the host Node runtime is v20.19.5 and newer Angular CLI releases require Node 22+.
- Build:

```bash
cd frontend
npm run build
```

## Full Stack

Run both services:

```bash
docker compose up
```

The Docker Compose backend port is `8001` because `8000` is commonly occupied in this workspace.

## Deployment

- Production-style containers are built from `deploy/docker/backend/Dockerfile` and `deploy/docker/frontend/Dockerfile`.
- `.github/workflows/container.yml` publishes backend and frontend images to GHCR and pins `deploy/chart/values.yaml` image tags to the commit SHA, matching the PTL assessment deployment flow.
- The Helm chart in `deploy/chart/` targets Traefik `IngressRoute`, optional basic auth middleware, a dedicated namespace, GHCR image pull secrets, and an in-cluster Postgres deployment.
- The static frontend container serves Nginx on port `8080` with `/health`; the chart exposes it through a service on port `80`.
- The app keeps API calls same-origin. Traefik routes `/auth`, `/quotation`, and `/up` to the backend, and all other paths to the frontend.

- PostgreSQL replicas use `postgres.replicaCount`. To suspend all workloads, set backend/frontend/postgres replicaCount to 0 while keeping postgres.enabled=true so the PVC is retained.
