import Link from "next/link";
import Image from "next/image";

// Placeholder for avatars to avoid hydration mismatches with random generation
function AvatarCircles({ count, offset = 0 }: { count: number; offset?: number }) {
  const images = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  ];

  return (
    <div className="flex items-center -space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white ring-1 ring-black/5"
        >
          <img
            src={images[(i + offset) % images.length]}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[40px] border-[8px] border-white bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] ${className}`}
    >
      <div className="absolute top-0 left-1/2 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />
      <div className="h-full w-full bg-[#ffecf2]">{children}</div>
    </div>
  );
}

export default function ResultsOnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-[#ffecf2] to-[#ffdce8] px-6 py-8">
      {/* Top Header */}
      <div className="w-full max-w-md pt-2">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm">
            <span className="text-xl">←</span>
          </div>
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

      {/* Main Content */}
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 py-8">
        <PhoneFrame className="aspect-[9/18]">
          <div className="flex h-full flex-col px-4 pt-12 pb-4">
            {/* Phone Internal Header */}
            <div className="flex justify-center pb-4">
              <div className="relative h-8 w-20">
                <Image
                  src="/logo.png"
                  alt="The Ick"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Profile Card */}
            <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 gap-2">
                  <div className="flex-1 rounded-2xl bg-blue-50 px-3 py-2 text-center">
                    <div className="text-[10px] font-medium text-gray-400">
                      Followers
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-red-500">
                      1.2K
                      <span className="text-[10px] text-red-400">-23</span>
                    </div>
                  </div>
                  <div className="flex-1 rounded-2xl bg-purple-50 px-3 py-2 text-center">
                    <div className="text-[10px] font-medium text-gray-400">
                      Following
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-emerald-500">
                      512
                      <span className="text-[10px] text-emerald-400">+15</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Followed Popover */}
            <div className="relative mt-6">
              <div className="mb-2 text-center text-sm font-bold text-black">
                Alex recently followed
              </div>
              <div className="relative z-10 -rotate-2 rounded-3xl bg-white p-2 shadow-xl">
                {/* Girls Card */}
                <div className="mb-2 flex items-center justify-between rounded-2xl bg-pink-300 px-4 py-3 text-white">
                  <div>
                    <span className="text-2xl font-black">12</span>
                    <span className="ml-1 text-sm font-medium opacity-90">
                      girls
                    </span>
                  </div>
                  <AvatarCircles count={4} offset={0} />
                </div>
                {/* Guys Card */}
                <div className="flex items-center justify-between rounded-2xl bg-blue-300 px-4 py-3 text-white">
                  <div>
                    <span className="text-2xl font-black">8</span>
                    <span className="ml-1 text-sm font-medium opacity-90">
                      guys
                    </span>
                  </div>
                  <AvatarCircles count={4} offset={4} />
                </div>
              </div>
            </div>

            {/* List Item */}
            <div className="mt-8">
              <div className="mb-2 text-xs font-semibold text-gray-400">
                Who Alex recently followed
              </div>
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-700">cindy.crt</div>
                  <div className="text-xs text-gray-400">Tiktok (+80k)</div>
                </div>
                <div className="text-xs text-gray-400">2h ago</div>
              </div>
            </div>
          </div>
        </PhoneFrame>

        <div className="text-center">
          <h1 className="max-w-[200px] text-2xl font-bold leading-tight text-gray-900">
            See who they just followed recently
          </h1>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/onboarding/testimonials"
          className="flex w-full items-center justify-center rounded-[2rem] bg-pink-300 py-4 text-lg font-bold text-white shadow-lg shadow-pink-200 transition-transform active:scale-95"
        >
          Get Started
        </Link>
        <div className="px-8 text-center text-[10px] text-gray-400">
          By continuing, you accept our{" "}
          <Link href="#" className="font-semibold text-gray-600 underline">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="#" className="font-semibold text-gray-600 underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
