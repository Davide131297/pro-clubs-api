import { EA_BASE_URL } from "./config";

type QueryValue = string | number | boolean | undefined | null;

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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
    cache: "no-store",
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      origin: "https://www.ea.com",
      pragma: "no-cache",
      referer: "https://www.ea.com/",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": process.env.EA_USER_AGENT ?? DEFAULT_USER_AGENT,
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
