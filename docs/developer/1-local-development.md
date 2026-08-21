# Local development

TA Connect runs as two local services: a Django REST API and a Vite development server for the React UI.

## Prerequisites

- [Python 3.12.9 or newer](https://www.python.org/downloads/)
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [Node.js 24.9.0 or newer](https://nodejs.org/en/download)
- Git

Run all commands from the repository root unless a step says otherwise.

## Backend setup

Clone the GitHub repository to your local machine (preferably via SSH):

```
git clone git@github.com:lbnl-emp-ta/ta-connect.git
```

This should create your top-level repository root `ta-connect/`:

```
cd ta-connect
```

Create the virtual environment and install the locked Python dependencies:

```sh
cd backend/api
uv sync
```

Obtain the development environment configuration from a teammate and save it as `backend/api/.env`. This file contains sensitive information and must not be committed.

At minimum, local settings need a Django `SECRET_KEY`. Generate a unique value with:

```sh
uv run python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Replace the `SECRET_KEY` in `.env` with the generated value. See [Authentication](5-authentication.md) for the ORCiD settings and [Data management](7-data-management.md) for database options.

Prepare the database and create an administrator account:

```sh
uv run python manage.py migrate
uv run python manage.py createsuperuser
```

The superuser command asks for an email and password. Password characters are not displayed while you type.

Start the API:

```sh
uv run python manage.py runserver
```

The API is available at <http://127.0.0.1:8000/api/> and Django admin at <http://127.0.0.1:8000/admin/>.

## Frontend setup

Open a second terminal at the repository root:

```sh
cd frontend
npm install
npm run dev
```

The interface is available at <http://127.0.0.1:5173/>.

The frontend reads these values from `frontend/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
VITE_BACKEND_URL=http://127.0.0.1:8000
```

`VITE_API_URL` is used for application API calls. `VITE_BACKEND_URL` is used for the allauth session and login endpoints.

## Verify the setup

1. Open Django admin and sign in with the superuser account.
2. Open the frontend in the same browser.
3. Confirm the frontend recognizes the authenticated session.

To exercise the normal OAuth flow instead, complete the [local ORCiD setup](5-authentication.md#local-orcid-setup).
