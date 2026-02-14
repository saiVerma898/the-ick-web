import { NextResponse } from "next/server";

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ photoUrl: null, fullName: null });
  }

  if (!APIFY_API_TOKEN) {
    console.error("APIFY_API_TOKEN is not configured");
    return NextResponse.json({ photoUrl: null, fullName: null });
  }

  try {
    // Use apify/instagram-profile-scraper to get the profile data
    const apifyRes = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
        }),
      }
    );

    if (!apifyRes.ok) {
      console.error("Apify profile scraper error:", await apifyRes.text());
      return NextResponse.json({ photoUrl: null, fullName: null });
    }

    const profiles = await apifyRes.json();

    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      const cdnUrl =
        profile.profilePicUrlHD ||
        profile.profilePicUrlHd ||
        profile.profilePicUrl ||
        null;

      let base64DataUrl: string | null = null;

      // Immediately fetch the image while the CDN URL is still fresh
      if (cdnUrl) {
        try {
          const imgRes = await fetch(cdnUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
              Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
              Referer: "https://www.instagram.com/",
            },
          });

          if (imgRes.ok) {
            const contentType =
              imgRes.headers.get("content-type") || "image/jpeg";
            const buffer = await imgRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            base64DataUrl = `data:${contentType};base64,${base64}`;
          } else {
            console.error(
              "Failed to fetch CDN image, status:",
              imgRes.status
            );
          }
        } catch (imgError) {
          console.error("Error fetching CDN image:", imgError);
        }
      }

      return NextResponse.json(
        {
          photoUrl: base64DataUrl || cdnUrl,
          fullName: profile.fullName || null,
          biography: profile.biography || null,
          followersCount: profile.followersCount || 0,
          followsCount: profile.followsCount || 0,
          isVerified: profile.verified || false,
          isPrivate: profile.private || false,
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    return NextResponse.json({ photoUrl: null, fullName: null });
  } catch (error) {
    console.error("Profile photo API error:", error);
    return NextResponse.json({ photoUrl: null, fullName: null });
  }
}
