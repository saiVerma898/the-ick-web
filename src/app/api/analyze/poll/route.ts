import { NextRequest, NextResponse } from "next/server";

/**
 * Check whether an Apify run has finished.
 * Returns { status, datasetId }.  Completes in < 2 seconds.
 */
export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId")?.trim();

  if (!runId) {
    return NextResponse.json({ error: "Missing runId" }, { status: 400 });
  }

  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "APIFY_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to poll run", details: text },
        { status: 500 }
      );
    }

    const data = (await res.json()) as {
      data: { status: string; defaultDatasetId: string };
    };

    return NextResponse.json({
      status: data.data.status, // READY, RUNNING, SUCCEEDED, FAILED, ABORTED, TIMED-OUT
      datasetId: data.data.defaultDatasetId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
