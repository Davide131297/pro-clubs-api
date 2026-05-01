export const EA_BASE_URL =
  process.env.EA_BASE_URL ?? "https://proclubs.ea.com/api/fc";
export const DEFAULT_PLATFORM = "common-gen5";
export const MATCH_TYPES = ["leagueMatch", "friendlyMatch", "playoffMatch"] as const;

export type MatchType = (typeof MATCH_TYPES)[number];
