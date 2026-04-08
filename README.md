# TA Connect

## What is TA Connect?

**TA Connect** is a technical assistance tracking and reporting platform that will enable partnered National Laboratories (e.g. ANL, LBNL, NLR, PNNL), each hosting various TA programs, to coordinate their efforts. TA Connect will also enable funders and partners to view TA efforts through various reports and dashboards.

## Development

TA Connect is a full-stack web application built with [Django REST Framework](https://www.django-rest-framework.org/) on the backend and [React](https://react.dev/) on the frontend. See a more detailed tech stack below:

**Backend**

- [Django REST Framework](https://www.django-rest-framework.org/)
- [django-allauth](https://docs.allauth.org/en/latest/)
- [SQLite](https://sqlite.org/)

**Frontend**

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tanstack Router](https://tanstack.com/router/latest)
- [Tanstack Query](https://tanstack.com/query/latest)
- [Material UI](https://mui.com/)

### Setting up a Local Development Environment

#### Prerequisites

- [Node.js (24.9.0+)](https://nodejs.org/en/download)
- [Python (3.12.9+)](https://www.python.org/downloads/)

#### Running the Backend

Open a terminal at the root of the project and navigate to the backend api directory:

```
cd backend/api
```

Create a new virtual environment called `.venv`:

```
python3 -m venv .venv
```

Activate your virtual environment:

```
source .venv/bin/activate
```

Install the dependencies:

```
pip install -r requirements.txt
```

(Optional) Retrieve a database file (`db.sqlite3`) from a teammate and place it in `backend/api`.

Run database migrations:

```
python manage.py migrate
```

Create a local superuser:

```
python manage.py createsuperuser
```

The terminal will prompt you for the following details:

- Username: A unique name for the admin user (e.g., admin).
- Email address: An optional email for the account.
- Password: A secure password. Note that characters will not appear as you type for security reasons.
- Password (again): Re-enter the password to confirm.

Obtain a copy of a `.env` file from a teammate and save it in `backend/api/.env`. This file will contain sensitive information. Do not ever commit this file to GitHub. It is currently ignored by `backend/api/.gitignore`.

Replace the `SECRET_KEY` value in `.env` with a new string generated with the follow command:

```
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Run the backend server:

```
python manage.py runserver
```

The backend should now be running locally at http://127.0.0.1:8000/. You should be able to access the Django Admin page at http://127.0.0.1:8000/admin.

#### Changing the Database Models (Running Migrations)

If you make a change to any of the Django model files (`api/core/models`), then you will need to create new migration files and then run them.

```
python manage.py makemigrations
python manage.py migrate
```

#### Running the Frontend

Open a terminal at the root of the project and navigate to the frontend directory:

```
cd frontend
```

Install the dependencies:

```
npm install
```

Run the local frontend server:

```
npm run dev
```

The frontend UI should be running at http://127.0.0.1:5173.

#### Authentication

If you followed the step for creating a superuser, you should be able to log in by navigating to http://127.0.0.1:8000/admin and entering your username and password. After logging in from the admin, you should be able to see yourself as "logged in" from the frontend UI at http://127.0.0.1:5173.

The main authentication mechanism for TA Connect is handled through OAuth with ORCiD. If you don't have an ORCiD account, you can create one: [https://orcid.org/](https://orcid.org/).

Once you have an ORCiD account and have logged in on their website, you will need to generate a new ORCiD client app by navigating to the [ORCiD Developer Tools](https://orcid.org/developer-tools) page. From this page, follow the steps to fill out your application details (the values are not important but should indicate TA Connect in some way) and then generate a Client ID and Client Secret. Note that this client app is only used for local development. The production client app is registered under a team lead's ORCiD account.

Once you have your Client ID and Client Secret, replace the values in `backend.api/.env` for `TACONNECT_ORCID_CLIENT_ID` and `TACONNECT_ORCID_CLIENT_SECRET`.

Now, the next time you run the backend and frontend, you should be able to click the "Continue with ORCID" button in the UI and authenticate with your ORCiD credentials.
