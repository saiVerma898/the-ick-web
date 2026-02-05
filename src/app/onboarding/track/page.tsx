import Link from "next/link";
import Image from "next/image";

export default function TrackOnboardingPage() {
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
          <div className="relative h-8 w-24">
            <Image
              src="/logo.png"
              alt="The Ick"
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
      <div className="mx-auto w-full max-w-md space-y-3">
        <Link
          href="/onboarding/loading"
          className="flex w-full items-center justify-center rounded-[2rem] bg-gray-200 py-4 text-lg font-bold text-gray-400 shadow-none transition-colors hover:bg-pink-300 hover:text-white hover:shadow-lg hover:shadow-pink-200"
        >
          Start The Search
        </Link>
        <Link
          href="/onboarding/features"
          className="block text-center text-sm font-semibold text-gray-500 underline decoration-gray-300 underline-offset-4"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}
