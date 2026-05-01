# Pro Clubs API Console

Next.js 16 app with TypeScript and Tailwind CSS. It provides protected App Router API routes for selected EA FC Pro Clubs endpoints and a browser-based test console for running them.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `API_BEARER_TOKEN` in `.env`. Every API route requires:

```http
Authorization: Bearer <API_BEARER_TOKEN>
```

Optional values:

```env
EA_BASE_URL=https://proclubs.ea.com/api/fc
EA_USER_AGENT=Mozilla/5.0 ...
NEXT_PUBLIC_API_BASE_URL=https://pro-clubs-api-jypu.onrender.com
```

`EA_BASE_URL` can be pointed at your own upstream proxy if EA blocks the
hosting provider's outbound IPs. This can happen on Vercel because the EA
endpoint is protected by Akamai and may return `403 Access Denied` before the
request reaches the actual API.

`NEXT_PUBLIC_API_BASE_URL` points the browser UI at an external backend. Leave
it empty for local Next.js API routes, or set it to the Render backend URL in
production.

Open the frontend at:

```http
http://localhost:3000
```

Search for a club by name first. The UI automatically takes the first returned `clubId` and uses it for the other API calls.

## Routes

All routes default to `platform=common-gen5`. You can override it with a `platform` query parameter.

Required values like `clubName`, `clubId`, `clubIds`, and `matchType` must be provided by the API caller in the GET request. Responses are passed through from EA unchanged.

```http
GET /api/health
GET /api/clubs/search?clubName={clubName}
GET /api/clubs/info?clubIds={clubIds}
GET /api/clubs/{clubId}/info
GET /api/clubs/overall-stats?clubIds={clubIds}
GET /api/clubs/{clubId}/overall-stats
GET /api/clubs/playoff-achievements?clubId={clubId}
GET /api/clubs/{clubId}/playoff-achievements
GET /api/members/career-stats?clubId={clubId}
GET /api/clubs/{clubId}/members/career-stats
GET /api/clubs/matches?clubIds={clubIds}&matchType={matchType}&maxResultCount={count}
GET /api/clubs/{clubId}/matches/leagueMatch
GET /api/clubs/{clubId}/matches/friendlyMatch
GET /api/clubs/{clubId}/matches/playoffMatch
```

Allowed `matchType` values:

```text
leagueMatch
friendlyMatch
playoffMatch
```

## Build

```bash
npm run build
npm start
```
