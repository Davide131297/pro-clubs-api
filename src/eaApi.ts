import { EA_BASE_URL } from "./config.js";

type QueryValue = string | number | boolean | undefined | null;

export class EaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: unknown,
    public readonly url: string,
  ) {
    super(message);
  }
}

export async function fetchEaJson(
  path: string,
  query: Record<string, QueryValue>,
): Promise<unknown> {
  const url = new URL(`${EA_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "pro-clubs-api/1.0",
    },
  });

  const rawBody = await response.text();
  const body = parseJson(rawBody);

  if (!response.ok) {
    throw new EaApiError(
      `EA API request failed with status ${response.status}`,
      response.status,
      body,
      url.toString(),
    );
  }

  return body;
}

function parseJson(rawBody: string): unknown {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}
