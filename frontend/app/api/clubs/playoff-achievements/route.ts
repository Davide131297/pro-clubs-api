import { type NextRequest } from "next/server";
import { protectedJson, platformParam, requiredSearchParam } from "@/lib/apiRoute";
import { fetchEaJson } from "@/lib/eaApi";

export async function GET(request: NextRequest) {
  return protectedJson(request, async () => {
    const clubId = requiredSearchParam(request, "clubId");

    return fetchEaJson("/club/playoffAchievements", {
      platform: platformParam(request),
      clubId,
    });
  });
}
