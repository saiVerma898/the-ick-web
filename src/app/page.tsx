"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      router.push("/onboarding/results");
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fff5f8] via-[#fff0f5] to-[#ffe6ef]">
      <div
        className={`relative h-64 w-64 transition-all duration-1000 ease-out ${
          mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <Image
          src="/grok-image-515f0dc2-3515-408e-b7ee-694b7ed4c4d4.png"
          alt="The Ick"
          fill
          className="object-contain animate-pulse"
          priority
        />
      </div>
    </div>
  );
}
