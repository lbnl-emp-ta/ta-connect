# Testing and quality

## Backend tests

Backend tests use pytest and pytest-django. From `backend/api`, activate the virtual environment and run the full suite:

```sh
pytest
```

Run one file:

```sh
pytest core/tests/endpoints/test_request.py
```

Run one test method:

```sh
pytest core/tests/endpoints/test_request.py::TestRequestDetailViewEndpoint::test_request_detail_get_view_should_succeed
```

Tests are organized by concern under `core/tests/endpoints`, `core/tests/models`, and `core/tests/serializers`. Add coverage at the layer where behavior changes; endpoint tests should cover relevant authentication and permission cases.

The GitHub Actions backend workflow runs migrations and the complete pytest suite on every push.

## Frontend checks

From `frontend`, run:

```sh
npm run lint
npm run build
```

Linting uses Oxlint. The build runs the TypeScript compiler and Vite, catching type errors and production bundling failures.

Format frontend files with:

```sh
npm run format
```

Use `npm run format:check` to check formatting without changing files.

## Before opening a pull request

- Apply and review any new migrations.
- Run the backend tests for backend changes.
- Run frontend lint and build checks for frontend changes.
- Update user or developer documentation when behavior or setup changes.
- Confirm that no `.env`, credentials, local database, or sensitive uploaded data is staged.
