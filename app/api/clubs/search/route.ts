import { type NextRequest } from "next/server";
import { protectedJson, platformParam, requiredSearchParam } from "@/lib/apiRoute";
import { fetchEaJson } from "@/lib/eaApi";

export async function GET(request: NextRequest) {
  return protectedJson(request, async () => {
    const clubName = requiredSearchParam(request, "clubName");

    return fetchEaJson("/allTimeLeaderboard/search", {
      platform: platformParam(request),
      clubName,
    });
  });
}
