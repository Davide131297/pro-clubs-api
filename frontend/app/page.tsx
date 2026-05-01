"use client";

import { FormEvent, useMemo, useState } from "react";

type EndpointId =
  | "search"
  | "info"
  | "overallStats"
  | "playoffAchievements"
  | "careerStats"
  | "matches";

type EndpointDefinition = {
  id: EndpointId;
  label: string;
  description: string;
  needsClubId: boolean;
};

const endpoints: EndpointDefinition[] = [
  {
    id: "search",
    label: "Club Search",
    description: "Findet Clubs per Name und uebernimmt automatisch die erste clubId.",
    needsClubId: false,
  },
  {
    id: "info",
    label: "Club Info",
    description: "Liest Club-Stammdaten für die übernommene clubId.",
    needsClubId: true,
  },
  {
    id: "overallStats",
    label: "Overall Stats",
    description: "Liest Gesamtstatistiken für die übernommene clubId.",
    needsClubId: true,
  },
  {
    id: "playoffAchievements",
    label: "Playoff Achievements",
    description: "Liest Playoff-Erfolge für die übernommene clubId.",
    needsClubId: true,
  },
  {
    id: "careerStats",
    label: "Member Career Stats",
    description: "Liest Karriere-Statistiken der Clubmitglieder.",
    needsClubId: true,
  },
  {
    id: "matches",
    label: "Matches",
    description: "Liest Matches für leagueMatch, friendlyMatch oder playoffMatch.",
    needsClubId: true,
  },
];

const matchTypes = ["leagueMatch", "friendlyMatch", "playoffMatch"] as const;
const responseViews = ["terminal", "visual"] as const;
const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN ?? "";

export default function Home() {
  const [platform, setPlatform] = useState("common-gen5");
  const [clubName, setClubName] = useState("");
  const [clubId, setClubId] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointId>("search");
  const [matchType, setMatchType] = useState<(typeof matchTypes)[number]>("leagueMatch");
  const [maxResultCount, setMaxResultCount] = useState("1");
  const [requestUrl, setRequestUrl] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [response, setResponse] = useState<unknown>(null);
  const [responseView, setResponseView] = useState<(typeof responseViews)[number]>("terminal");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const endpoint = useMemo(
    () => endpoints.find((item) => item.id === selectedEndpoint) ?? endpoints[0],
    [selectedEndpoint],
  );

  const canSubmit =
    (selectedEndpoint !== "search" || Boolean(clubName.trim())) &&
    (!endpoint.needsClubId || Boolean(clubId.trim()));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResponse(null);
    setStatus(null);

    if (!canSubmit) {
      setError("Die benoetigten Parameter muessen gesetzt sein.");
      return;
    }

    const url = buildApiUrl();
    setRequestUrl(url);
    setIsLoading(true);

    try {
      const result = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });
      const data = await result.json();

      setStatus(result.status);
      setResponse(data);

      if (!result.ok) {
        setError(data?.error ?? "Request failed.");
        return;
      }

      if (selectedEndpoint === "search") {
        const firstClubId = extractFirstClubId(data);
        if (firstClubId) {
          setClubId(firstClubId);
        }
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Request failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function buildApiUrl(): string {
    const params = new URLSearchParams();
    params.set("platform", platform.trim() || "common-gen5");

    switch (selectedEndpoint) {
      case "search":
        params.set("clubName", clubName.trim());
        return `${API_BASE_URL}/api/clubs/search?${params.toString()}`;
      case "info":
        return `${API_BASE_URL}/api/clubs/${encodeURIComponent(clubId.trim())}/info?${params.toString()}`;
      case "overallStats":
        return `${API_BASE_URL}/api/clubs/${encodeURIComponent(clubId.trim())}/overall-stats?${params.toString()}`;
      case "playoffAchievements":
        return `${API_BASE_URL}/api/clubs/${encodeURIComponent(clubId.trim())}/playoff-achievements?${params.toString()}`;
      case "careerStats":
        return `${API_BASE_URL}/api/clubs/${encodeURIComponent(clubId.trim())}/members/career-stats?${params.toString()}`;
      case "matches":
        if (maxResultCount.trim()) {
          params.set("maxResultCount", maxResultCount.trim());
        }
        return `${API_BASE_URL}/api/clubs/${encodeURIComponent(clubId.trim())}/matches/${matchType}?${params.toString()}`;
    }
  }

  return (
    <main className="h-screen overflow-hidden px-4 py-4 md:px-6">
      <section className="mx-auto grid h-full max-w-7xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-h-0 overflow-auto rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel)]/90 p-4 shadow-2xl shadow-stone-900/10 md:p-5">
          <p className="mb-2 inline-flex rounded-full bg-[var(--pitch)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#f7eed9]">
            Pro Clubs API Console
          </p>
          <h1 className="max-w-xl text-3xl font-black leading-none tracking-tight text-[var(--foreground)] md:text-4xl">
            Geschütze API-Routen testen.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            Waehle eine Route und sieh die originale EA-Antwort. Suche zuerst
            nach einem Clubnamen, danach wird die gefundene clubId für weitere
            Calls übernommen.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.16em]">
                API Route
              </span>
              <select
                value={selectedEndpoint}
                onChange={(event) => setSelectedEndpoint(event.target.value as EndpointId)}
                className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
              >
                {endpoints.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span className="text-xs leading-5 text-[var(--ink-muted)]">
                {endpoint.description}
              </span>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em]">
                  Clubname
                </span>
                <input
                  value={clubName}
                  onChange={(event) => setClubName(event.target.value)}
                  placeholder="z.B. Weighters"
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em]">
                  Club ID
                </span>
                <input
                  value={clubId}
                  onChange={(event) => setClubId(event.target.value)}
                  placeholder="Wird nach Search übernommen"
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em]">
                  Platform
                </span>
                <input
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em]">
                  Match Type
                </span>
                <select
                  value={matchType}
                  onChange={(event) =>
                    setMatchType(event.target.value as (typeof matchTypes)[number])
                  }
                  disabled={selectedEndpoint !== "matches"}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:opacity-50"
                >
                  {matchTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em]">
                  Max Results
                </span>
                <input
                  value={maxResultCount}
                  onChange={(event) => setMaxResultCount(event.target.value)}
                  disabled={selectedEndpoint !== "matches"}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] transition focus:ring-2 disabled:opacity-50"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-red-900/20 transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Request laeuft..." : "GET ausfuehren"}
            </button>
          </form>
        </div>

        <div className="flex min-h-0 flex-col rounded-[1.5rem] border border-[#173326] bg-[#0d1d16] p-4 text-[#f7eed9] shadow-2xl shadow-stone-900/20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d8c5a2]">
                Response
              </p>
              <p className="mt-1 text-xs text-[#cdbf9f]">
                Status: {status ?? "noch kein Request"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-[#294b3a] bg-[#06100c] p-1">
                {responseViews.map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setResponseView(view)}
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] transition ${
                      responseView === view
                        ? "bg-[#f7eed9] text-[#0d1d16]"
                        : "text-[#cdbf9f] hover:text-[#f7eed9]"
                    }`}
                  >
                    {view === "terminal" ? "Terminal" : "Optisch"}
                  </button>
                ))}
              </div>
              {clubId ? (
                <span className="rounded-full bg-[#f7eed9] px-3 py-1 text-xs font-black text-[#0d1d16]">
                  clubId: {clubId}
                </span>
              ) : null}
            </div>
          </div>

          {requestUrl ? (
            <div className="mb-3 rounded-xl border border-[#294b3a] bg-[#10271d] p-3">
              <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#d8c5a2]">
                Request URL
              </p>
              <code className="break-all text-xs text-[#f5c16c]">{requestUrl}</code>
            </div>
          ) : null}

          {error ? (
            <div className="mb-3 rounded-xl border border-red-300/40 bg-red-950/40 p-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {responseView === "terminal" ? (
            <pre className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#294b3a] bg-[#06100c] p-3 text-xs leading-5 text-[#dfe9d2]">
              {response ? JSON.stringify(response, null, 2) : "Noch keine Response."}
            </pre>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#294b3a] bg-[#06100c] p-3 text-xs leading-5 text-[#dfe9d2]">
              {response ? (
                <VisualResponse data={response} />
              ) : (
                <p className="text-[#cdbf9f]">Noch keine Response.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function normalizeApiBaseUrl(value: string | undefined): string {
  return value?.replace(/\/+$/, "") ?? "";
}

function extractFirstClubId(data: unknown): string | undefined {
  if (!Array.isArray(data)) {
    return undefined;
  }

  const first = data[0];
  if (!first || typeof first !== "object" || !("clubId" in first)) {
    return undefined;
  }

  return String(first.clubId);
}

function VisualResponse({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (Array.isArray(data)) {
    return (
      <div className="grid max-w-full gap-2 overflow-hidden">
        <div className="flex min-w-0 items-center justify-between rounded-lg bg-[#10271d] px-3 py-2">
          <span className="font-black uppercase tracking-[0.14em] text-[#d8c5a2]">
            Array
          </span>
          <span className="rounded-full bg-[#f7eed9] px-2 py-0.5 font-black text-[#0d1d16]">
            {data.length} Einträge
          </span>
        </div>
        {data.length === 0 ? (
          <p className="text-[#cdbf9f]">Keine Einträge.</p>
        ) : (
          data.map((item, index) => (
            <details
              key={index}
              open={depth < 1}
              className="min-w-0 overflow-hidden rounded-lg border border-[#294b3a] bg-[#0a1812]"
            >
              <summary className="cursor-pointer list-none px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#f5c16c]">
                Eintrag {index + 1}
                <span className="ml-2 font-normal normal-case tracking-normal text-[#cdbf9f]">
                  {describeValue(item)}
                </span>
              </summary>
              <div className="min-w-0 border-t border-[#294b3a] p-3">
                <VisualResponse data={item} depth={depth + 1} />
              </div>
            </details>
          ))
        )}
      </div>
    );
  }

  if (data && typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);

    return (
      <div className="grid max-w-full gap-2 overflow-hidden">
        {entries.map(([key, value]) =>
          isPrimitive(value) ? (
            <div
              key={key}
              className="min-w-0 overflow-hidden rounded-lg border border-[#294b3a] bg-[#10271d] px-3 py-2"
            >
              <span className="block truncate font-black text-[#d8c5a2]" title={key}>
                {key}
              </span>
              <span
                className="mt-1 block min-w-0 overflow-hidden break-words text-[#f7eed9]"
                title={formatPrimitive(value)}
              >
                {formatPrimitivePreview(value)}
              </span>
            </div>
          ) : (
            <details
              key={key}
              open={depth < 1}
              className="min-w-0 overflow-hidden rounded-lg border border-[#294b3a] bg-[#0a1812]"
            >
              <summary className="cursor-pointer list-none px-3 py-2 font-black text-[#d8c5a2]">
                <span className="break-words">{key}</span>
                <span className="ml-2 font-normal text-[#cdbf9f]">
                  {describeValue(value)}
                </span>
              </summary>
              <div className="min-w-0 border-t border-[#294b3a] p-3">
                <VisualResponse data={value} depth={depth + 1} />
              </div>
            </details>
          ),
        )}
      </div>
    );
  }

  return (
    <span
      className="inline-flex max-w-full rounded-full bg-[#10271d] px-3 py-1 font-black text-[#f7eed9]"
      title={formatPrimitive(data)}
    >
      <span className="min-w-0 overflow-hidden text-ellipsis">
        {formatPrimitivePreview(data)}
      </span>
    </span>
  );
}

function isPrimitive(value: unknown): boolean {
  return value === null || typeof value !== "object";
}

function formatPrimitive(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  return String(value);
}

function formatPrimitivePreview(value: unknown): string {
  const formatted = formatPrimitive(value);

  if (formatted.length <= 160) {
    return formatted;
  }

  return `${formatted.slice(0, 157)}...`;
}

function describeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `${value.length} Einträge`;
  }

  if (value && typeof value === "object") {
    return `${Object.keys(value as Record<string, unknown>).length} Felder`;
  }

  return formatPrimitivePreview(value);
}
