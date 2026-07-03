# Engineering Decisions

[Back to README](../README.md) | [Architecture](architecture.md) | [Backend](backend.md) | [Frontend](frontend.md) | [Testing](testing.md) | [Docker](docker.md)

This challenge is intentionally small, so the code favors explicit framework-native pieces over a deeper architecture that would not pay for itself at this size.

## Design Goals

- Keep the quotation formula isolated and directly testable.
- Keep authentication realistic enough for a deployed assessment without building a full user-management product.
- Make local review straightforward with Docker Compose and generated secrets.
- Keep deployment assets close to the app so the deployed behavior is reproducible.

## Backend Choices

The backend uses Laravel request validation, controllers, middleware, and a small service class:

- `QuotationRequest` owns input validation and age parsing.
- `QuotationCalculator` owns the business formula and age-band rules.
- `EnsureValidJwtToken` keeps auth checks outside the controller.
- `AuthController` issues an HTTP-only JWT cookie after checking the seeded PostgreSQL user.

This is enough separation for the current endpoint surface while avoiding repository/use-case layers that would mainly add indirection.

## Authentication

The original fake login concept is implemented with a real persisted demo user. The password is supplied by environment variable and seeded into PostgreSQL, so the app can be reviewed like a real protected web flow without committed credentials.

JWT is stored in an HTTP-only cookie because the Angular client is browser-first. Bearer token support remains in the middleware for direct API tests and cURL debugging.

## Quotation Rules

Currency rates are configuration-driven rather than hard-coded only inside the service. That keeps the challenge's fixed rates easy to inspect and override in Compose or Helm without adding an external exchange-rate dependency.

Unsupported ages become validation errors rather than generic server errors. The response stays useful for both API clients and the Angular form.

## Frontend Choices

The frontend uses Angular standalone components and Angular Material:

- `App` owns the small workflow state.
- `LoginForm` and `QuotationForm` remain presentation/form components.
- API services isolate URLs, `withCredentials`, request DTOs, and error extraction.
- `dateRangeValidator` gives immediate client-side feedback for an API rule that is easy to mirror.

A global state library and Angular Router are intentionally not added. The app has one authenticated workflow and no meaningful cross-page state.

## Deployment Choices

Deployment assets are grouped under `deploy/`:

- `deploy/docker`: backend and frontend production image builds.
- `deploy/chart`: Kubernetes resources and Traefik routing.

The chart supports chart-created secrets for simple installs and existing secrets for shared environments. Traefik Basic Auth is handled at the ingress layer as an assessment-environment protection, separate from the app's demo login.

## Tradeoffs

- The backend container uses `php artisan serve`, which is acceptable for this assessment but would normally be replaced with PHP-FPM plus a web server for a long-lived production service.
- Startup migrations and seeders are convenient for local/assessment deployment. Mature production deployments should use explicit migration jobs.
- Currency rates are static configuration. A production quotation system would need versioned rating tables or an external rating service.
- The frontend stores a non-sensitive `battleface-authenticated` flag in local storage only to decide which screen to show after reload. The server-side JWT cookie remains the source of truth; a `401` clears the UI state.
