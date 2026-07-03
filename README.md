# BattleFace Code Challenge

Laravel API and Angular Material client for the quotation challenge.

## Structure

- `backend/` - Laravel API exposing auth and `POST /quotation`.
- `frontend/` - Angular Material form that calls the API.
- `deploy/docker/` - production-oriented Dockerfiles for backend and frontend.
- `deploy/chart/` - Helm chart for backend, frontend, and Postgres.

## Run With Docker

```bash
export APP_KEY="$(docker run --rm composer:2 php -r 'echo "base64:".base64_encode(random_bytes(32));')"
export DB_PASSWORD="$(openssl rand -base64 24)"
export QUOTATION_JWT_SECRET="$(openssl rand -base64 32)"
export QUOTATION_DEMO_PASSWORD="choose-a-local-demo-password"
docker compose up
```

- Frontend: http://localhost:4200
- Backend: http://localhost:8001
- Postgres: internal Compose service `postgres:5432`

Use the configured demo credentials in the Angular app:

```text
demo@battleface.test / $QUOTATION_DEMO_PASSWORD
```

The login endpoint verifies the user from Postgres, signs a JWT, and stores it in an HTTP-only cookie. Logout clears that cookie.

## API Example

```bash
curl -X POST http://localhost:8001/quotation \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"age":"28,35","currency_id":"EUR","start_date":"2026-10-01","end_date":"2026-10-30"}'
```

To create `cookies.txt` first:

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"demo@battleface.test","password":"'"$QUOTATION_DEMO_PASSWORD"'"}'
```

Expected total for the worked example is `117.00`.

## Deploy Images

Build the backend and frontend images from the repository root:

```bash
docker build -f deploy/docker/backend/Dockerfile -t battleface-backend:latest .
docker build -f deploy/docker/frontend/Dockerfile -t battleface-frontend:latest .
```

## Helm Chart

Render the chart:

```bash
helm template battleface deploy/chart \
  --set backend.appKey="$APP_KEY" \
  --set backend.jwtSecret="$QUOTATION_JWT_SECRET" \
  --set backend.demoPassword="$QUOTATION_DEMO_PASSWORD" \
  --set postgres.password="$DB_PASSWORD"
```

Install with ingress enabled:

```bash
helm upgrade --install battleface deploy/chart \
  --set ingress.enabled=true \
  --set ingress.host=battleface.local \
  --set publicUrl=http://battleface.local \
  --set backend.appKey="$APP_KEY" \
  --set backend.jwtSecret="$QUOTATION_JWT_SECRET" \
  --set backend.demoPassword="$QUOTATION_DEMO_PASSWORD" \
  --set postgres.password="$DB_PASSWORD"
```

## Local Commands

If PHP/Composer and Node are installed locally:

```bash
cd backend
composer install
php artisan migrate --seed
./vendor/bin/phpunit
php artisan serve --port=8001
```

```bash
cd frontend
npm install
npm run build
npm start
```
