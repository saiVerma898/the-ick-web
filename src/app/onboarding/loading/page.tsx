"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[280px] overflow-hidden rounded-[36px] border-[6px] border-white/20 bg-white/40 backdrop-blur-md ${className}`}
    >
      <div className="absolute top-0 left-1/2 z-20 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-black/20" />
      {children}
    </div>
  );
}

export default function LoadingOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate loading/analysis
    const timer = setTimeout(() => {
      // Could go to a final "analysis complete" or back to start for the demo
      router.push("/onboarding/results");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#ff9a9e] to-[#fad0c4] px-6 text-white">
      {/* Pink Overlay Content */}
      <div className="flex w-full max-w-md flex-col items-center gap-10">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
            The Ick
          </h1>
          <p className="mt-2 text-lg font-medium text-white/90">
            Alex recently followed
          </p>
        </div>

        <PhoneFrame className="aspect-[9/16] w-full max-w-[260px] shadow-2xl">
          <div className="relative h-full w-full p-4">
            {/* Shimmer/Loading Effect */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/10 via-transparent to-black/5" />
            
            {/* Simulated Skeleton Content */}
            <div className="flex flex-col gap-4 pt-10">
              <div className="h-32 w-full rounded-2xl bg-white/30" />
              <div className="h-20 w-full rounded-2xl bg-white/20" />
              <div className="h-40 w-full rounded-2xl bg-white/10" />
            </div>

            {/* Analysis Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <div className="flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-pink-500 shadow-xl backdrop-blur-xl">
                <div className="h-2 w-2 animate-ping rounded-full bg-pink-500" />
                <span className="font-bold">Analyzing...</span>
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}
