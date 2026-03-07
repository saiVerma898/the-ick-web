// This acts as a database service wrapper.
// In the future, this will save to Firestore.

export interface FollowProfile {
  username: string;
  fullName: string;
  profilePicUrl: string;
  isVerified: boolean;
  isPrivate: boolean;
  gender: "male" | "female" | "unknown";
}

export interface AnalysisResult {
  username: string;
  followers: number;
  following: number;
  followersDelta: number;
  followingDelta: number;
  recentFollows: {
    girls: number;
    guys: number;
    total: number;
    profiles: FollowProfile[];
  };
}

export interface AnalyzeProfileOptions {
  tiktokEventId?: string;
  ttclid?: string;
  ttp?: string;
  url?: string;
  eventTimeUnix?: number;
}

/**
 * Analyze an Instagram profile's followings.
 * Uses the 3-step async flow: start → poll → results.
 * Each step is a short HTTP call (< 10 s) so it works on Vercel Hobby.
 */
export async function analyzeProfile(
  username: string,
  options?: AnalyzeProfileOptions
): Promise<AnalysisResult> {
  /* --- Step 1: kick off Apify run --- */
  const startRes = await fetch("/api/analyze/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      tiktokEventId: options?.tiktokEventId,
      ttclid: options?.ttclid,
      ttp: options?.ttp,
      url: options?.url,
      eventTimeUnix: options?.eventTimeUnix,
    }),
  });

  if (!startRes.ok) throw new Error("Failed to start analysis");
  const { runId, datasetId: initialDatasetId } = await startRes.json();

  /* --- Step 2: poll until SUCCEEDED --- */
  let status = "RUNNING";
  let datasetId = initialDatasetId;

  while (status !== "SUCCEEDED") {
    await new Promise((r) => setTimeout(r, 3000));

    const pollRes = await fetch(
      `/api/analyze/poll?runId=${encodeURIComponent(runId)}`
    );
    if (!pollRes.ok) throw new Error("Failed to poll analysis");

    const pollData = await pollRes.json();
    status = pollData.status;
    if (pollData.datasetId) datasetId = pollData.datasetId;

    if (
      status === "FAILED" ||
      status === "ABORTED" ||
      status === "TIMED-OUT"
    ) {
      throw new Error(`Analysis run ${status}`);
    }
  }

  /* --- Step 3: fetch results + gender classification --- */
  const resultsRes = await fetch(
    `/api/analyze/results?datasetId=${encodeURIComponent(
      datasetId
    )}&username=${encodeURIComponent(username)}`
  );

  if (!resultsRes.ok) throw new Error("Failed to fetch analysis results");

  return (await resultsRes.json()) as AnalysisResult;
}
