# Deployment

GitHub Actions deploys TA Connect to staging and production. Deployment changes external environments, so review the target branch and workflow before pushing or merging.

## Environments

| Environment | Trigger branch | Frontend URL | API URL |
| --- | --- | --- | --- |
| Staging | `main` | `https://staging.taconnect.lbl.gov` | `https://api.staging.taconnect.lbl.gov` |
| Production | `prod` | `https://taconnect.lbl.gov` | `https://api.taconnect.lbl.gov` |

The backend test workflow runs on every push. The deployment workflows are defined in `.github/workflows/staging.yml` and `.github/workflows/prod.yml`.

## Deployment sequence

Each deployment workflow:

1. Checks out the selected revision.
2. Installs Python and backend dependencies.
3. Collects Django static files.
4. Copies the backend to the target server over SSH.
5. Installs frontend dependencies.
6. Builds the frontend with environment-specific API URLs.
7. Copies `frontend/dist` to the target server.
8. Runs Django migrations remotely.
9. Restarts the environment's Gunicorn service and Nginx.

The workflows use repository secrets for the SSH host, user, and private key. Application environment variables and service configuration are maintained on the server rather than in this repository.

## Release checks

Before deploying:

- Confirm backend tests pass for the revision.
- Run frontend lint and build checks.
- Review new migrations, especially data migrations and destructive schema operations.
- Confirm required environment variables and ORCiD configuration exist in the target environment.
- Coordinate database or service changes that require downtime.

After deploying:

- Confirm the workflow completed successfully.
- Open the target frontend and verify authentication.
- Exercise a representative API-backed workflow.
- Check that static assets and uploaded media behave as expected.
- Review server logs if migrations, Gunicorn, Nginx, or application requests fail.

Do not rerun, modify, or bypass a failed production deployment until its failure point and the state of any applied migrations are understood.
