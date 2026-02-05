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
      className={`relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[40px] border-[8px] border-white bg-[#fff0f5] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] ${className}`}
    >
      <div className="absolute top-0 left-1/2 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black" />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

export default function ResultsOnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-[#fff5f8] via-[#fff0f5] to-[#ffe6ef] px-6 py-4 sm:py-8">
      {/* Top Header removed as per request */}
      
      {/* Main Content */}
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 py-2 sm:gap-8 sm:py-8">
        <PhoneFrame className="aspect-[9/18] w-full max-w-[280px] sm:max-w-[300px]">
          <div className="relative flex h-full flex-col px-4 pt-10 pb-4">
            
            {/* Phone Internal Header - Pink Text */}
            <div className="flex justify-center pb-4">
               <h3 className="text-2xl font-black tracking-tight text-pink-400">
                The Ick
              </h3>
            </div>

            {/* Profile Card - Single Wide Card */}
            <div className="rounded-[2rem] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                
                {/* Followers */}
                <div className="flex flex-col items-center rounded-2xl bg-gray-50 px-3 py-2">
                    <div className="text-[10px] font-medium text-gray-400">
                      Followers
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-red-500">1.2K</span>
                      <span className="text-[10px] font-bold text-red-400">-23</span>
                    </div>
                </div>

                 {/* Following */}
                <div className="flex flex-col items-center rounded-2xl bg-gray-50 px-3 py-2">
                    <div className="text-[10px] font-medium text-gray-400">
                      Following
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-emerald-500">512</span>
                      <span className="text-[10px] font-bold text-emerald-400">+15</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Recently Followed Section */}
            <div className="mt-6">
                <div className="mb-3 text-center text-sm font-bold text-black">
                    Alex recently followed
                </div>
                
                {/* Rotated Container Card */}
                <div className="-rotate-2 transform rounded-[2rem] bg-white p-3 shadow-lg transition-transform hover:rotate-0">
                    <div className="space-y-2">
                        {/* Girls Pill - Pink */}
                        <div className="flex items-center justify-between rounded-full bg-pink-300 px-4 py-3 text-white shadow-sm">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black">12</span>
                                <span className="text-sm font-medium opacity-90">girls</span>
                            </div>
                            <AvatarCircles count={4} offset={0} />
                        </div>

                        {/* Guys Pill - Blue */}
                        <div className="flex items-center justify-between rounded-full bg-blue-300 px-4 py-3 text-white shadow-sm">
                             <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black">8</span>
                                <span className="text-sm font-medium opacity-90">guys</span>
                            </div>
                            <AvatarCircles count={4} offset={4} />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Item */}
            <div className="mt-6 flex-1">
                <div className="mb-2 text-xs font-semibold text-gray-400">
                    Who Alex recently followed
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                        alt="User"
                        className="h-full w-full object-cover"
                    />
                    </div>
                    <div className="flex-1">
                    <div className="font-bold text-gray-800">cindy.crt</div>
                    <div className="text-xs text-gray-400">Tiktok (+80k)</div>
                    </div>
                    <div className="text-xs text-gray-400">2h ago</div>
                </div>
            </div>

          </div>
        </PhoneFrame>

        <div className="text-center">
          <h1 className="max-w-[240px] text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
            See who they just followed recently
          </h1>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="w-full max-w-md space-y-3 pb-2">
        <Link
          href="/onboarding/testimonials"
          className="flex w-full items-center justify-center rounded-[2rem] bg-pink-300 py-3.5 text-lg font-bold text-white shadow-lg shadow-pink-200 transition-transform active:scale-95 sm:py-4"
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
