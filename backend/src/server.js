import express from "express";
import cors from "cors";
import helmet from "helmet";
import { DEFAULT_PLATFORM, MATCH_TYPES } from "./config.js";
import { EaApiError, fetchEaJson } from "./eaApi.js";

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.set("trust proxy", true);
app.disable("x-powered-by");

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get(
  "/api/clubs/search",
  protectedJson(async (req) => {
    const clubName = requiredQuery(req, "clubName");

    return fetchEaJson("/allTimeLeaderboard/search", {
      platform: platformParam(req),
      clubName,
    });
  }),
);

app.get(
  "/api/clubs/info",
  protectedJson(async (req) =>
    fetchEaJson("/clubs/info", {
      platform: platformParam(req),
      clubIds: requiredQuery(req, "clubIds"),
    }),
  ),
);

app.get(
  "/api/clubs/:clubId/info",
  protectedJson(async (req) =>
    fetchEaJson("/clubs/info", {
      platform: platformParam(req),
      clubIds: req.params.clubId,
    }),
  ),
);

app.get(
  "/api/clubs/overall-stats",
  protectedJson(async (req) =>
    fetchEaJson("/clubs/overallStats", {
      platform: platformParam(req),
      clubIds: requiredQuery(req, "clubIds"),
    }),
  ),
);

app.get(
  "/api/clubs/:clubId/overall-stats",
  protectedJson(async (req) =>
    fetchEaJson("/clubs/overallStats", {
      platform: platformParam(req),
      clubIds: req.params.clubId,
    }),
  ),
);

app.get(
  "/api/clubs/playoff-achievements",
  protectedJson(async (req) =>
    fetchEaJson("/club/playoffAchievements", {
      platform: platformParam(req),
      clubId: requiredQuery(req, "clubId"),
    }),
  ),
);

app.get(
  "/api/clubs/:clubId/playoff-achievements",
  protectedJson(async (req) =>
    fetchEaJson("/club/playoffAchievements", {
      platform: platformParam(req),
      clubId: req.params.clubId,
    }),
  ),
);

app.get(
  "/api/members/career-stats",
  protectedJson(async (req) =>
    fetchEaJson("/members/career/stats", {
      platform: platformParam(req),
      clubId: requiredQuery(req, "clubId"),
    }),
  ),
);

app.get(
  "/api/clubs/:clubId/members/career-stats",
  protectedJson(async (req) =>
    fetchEaJson("/members/career/stats", {
      platform: platformParam(req),
      clubId: req.params.clubId,
    }),
  ),
);

app.get(
  "/api/clubs/matches",
  protectedJson(async (req) => {
    const matchType = validateMatchType(optionalQuery(req, "matchType"));

    return fetchEaJson("/clubs/matches", {
      platform: platformParam(req),
      clubIds: requiredQuery(req, "clubIds"),
      matchType,
      maxResultCount: optionalQuery(req, "maxResultCount"),
    });
  }),
);

app.get(
  "/api/clubs/:clubId/matches/:matchType",
  protectedJson(async (req) => {
    const matchType = validateMatchType(req.params.matchType);

    return fetchEaJson("/clubs/matches", {
      platform: platformParam(req),
      clubIds: req.params.clubId,
      matchType,
      maxResultCount: optionalQuery(req, "maxResultCount"),
    });
  }),
);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof EaApiError) {
    res.status(error.status).json({
      error: error.message,
      eaUrl: error.url,
      response: error.response,
    });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
});

function protectedJson(handler) {
  return async (req, res, next) => {
    const authError = authorize(req);
    if (authError) {
      res.status(authError.status).json({ error: authError.message });
      return;
    }

    try {
      const data = await handler(req);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };
}

function authorize(req) {
  const token = process.env.API_BEARER_TOKEN;

  if (!token) {
    return new HttpError(500, "API_BEARER_TOKEN is not configured");
  }

  if (req.get("authorization") !== `Bearer ${token}`) {
    return new HttpError(401, "Unauthorized. Send Authorization: Bearer <token>.");
  }

  return undefined;
}

function requiredQuery(req, key) {
  const value = optionalQuery(req, key);

  if (!value) {
    throw new HttpError(400, `Missing required query parameter: ${key}`);
  }

  return value;
}

function optionalQuery(req, key) {
  const value = req.query[key];

  if (Array.isArray(value)) {
    return String(value[0] ?? "").trim() || undefined;
  }

  return value === undefined ? undefined : String(value).trim() || undefined;
}

function platformParam(req) {
  return optionalQuery(req, "platform") ?? DEFAULT_PLATFORM;
}

function validateMatchType(value) {
  if (!value) {
    throw new HttpError(400, "Missing required query parameter: matchType");
  }

  if (!MATCH_TYPES.includes(value)) {
    throw new HttpError(
      400,
      `Invalid matchType. Allowed values: ${MATCH_TYPES.join(", ")}`,
    );
  }

  return value;
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
