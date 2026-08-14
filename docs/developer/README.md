# TA Connect Developer Guide

This guide is for developers who build, test, and operate TA Connect. If you are looking for instructions on using the application, see the [User guide](../user/README.md).

## Table of Contents

1. [Local development](1-local-development.md) - install the application and run it locally.
2. [Architecture](2-architecture.md) - understand the technology stack and repository layout.
3. [Backend development](3-backend-development.md) - work with Django, the API, and database models.
4. [Frontend development](4-frontend-development.md) - work with React, routes, queries, and components.
5. [Authentication](5-authentication.md) - understand local accounts and the ORCiD OAuth flow.
6. [Testing and quality](6-testing-and-quality.md) - run tests, linting, formatting, and builds.
7. [Data management](7-data-management.md) - manage the local database, fixtures, imports, exports, and uploaded files.
8. [Deployment](8-deployment.md) - understand the staging and production workflows.

## Quick start

TA Connect requires Python 3.12.9 or newer and Node.js 24.9.0 or newer. Follow [Local development](1-local-development.md) to configure and start both services.

Never commit `.env` files, database copies, credentials, or other sensitive data.
