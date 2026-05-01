# Pro Clubs API

Node.js API backend with TypeScript that proxies selected EA FC Pro Clubs endpoints and returns the original EA response structure unchanged.

## Setup

```bash
npm install
npm run dev
```

Default host and port: `127.0.0.1:3000`. Override them with `HOST` and `PORT`.

## Routes

All routes default to `platform=common-gen5`. You can override it with a `platform` query parameter.

Required values like `clubName`, `clubId`, `clubIds`, and `matchType` must be provided by the API caller in the GET request.

```http
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
