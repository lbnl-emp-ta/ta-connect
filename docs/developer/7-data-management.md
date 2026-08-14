# Data management

TA Connect uses SQLite. By default, Django stores local data in `backend/api/db.sqlite3` and uploaded files in `backend/api/media/`.

Treat database copies and uploaded files as potentially sensitive. Do not commit or share them through unsecured channels.

## Create a database

For a new local database, run from `backend/api`:

```sh
python manage.py migrate
```

You may instead obtain a development database from a teammate and place it at `backend/api/db.sqlite3`. Back up an existing local database before replacing it, then run migrations so its schema is current:

```sh
python manage.py migrate
```

## Fixtures

Lookup and sample fixtures live in `core/fixtures/`.

The `core/fixtures/populate_db.py` script is there for convenience to run all fixtures at once to populate a dummy database. With your venv activated, run:

```
python `core/fixtures/populate_db.py`
```

To load a single fixture with Django's `loaddata` command:

```sh
python manage.py loaddata core/fixtures/states_fixture.json
```

The fixture set has dependencies and must be loaded in the correct order. `core/fixtures/populate_db.py` records the repository's intended order for the bundled sample data. Review the script and fixture contents before using them; sample fixtures can conflict with records already present in a populated database.

## Imports and exports

The backend uses django-import-export for supported admin resources. Sign in to Django admin and open a configured model to access its import or export controls.

Before importing:

- Confirm the file belongs to the intended environment.
- Back up the database.
- Validate required relationships and identifiers.
- Use a non-production environment first when possible.

After importing, inspect representative records and exercise the affected application workflow.

## Uploaded files

Development uploads are written beneath `backend/api/media/`; request attachments are stored under its attachments directory. A copied database can refer to media files that were not included with the database, so database and media backups may need to be coordinated.

Do not treat the local media directory as a durable backup.

## Schema changes

Database schema is managed exclusively through Django migrations. See [Backend development](3-backend-development.md#model-changes-and-migrations) for the migration workflow.
