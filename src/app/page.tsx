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
      router.push("/onboarding/testimonials");
    }, 2500); // 2.5 seconds delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fff5f8] via-[#fff0f5] to-[#ffe6ef]">
      <div
        className={`relative h-96 w-96 transition-all duration-1000 ease-out ${
          mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <Image
          src="/whotheyfollow.com-removebg-preview.png"
          alt="whotheyfollow.com"
          fill
          className="object-contain animate-pulse"
          priority
        />
      </div>
    </div>
  );
}
