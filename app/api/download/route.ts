import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    console.log("[v0] Received URL:", url)

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 })
    }

    // Normalize the URL
    let normalizedUrl = url.trim()

    const isValidThreadsUrl = normalizedUrl.includes("threads.net") || normalizedUrl.includes("threads.com")

    if (!isValidThreadsUrl) {
      return NextResponse.json({ error: "Please provide a valid Threads URL" }, { status: 400 })
    }

    // Ensure URL has protocol
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl
    }

    console.log("[v0] Normalized URL:", normalizedUrl)

    // Extract post ID from URL
    const postIdMatch = normalizedUrl.match(/\/post\/([A-Za-z0-9_-]+)/)
    if (!postIdMatch) {
      return NextResponse.json({ error: "Could not extract post ID from URL" }, { status: 400 })
    }

    const postId = postIdMatch[1]
    console.log("[v0] Post ID:", postId)

    let videoUrl = null
    let thumbnail = null

    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
    })

    console.log("[v0] Fetch status:", response.status)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch Threads post" }, { status: 400 })
    }

    const html = await response.text()
    console.log("[v0] HTML length:", html.length)

    function findVideoVersions(obj: unknown, depth = 0): string | null {
      if (depth > 50) return null // Prevent infinite recursion

      if (Array.isArray(obj)) {
        for (const item of obj) {
          const result = findVideoVersions(item, depth + 1)
          if (result) return result
        }
      } else if (obj && typeof obj === "object") {
        const record = obj as Record<string, unknown>

        // Check if this object has video_versions
        if (record.video_versions && Array.isArray(record.video_versions) && record.video_versions.length > 0) {
          const versions = record.video_versions as Array<{ url?: string }>
          // Get the first (usually highest quality) video URL
          const videoVersion = versions[0]
          if (videoVersion && videoVersion.url) {
            console.log("[v0] Found video_versions with URL")
            return videoVersion.url
          }
        }

        // Recursively search all values
        for (const key of Object.keys(record)) {
          const result = findVideoVersions(record[key], depth + 1)
          if (result) return result
        }
      }

      return null
    }

    const scriptRegex = /<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/gi
    let match

    console.log("[v0] Searching for data-sjs script tags...")

    while ((match = scriptRegex.exec(html)) !== null) {
      const content = match[1]

      // Only process scripts that might contain thread data
      if (!content.includes("ScheduledServerJS")) continue
      if (!content.includes("thread_items") && !content.includes("video_versions")) continue

      console.log("[v0] Found promising script tag with thread data")

      try {
        const data = JSON.parse(content)
        const foundUrl = findVideoVersions(data)
        if (foundUrl) {
          videoUrl = foundUrl
          console.log("[v0] Extracted video URL:", videoUrl.substring(0, 100))
          break
        }
      } catch (e) {
        console.log("[v0] Failed to parse script JSON")
      }
    }

    if (!videoUrl) {
      console.log("[v0] Trying fallback: searching all script tags...")

      const allScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
      while ((match = allScriptRegex.exec(html)) !== null) {
        const content = match[1]

        // Look for video_versions pattern in raw content
        const videoVersionsMatch = content.match(/"video_versions"\s*:\s*\[\s*\{[^}]*"url"\s*:\s*"([^"]+)"/i)
        if (videoVersionsMatch) {
          videoUrl = videoVersionsMatch[1]
            .replace(/\\u002F/g, "/")
            .replace(/\\u0026/g, "&")
            .replace(/\\\//g, "/")
          console.log("[v0] Found video URL via regex in script:", videoUrl.substring(0, 100))
          break
        }

        // Look for direct CDN video URLs
        const cdnMatch = content.match(/https:\\u002F\\u002Fscontent[^"]*?\.mp4[^"]*/)
        if (cdnMatch) {
          videoUrl = cdnMatch[0].replace(/\\u002F/g, "/").replace(/\\u0026/g, "&")
          console.log("[v0] Found CDN video URL:", videoUrl.substring(0, 100))
          break
        }
      }
    }

    if (!videoUrl) {
      console.log("[v0] Trying fallback: searching raw HTML for video URLs...")

      // Look for Instagram CDN video URLs (with unicode escapes)
      const patterns = [
        /https:\\u002F\\u002Fscontent[^"'\s]*?\.mp4[^"'\s]*/gi,
        /https:\\u002F\\u002Fvideo[^"'\s]*?\.mp4[^"'\s]*/gi,
        /"url":"(https:\\u002F\\u002F[^"]*cdninstagram[^"]*\.mp4[^"]*)"/gi,
      ]

      for (const pattern of patterns) {
        const matches = [...html.matchAll(pattern)]
        if (matches.length > 0) {
          videoUrl = (matches[0][1] || matches[0][0])
            .replace(/\\u002F/g, "/")
            .replace(/\\u0026/g, "&")
            .replace(/\\\//g, "/")
          console.log("[v0] Found video URL via raw HTML pattern:", videoUrl.substring(0, 100))
          break
        }
      }
    }

    // Get thumbnail from og:image
    const thumbMatch =
      html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
      html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i)
    if (thumbMatch) {
      thumbnail = thumbMatch[1]
      console.log("[v0] Found thumbnail")
    }

    if (!videoUrl) {
      console.log("[v0] No video found with any method")
      console.log("[v0] Has video_versions keyword:", html.includes("video_versions"))
      console.log("[v0] Has thread_items keyword:", html.includes("thread_items"))
      console.log("[v0] Has .mp4 keyword:", html.includes(".mp4"))

      return NextResponse.json(
        {
          error:
            "Could not extract video from this Threads post. The video might be protected or the post structure has changed.",
          debug: {
            htmlLength: html.length,
            hasVideoVersions: html.includes("video_versions"),
            hasThreadItems: html.includes("thread_items"),
            hasMp4: html.includes(".mp4"),
          },
        },
        { status: 404 },
      )
    }

    // Clean up the URL
    videoUrl = videoUrl.replace(/&amp;/g, "&")

    return NextResponse.json({ videoUrl, thumbnail })
  } catch (error) {
    console.error("[v0] Download error:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
