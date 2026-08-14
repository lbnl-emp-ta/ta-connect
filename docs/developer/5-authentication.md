# Authentication

TA Connect uses django-allauth for headless session management and ORCiD OAuth. Django's model backend remains enabled so local superusers can sign in to Django admin.

## Authentication endpoints

- `/admin/` provides Django's administrator login.
- `/_allauth/` provides headless session and account endpoints used by the frontend.
- `/accounts/` handles provider endpoints needed for the OAuth handshake.

The frontend sends credentials with requests and checks the allauth session before rendering private routes. Django also enforces permissions on API requests.

## Local administrator login

Create a superuser from `backend/api`:

```sh
python manage.py createsuperuser
```

Start both services, visit <http://127.0.0.1:8000/admin/>, and log in. The browser session can then be recognized by the frontend at <http://127.0.0.1:5173/>.

## Local ORCiD setup

1. Create an [ORCiD account](https://orcid.org/) if needed and log in.
2. Open the [ORCiD Developer Tools](https://orcid.org/developer-tools) page.
3. Register a client application for local TA Connect development.
4. Configure its redirect information for the local application as required by ORCiD.
5. Add the generated credentials to `backend/api/.env`:

```dotenv
TACONNECT_ORCID_CLIENT_ID=your-local-client-id
TACONNECT_ORCID_CLIENT_SECRET=your-local-client-secret
```

Restart Django after changing `.env`. The **Continue with ORCiD** action should now complete the provider flow and return to the frontend.

Local client credentials are only for development. Staging and production credentials are managed separately and must never be copied into the repository.

## Related backend settings

`TACONNECT_FRONTEND_URL` defaults to `http://127.0.0.1:5173` and is used to construct frontend account URLs. `TACONNECT_FRONTEND_DOMAIN` defaults to `127.0.0.1` and affects the CSRF cookie domain.

If local authentication fails, verify that:

- Django and Vite use hosts and ports trusted by the CORS and CSRF settings.
- `VITE_BACKEND_URL` points to Django without `/api`.
- `VITE_API_URL` points to Django with `/api`.
- Both services were restarted after environment changes.
- Browser cookies are not blocked for the local origins.
