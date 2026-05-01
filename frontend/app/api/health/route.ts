import { type NextRequest } from "next/server";
import { protectedJson } from "@/lib/apiRoute";

export async function GET(request: NextRequest) {
  return protectedJson(request, async () => ({ status: "ok" }));
}
