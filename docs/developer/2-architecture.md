# Architecture

TA Connect is a browser-based application with a React single-page-application (SPA) interface, a Django REST API, and a SQLite database.

## Technology stack

### Backend

- Django and [Django REST Framework](https://www.django-rest-framework.org/) provide the application and REST API.
- [django-allauth](https://docs.allauth.org/en/latest/) provides session management and ORCiD authentication.
- [SQLite](https://sqlite.org/) stores application data.

### Frontend

- [React](https://react.dev/) and TypeScript implement the user interface.
- [Vite](https://vite.dev/) provides the development server and production build.
- [Tanstack Router](https://tanstack.com/router/latest) provides file-based routing.
- [Tanstack Query](https://tanstack.com/query/latest) loads, caches, and mutates server data.
- [Material UI](https://mui.com/) provides components and styling primitives.

## Repository layout

```text
ta-connect/
├── backend/api/
│   ├── api/                 # Django project settings and root URLs
│   ├── core/                # Domain application
│   │   ├── models/          # Database models
│   │   ├── serializers/     # API serialization and validation
│   │   ├── views/           # API endpoint behavior
│   │   ├── tests/           # Backend tests
│   │   ├── migrations/      # Database schema history
│   │   └── fixtures/        # Lookup and sample data
│   └── manage.py
├── frontend/
│   └── src/
│       ├── api/             # HTTP clients, types, and query definitions
│       ├── components/      # Shared interface components
│       ├── features/        # Feature-specific components and state
│       ├── routes/          # File-based application routes
│       └── utils/           # Shared utilities
├── docs/                    # User and developer documentation
└── .github/workflows/       # Tests and deployment automation
```

## HTTP request flow

The browser loads the built React application. TanStack Router selects a route and its loaders use TanStack Query to retrieve data. Requests to `VITE_API_URL` reach Django under `/api/`; authentication requests to `VITE_BACKEND_URL` reach django-allauth under `/_allauth/` or `/accounts/`.

Django views apply authentication and permission rules, serializers validate and translate data, and models read or write SQLite. The API returns JSON for React Query to cache and render.

The frontend sends cookies with authenticated requests. Django's CORS and CSRF settings therefore need to trust the frontend origin in each environment.

## Domain organization

The backend currently uses one Django application, `core`. Its models represent requests, customers, organizations, labs, programs, owners, experts, role assignments, notes, attachments, closeout forms, and supporting lookup data. Models are separated into individual files and exported from `core/models/__init__.py`.
