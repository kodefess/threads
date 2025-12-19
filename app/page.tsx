import { VideoDownloader } from "@/components/video-downloader";
import Link from "next/link";

export default function Home() {
  return (
     <main className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-background overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 grid-background grid-fade dark:grid-background" />

      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Radial glow in center */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <VideoDownloader />
      </div>

      <footer className="relative z-10 mt-8 text-center">
        <p className="text-xs text-muted-foreground/60">
          Made by {" "}
          <Link href='https://threads.com/yuxxeun' className="underline">
            yuxxeun
          </Link> 
          {" "} from <Link href='https://threads.com/kodefess' className="underline">kodefess</Link>.
        </p>
      </footer>
    </main>
  );
}
