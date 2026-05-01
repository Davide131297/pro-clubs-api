import { type NextRequest } from "next/server";
import { platformParam, protectedJson } from "@/lib/apiRoute";
import { fetchEaJson } from "@/lib/eaApi";

type RouteContext = {
  params: Promise<{ clubId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return protectedJson(request, async () => {
    const { clubId } = await context.params;

    return fetchEaJson("/clubs/info", {
      platform: platformParam(request),
      clubIds: clubId,
    });
  });
}
