# Pro Clubs API Backend

Express backend for the EA FC Pro Clubs API proxy.

## Local Run

```bash
npm install
API_BEARER_TOKEN=change-this-token npm run dev
```

The server listens on `PORT` or `8080` by default.

## Environment

```env
API_BEARER_TOKEN=change-this-token
EA_BASE_URL=https://proclubs.ea.com/api/fc
EA_USER_AGENT=Mozilla/5.0 ...
```

## GitHub Actions Secrets

The Cloud Run workflow expects these repository secrets:

```text
API_BEARER_TOKEN
GCP_PROJECT_ID
GCP_REGION
GCP_SA_KEY
```

Optional repository variable:

```text
EA_BASE_URL
```
