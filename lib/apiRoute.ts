import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_PLATFORM, MATCH_TYPES, type MatchType } from "./config";
import { EaApiError } from "./eaApi";

export async function protectedJson(
  request: NextRequest,
  handler: () => Promise<unknown>,
): Promise<NextResponse> {
  const authError = authorize(request);
  if (authError) {
    return authError;
  }

  try {
    const data = await handler();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof EaApiError) {
      return NextResponse.json(
        {
          error: error.message,
          eaUrl: error.url,
          response: error.response,
        },
        { status: error.status },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export function requiredSearchParam(request: NextRequest, key: string): string {
  const value = request.nextUrl.searchParams.get(key)?.trim();

  if (!value) {
    throw new HttpError(400, `Missing required query parameter: ${key}`);
  }

  return value;
}

export function optionalSearchParam(
  request: NextRequest,
  key: string,
): string | undefined {
  return request.nextUrl.searchParams.get(key)?.trim() || undefined;
}

export function platformParam(request: NextRequest): string {
  return optionalSearchParam(request, "platform") ?? DEFAULT_PLATFORM;
}

export function validateMatchType(value: string | undefined): MatchType {
  if (!value) {
    throw new HttpError(400, "Missing required query parameter: matchType");
  }

  if (!MATCH_TYPES.includes(value as MatchType)) {
    throw new HttpError(
      400,
      `Invalid matchType. Allowed values: ${MATCH_TYPES.join(", ")}`,
    );
  }

  return value as MatchType;
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function authorize(request: NextRequest): NextResponse | undefined {
  const token = process.env.API_BEARER_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "API_BEARER_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${token}`) {
    return NextResponse.json(
      { error: "Unauthorized. Send Authorization: Bearer <token>." },
      { status: 401 },
    );
  }

  return undefined;
}
