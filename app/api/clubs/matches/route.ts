import { type NextRequest } from "next/server";
import {
  optionalSearchParam,
  platformParam,
  protectedJson,
  requiredSearchParam,
  validateMatchType,
} from "@/lib/apiRoute";
import { fetchEaJson } from "@/lib/eaApi";

export async function GET(request: NextRequest) {
  return protectedJson(request, async () => {
    const clubIds = requiredSearchParam(request, "clubIds");
    const matchType = validateMatchType(optionalSearchParam(request, "matchType"));

    return fetchEaJson("/clubs/matches", {
      platform: platformParam(request),
      clubIds,
      matchType,
      maxResultCount: optionalSearchParam(request, "maxResultCount"),
    });
  });
}
