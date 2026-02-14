import { NextResponse } from "next/server";

const APIFY_ACTOR = "datadoping~instagram-following-scraper";

/**
 * Kick off an Apify run and return the runId immediately.
 * Completes in < 3 seconds — well within Vercel's 10 s limit.
 *
 * Uses datadoping/instagram-following-scraper which requires:
 *   - usernames: string[]  (array of Instagram handles)
 *   - max_count: number (>= 50, how many followings to fetch)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string };
    const username = body.username?.trim();

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "APIFY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Start the actor run (does NOT wait for completion)
    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/runs?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          max_count: 100,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to start Apify run", details: text },
        { status: 500 }
      );
    }

    const run = (await res.json()) as { data: { id: string; defaultDatasetId: string } };

    return NextResponse.json({
      runId: run.data.id,
      datasetId: run.data.defaultDatasetId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
