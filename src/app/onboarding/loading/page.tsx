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
      className={`relative mx-auto w-full max-w-[320px] rounded-[36px] border border-pink-100 bg-white/80 p-4 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.45)] backdrop-blur ${className}`}
    >
      <div className="mx-auto mb-3 h-6 w-24 rounded-full bg-black/80" />
      {children}
    </div>
  );
}

export default function LoadingOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding/track");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7c5d6] via-[#f3bfd1] to-[#f3b6cc] text-[#111111]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-5 pb-16 pt-8 sm:max-w-2xl sm:px-8 lg:max-w-4xl">
        <header className="flex items-center justify-between">
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white/80 shadow-sm">
            <span className="text-xl">←</span>
          </button>
          <span className="text-lg font-semibold text-white/80">The Ick</span>
          <div className="h-11 w-11" />
        </header>

        <section className="space-y-8">
          <div className="rounded-[32px] bg-white/30 p-6 text-center text-white">
            <p className="text-3xl font-semibold">The Ick</p>
            <p className="mt-2 text-sm text-white/80">
              Alex recently followed
            </p>
          </div>

          <PhoneFrame className="bg-white/30">
            <div className="relative overflow-hidden rounded-3xl bg-white/40 p-6">
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white/70" />
              <div className="relative space-y-4">
                <div className="h-40 rounded-3xl bg-white/50" />
                <div className="h-24 rounded-3xl bg-white/40" />
                <div className="h-32 rounded-3xl bg-white/30" />
              </div>
              <div className="relative mt-6 flex items-center justify-center">
                <div className="rounded-full bg-white/70 px-5 py-2 text-sm font-semibold text-pink-500">
                  Analyzing...
                </div>
              </div>
            </div>
          </PhoneFrame>
        </section>
      </div>
    </div>
  );
}
