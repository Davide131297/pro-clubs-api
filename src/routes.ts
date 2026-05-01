import { Router, type NextFunction, type Request, type Response } from "express";
import { DEFAULT_PLATFORM } from "./config.js";
import { EaApiError, fetchEaJson } from "./eaApi.js";

const MATCH_TYPES = ["leagueMatch", "friendlyMatch", "playoffMatch"] as const;
type MatchType = (typeof MATCH_TYPES)[number];

export const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

router.get(
  "/clubs/search",
  asyncHandler(async (request, response) => {
    const clubName = requiredQuery(request, response, "clubName");
    if (!clubName) return;

    const data = await fetchEaJson("/allTimeLeaderboard/search", {
      platform: platform(request),
      clubName,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/info",
  asyncHandler(async (request, response) => {
    const clubIds = requiredQuery(request, response, "clubIds");
    if (!clubIds) return;

    const data = await fetchEaJson("/clubs/info", {
      platform: platform(request),
      clubIds,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/:clubId/info",
  asyncHandler(async (request, response) => {
    const data = await fetchEaJson("/clubs/info", {
      platform: platform(request),
      clubIds: request.params.clubId,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/overall-stats",
  asyncHandler(async (request, response) => {
    const clubIds = requiredQuery(request, response, "clubIds");
    if (!clubIds) return;

    const data = await fetchEaJson("/clubs/overallStats", {
      platform: platform(request),
      clubIds,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/:clubId/overall-stats",
  asyncHandler(async (request, response) => {
    const data = await fetchEaJson("/clubs/overallStats", {
      platform: platform(request),
      clubIds: request.params.clubId,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/playoff-achievements",
  asyncHandler(async (request, response) => {
    const clubId = requiredQuery(request, response, "clubId");
    if (!clubId) return;

    const data = await fetchEaJson("/club/playoffAchievements", {
      platform: platform(request),
      clubId,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/:clubId/playoff-achievements",
  asyncHandler(async (request, response) => {
    const data = await fetchEaJson("/club/playoffAchievements", {
      platform: platform(request),
      clubId: request.params.clubId,
    });

    response.json(data);
  }),
);

router.get(
  "/members/career-stats",
  asyncHandler(async (request, response) => {
    const clubId = requiredQuery(request, response, "clubId");
    if (!clubId) return;

    const data = await fetchEaJson("/members/career/stats", {
      platform: platform(request),
      clubId,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/:clubId/members/career-stats",
  asyncHandler(async (request, response) => {
    const data = await fetchEaJson("/members/career/stats", {
      platform: platform(request),
      clubId: request.params.clubId,
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/matches",
  asyncHandler(async (request, response) => {
    const clubIds = requiredQuery(request, response, "clubIds");
    if (!clubIds) return;

    const matchType = validateMatchType(request, response);
    if (!matchType) return;

    const data = await fetchEaJson("/clubs/matches", {
      platform: platform(request),
      clubIds,
      matchType,
      maxResultCount: optionalQuery(request, "maxResultCount"),
    });

    response.json(data);
  }),
);

router.get(
  "/clubs/:clubId/matches/:matchType",
  asyncHandler(async (request, response) => {
    const matchType = validateMatchType(request, response, request.params.matchType);
    if (!matchType) return;

    const data = await fetchEaJson("/clubs/matches", {
      platform: platform(request),
      clubIds: request.params.clubId,
      matchType,
      maxResultCount: optionalQuery(request, "maxResultCount"),
    });

    response.json(data);
  }),
);

router.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    if (error instanceof EaApiError) {
      response.status(error.status).json({
        error: error.message,
        eaUrl: error.url,
        response: error.response,
      });
      return;
    }

    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  },
);

function asyncHandler(
  handler: (request: Request, response: Response) => Promise<void>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response).catch(next);
  };
}

function platform(request: Request): string {
  return optionalQuery(request, "platform") ?? DEFAULT_PLATFORM;
}

function requiredQuery(
  request: Request,
  response: Response,
  key: string,
): string | undefined {
  const value = optionalQuery(request, key);

  if (!value) {
    response.status(400).json({ error: `Missing required query parameter: ${key}` });
    return undefined;
  }

  return value;
}

function optionalQuery(request: Request, key: string): string | undefined {
  const value = request.query[key];

  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
}

function validateMatchType(
  request: Request,
  response: Response,
  value = optionalQuery(request, "matchType"),
): MatchType | undefined {
  if (!value) {
    response.status(400).json({ error: "Missing required query parameter: matchType" });
    return undefined;
  }

  if (!isMatchType(value)) {
    response.status(400).json({
      error: `Invalid matchType. Allowed values: ${MATCH_TYPES.join(", ")}`,
    });
    return undefined;
  }

  return value;
}

function isMatchType(value: string): value is MatchType {
  return MATCH_TYPES.includes(value as MatchType);
}
