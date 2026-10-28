import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "d1063e408496911ca74bc7a968b9cf95";
const TMDB_READ_TOKEN = process.env.TMDB_READ_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 });
    }

    // Build upstream TMDB URL with all query parameters
    const forwardParams = new URLSearchParams();
    searchParams.forEach((val, key) => {
      if (key !== "endpoint") {
        forwardParams.append(key, val);
      }
    });

    if (!forwardParams.has("api_key") && !TMDB_READ_TOKEN) {
      forwardParams.append("api_key", TMDB_API_KEY);
    }

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const tmdbUrl = `${TMDB_BASE_URL}${cleanEndpoint}?${forwardParams.toString()}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (TMDB_READ_TOKEN) {
      headers["Authorization"] = `Bearer ${TMDB_READ_TOKEN}`;
    }

    const res = await fetch(tmdbUrl, {
      headers,
      next: { revalidate: 300 }, // Cache response for 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `TMDB upstream returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.warn("TMDB Proxy internal fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to connect to TMDB upstream" },
      { status: 502 }
    );
  }
}
