"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Loader2, LinkIcon, Play, CheckCircle2, X } from "lucide-react"
import { TextEffect } from "@/components/text-effect"
import { BorderTrail } from "@/components/border-trail"
import { InView } from "@/components/in-view"
import { ThreadsLogo } from "@/components/threads-logo"
import { motion, AnimatePresence } from "motion/react"

export function VideoDownloader() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [videoData, setVideoData] = useState<{ videoUrl: string; thumbnail?: string } | null>(null)
  const [downloadComplete, setDownloadComplete] = useState(false)

  const isValidUrl = url.includes("threads.net") || url.includes("threads.com")

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setVideoData(null)
    setDownloadComplete(false)

    if (!url.trim()) {
      setError("Please enter a Threads URL")
      return
    }

    if (!isValidUrl) {
      setError("Please enter a valid Threads URL")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video")
      }

      setVideoData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setUrl("")
    setVideoData(null)
    setError("")
    setDownloadComplete(false)
  }

  const downloadVideo = async () => {
    if (!videoData?.videoUrl) return

    try {
      const response = await fetch(videoData.videoUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `threads-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      setDownloadComplete(true)
    } catch (err) {
      setError("Failed to download video")
    }
  }

  const steps = [
    "Open Threads app and find the video",
    "Tap share button and copy link",
    "Paste the link above",
    'Click "Get Video" to download',
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <ThreadsLogo />
        </div>
        <div className="space-y-2">
          <TextEffect per="char" preset="blur" className="text-4xl font-bold tracking-tight" speedReveal={1.5}>
            Threads Downloader
          </TextEffect>
          <TextEffect per="word" preset="fade" delay={0.3} className="text-muted-foreground text-sm">
            Download videos from Threads instantly
          </TextEffect>
        </div>
      </div>

      {/* Download Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative rounded-2xl bg-card/80 backdrop-blur-sm border border-border p-5"
      >
        {loading && (
          <BorderTrail
            className="bg-gradient-to-l from-foreground via-foreground/50 to-transparent"
            size={80}
            transition={{ duration: 3, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          />
        )}
        <form onSubmit={handleDownload} className="space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste Threads URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="pl-10 h-12 text-base bg-background/50 border-border rounded-xl"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-medium rounded-xl">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Get Video
                  </>
                )}
              </Button>
            </motion.div>

            <AnimatePresence>
              {(videoData || (isValidUrl && url.trim())) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.8, width: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="h-12 px-4 rounded-xl border-border bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </motion.div>

      {/* Video Preview - Compact */}
      <AnimatePresence>
        {videoData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative rounded-2xl bg-card/80 backdrop-blur-sm border border-border overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              {/* Video thumbnail/preview - compact */}
              <div className="relative w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted group cursor-pointer">
                <video
                  src={videoData.videoUrl}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  poster={videoData.thumbnail}
                  muted
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause()
                    e.currentTarget.currentTime = 0
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors pointer-events-none">
                  <Play className="h-5 w-5 text-white fill-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Info and download button */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Video Ready</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Hover to preview</p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={downloadVideo}
                    size="sm"
                    className="w-full rounded-lg"
                    variant={downloadComplete ? "secondary" : "default"}
                  >
                    {downloadComplete ? (
                      <>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to Use - Minimal */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-foreground text-background text-xs font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-xs text-muted-foreground">{step}</span>
            </motion.div>
          ))}
        </div>
      </InView>
    </div>
  )
}
