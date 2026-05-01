import { type NextRequest } from "next/server";
import {
  optionalSearchParam,
  platformParam,
  protectedJson,
  validateMatchType,
} from "@/lib/apiRoute";
import { fetchEaJson } from "@/lib/eaApi";

type RouteContext = {
  params: Promise<{ clubId: string; matchType: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return protectedJson(request, async () => {
    const { clubId, matchType } = await context.params;

    return fetchEaJson("/clubs/matches", {
      platform: platformParam(request),
      clubIds: clubId,
      matchType: validateMatchType(matchType),
      maxResultCount: optionalSearchParam(request, "maxResultCount"),
    });
  });
}
