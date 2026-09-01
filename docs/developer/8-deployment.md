# Deployment

GitHub Actions deploys TA Connect to staging and production. Deployment changes external environments, so review the target branch and workflow before pushing or merging.

## Environments

| Environment | Deployment trigger | Frontend URL | API URL |
| --- | --- | --- | --- |
| Staging | `main` | `https://staging.taconnect.lbl.gov` | `https://api.staging.taconnect.lbl.gov` |
| Production | Published, non-prerelease GitHub Release | `https://taconnect.lbl.gov` | `https://api.taconnect.lbl.gov` |

The backend test workflow runs on every push. The deployment workflows are defined in `.github/workflows/staging.yml` and `.github/workflows/prod.yml`. Production does not use a long-lived `prod` branch.

## Preparing a production release

The GitHub Release tag is the canonical application version and uses a `v` prefix. The version without that prefix is recorded in `backend/api/pyproject.toml`, `backend/api/uv.lock`, `frontend/package.json`, and `frontend/package-lock.json` so builds and running applications can report their source version.

To prepare a stable release:

1. Open the repository's **Actions** tab and select **Prepare Production Release**.
2. Choose **Run workflow**, leave the source branch as `main`, and enter a stable semantic version such as `1.0.0`. Do not include a leading `v`.
3. Wait for the workflow to validate the version, update all version metadata, and run the backend and frontend checks.
4. Use the workflow summary link to open a pull request from `release/<version>` into `main`.
5. Review the preparation workflow's checks and the generated changes, then merge the pull request.

The preparation workflow fails rather than overwriting an existing release branch or an existing tag. It runs the backend and frontend checks before pushing a branch instead of committing directly to `main`, preserving branch protection and review. GitHub suppresses additional push-triggered workflows for branches created with the workflow token; normal push CI runs again when the pull request is merged to `main`.

## Publishing and deploying a production release

After the release preparation pull request is merged:

1. In GitHub, open **Releases** and choose **Draft a new release**.
2. Create a tag from the merged `main` commit by prefixing the prepared package version with `v`. For example, package version `1.0.0` uses tag `v1.0.0`.
3. Add release notes and publish the release. Marking it as a prerelease will intentionally skip production deployment.
4. Monitor the **Release and Deploy to Production** workflow.

The production workflow checks out the exact release tag. Before copying any files, it verifies that the tag matches both the backend and frontend versions. A mismatched or malformed version stops the deployment.

## Deployment sequence

Each deployment workflow:

1. Checks out the selected revision.
2. Installs Python and backend dependencies for the build.
3. Collects Django static files.
4. Copies the backend to the target server over SSH.
5. Installs frontend dependencies.
6. Builds the frontend with environment-specific API URLs.
7. Copies `frontend/dist` to the target server.
8. Runs Django migrations remotely.
9. Restarts the environment's Gunicorn service and Nginx.

The workflows use repository secrets for the SSH host, user, and private key. Application environment variables and service configuration are maintained on the server rather than in this repository.

On each server, `uv` must be installed for the SSH deployment user and available from `$HOME/.local/bin`. The remote deployment runs `uv sync --locked --no-dev` in `backend/api`, which creates or updates `.venv`. The environment's systemd Gunicorn unit must start Gunicorn from that environment, for example `/home/<user>/taconnect-prod/backend/api/.venv/bin/gunicorn` in production.

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
