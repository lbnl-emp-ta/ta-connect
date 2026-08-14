# Backend development

The backend lives in `backend/api`. Run Django and pytest commands from that directory with the virtual environment active.

## Project structure

- `api/settings.py` contains environment-dependent Django configuration.
- `api/urls.py` mounts Django admin, django-allauth, and the application API.
- `core/urls.py` maps `/api/` routes to views.
- `core/models/` defines the data model.
- `core/serializers/` validates API input and shapes responses.
- `core/views/` implements endpoint behavior.
- `core/permissions.py` contains authorization rules.
- `core/admin.py` configures Django admin and import/export support.
- `core/signals.py` contains model lifecycle handlers.

## Adding or changing an endpoint

A typical API change involves:

1. Updating or adding a model in `core/models/`, if persistence changes.
2. Updating a serializer in `core/serializers/`.
3. Implementing the behavior in `core/views/`.
4. Registering the path in `core/urls.py`.
5. Adding tests under `core/tests/`.
6. Updating frontend types and queries when the response contract changes.

Keep authorization in view or permission logic on the backend. Hiding a frontend control is not sufficient for controlling authorization.

## Model changes and migrations

After changing a model, create and apply a migration:

```sh
python manage.py makemigrations
python manage.py migrate
```

Review generated migration files before committing them. Commit model changes and their migrations together. Run the backend test suite after applying the migration.

To inspect migration state:

```sh
python manage.py showmigrations
```

Do not edit an already-shared migration to represent a new schema change; create another migration instead.

## Django admin

Django admin is available at <http://127.0.0.1:8000/admin/> during local development. Use it to inspect records and perform supported imports or exports. When adding a model that developers or administrators need to manage, register and configure it in `core/admin.py`.

## API paths

Application endpoints are rooted at `/api/`. The browsable root itself is not a generated API index; use `core/urls.py` as the current endpoint registry. Authentication endpoints are separate and documented in [Authentication](5-authentication.md).
