import { type NextRequest } from "next/server";
import { protectedJson, platformParam, requiredSearchParam } from "@/lib/apiRoute";
import { fetchEaJson } from "@/lib/eaApi";

export async function GET(request: NextRequest) {
  return protectedJson(request, async () => {
    const clubIds = requiredSearchParam(request, "clubIds");

    return fetchEaJson("/clubs/overallStats", {
      platform: platformParam(request),
      clubIds,
    });
  });
}
