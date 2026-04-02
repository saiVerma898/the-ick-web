"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackOnboardingPage() {
  const [username, setUsername] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const router = useRouter();

  const handleStart = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    
    // 1. Show Searching Profile Modal
    setShowSearchModal(true);
    
    // Simulate progress bar for searching
    for (let i = 0; i <= 100; i += 5) {
      setSearchProgress(i);
      await new Promise(r => setTimeout(r, 50)); // Fast progress
    }
    
    // 2. Continue to loading screen (Google auth happens later)
    router.push(`/onboarding/loading?u=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f8f6f8] via-[#f9f1f5] to-[#f9c8d6] px-6 py-8">
      {/* Header */}
      <div className="mx-auto w-full max-w-md pt-2">
        <div className="flex items-center justify-between">
          <Link
            href="/onboarding/testimonials"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="relative h-8 w-24 logo-expand-in">
            <Image
              src="/whotheyfollow.com-removebg-preview.png"
              alt="whotheyfollow.com"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 py-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-black leading-tight text-gray-900">
            Who do you want to track?
          </h1>
          <p className="text-lg text-gray-400">Enter the Instagram username</p>
        </div>

        {/* Input Card */}
        <div className="rounded-[2rem] bg-white p-2 shadow-sm">
          <div className="flex items-center gap-3 rounded-[1.5rem] bg-gray-50 px-6 py-5">
            <span className="text-xl font-medium text-gray-400">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Instagram username"
              className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Secure Badge */}
        <div className="flex items-center gap-4 rounded-[2rem] bg-emerald-50/80 p-5 backdrop-blur-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
            🔒
          </div>
          <div>
            <p className="font-bold text-gray-900">Secure & Anonymous</p>
            <p className="text-sm text-gray-500">No Instagram login required</p>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={handleStart}
          disabled={!username || showSearchModal}
          className={`flex w-full items-center justify-center rounded-[2rem] py-4 text-lg font-bold transition-all shadow-none ${
            username && !showSearchModal
              ? "bg-pink-300 text-white shadow-lg shadow-pink-200"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          Start The Search
        </button>
      </div>

      {/* Searching Profile Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl text-center">
            <h3 className="text-xl font-bold text-gray-900">Searching Profile</h3>
            <p className="mt-2 text-sm text-gray-500">
              Looking up @{username}...
            </p>
            
            <div className="mt-6">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div 
                  className="h-full bg-pink-300 transition-all duration-100 ease-out"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-400">
                {searchProgress}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
