import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies an image URL through the server to bypass Instagram CDN CORS blocking.
 * Usage: /api/proxy-image?url=<encoded-image-url>
 *
 * Returns the image bytes with the correct content-type header so the
 * browser can render it like any normal image.
 */
export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        // Mimic a normal browser request so CDNs don't reject us
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // cache 24h
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Image proxy error", { status: 502 });
  }
}
