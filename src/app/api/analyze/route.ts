import { NextResponse } from "next/server";

// Allow up to 60s for Apify + genderize calls (requires Vercel Pro)
export const maxDuration = 60;

const APIFY_ACTOR = "louisdeconinck~instagram-following-scraper";

/* ------------------------------------------------------------------ */
/*  Gender classification via genderize.io (batched, parallel)        */
/* ------------------------------------------------------------------ */
async function classifyGenders(
  names: string[]
): Promise<Map<string, "male" | "female">> {
  const unique = [
    ...new Set(names.map((n) => n.toLowerCase()).filter(Boolean)),
  ];

  if (unique.length === 0) return new Map();

  // Batch into groups of 10 (genderize.io limit)
  const batches: string[][] = [];
  for (let i = 0; i < unique.length; i += 10) {
    batches.push(unique.slice(i, i + 10));
  }

  const results = new Map<string, "male" | "female">();

  await Promise.all(
    batches.map(async (batch) => {
      try {
        const params = batch
          .map((n) => `name[]=${encodeURIComponent(n)}`)
          .join("&");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`https://api.genderize.io?${params}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) return;

        const data = (await res.json()) as Array<{
          name: string;
          gender: "male" | "female" | null;
          probability: number;
          count: number;
        }>;

        for (const item of data) {
          if (item.gender && item.probability > 0.6) {
            results.set(item.name.toLowerCase(), item.gender);
          }
        }
      } catch {
        // skip failed batch
      }
    })
  );

  return results;
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string };
    const username = body.username?.trim();

    if (!username) {
      return NextResponse.json({
        username: "",
        followers: 0,
        following: 0,
        followersDelta: 0,
        followingDelta: 0,
        recentFollows: { girls: 0, guys: 0, total: 0, profiles: [] },
      });
    }

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "APIFY_API_TOKEN is not configured" },
        { status: 500 }
      );
    }

    /* ---------- 1. Fetch followings from Apify -------------------- */
    const actorUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${token}`;

    const apifyResponse = await fetch(actorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [username],
        maxResults: 100,
        includeUserInfo: true,
      }),
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      return NextResponse.json(
        { error: "Apify request failed", details: errorText },
        { status: 500 }
      );
    }

    const items = (await apifyResponse.json()) as Array<
      Record<string, unknown>
    >;

    /* ---------- 2. Extract profiles ------------------------------- */
    const rawProfiles = (items || []).slice(0, 100).map((item) => {
      const u =
        (item.username as string) ||
        (item.userName as string) ||
        (item.handle as string) ||
        "unknown";
      const fn =
        (item.full_name as string) ||
        (item.fullName as string) ||
        "";
      const pic =
        (item.profile_pic_url as string) ||
        (item.profilePicUrl as string) ||
        (item.profilePicture as string) ||
        "";
      const verified = Boolean(item.is_verified ?? item.isVerified ?? false);
      const priv = Boolean(item.is_private ?? item.isPrivate ?? false);

      return { username: u, fullName: fn, profilePicUrl: pic, isVerified: verified, isPrivate: priv };
    });

    /* ---------- 3. Classify gender -------------------------------- */
    const firstNames = rawProfiles.map((p) => {
      const parts = (p.fullName || "").trim().split(/\s+/);
      return parts[0] || "";
    });

    const genderMap = await classifyGenders(firstNames);

    const profiles = rawProfiles.map((p, i) => {
      const firstName = firstNames[i]?.toLowerCase() || "";
      const gender: "male" | "female" | "unknown" =
        genderMap.get(firstName) || "unknown";
      return { ...p, gender };
    });

    const girls = profiles.filter((p) => p.gender === "female").length;
    const guys = profiles.filter((p) => p.gender === "male").length;
    const total = profiles.length;

    return NextResponse.json({
      username,
      followers: 0,
      following: total,
      followersDelta: 0,
      followingDelta: 0,
      recentFollows: { girls, guys, total, profiles },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
