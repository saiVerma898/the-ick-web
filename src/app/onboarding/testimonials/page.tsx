import Link from "next/link";

const testimonials = [
  {
    quote:
      "This app helped me discover my boyfriend was cheating on me. Literally saved my life!",
    name: "Sarah M.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    quote: "The profile analysis is genius. Love tracking my ex's activity!",
    name: "Jenna R.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
];

function AvatarCircles({ count }: { count: number }) {
  const images = [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  ];

  return (
    <div className="flex items-center -space-x-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white ring-1 ring-black/5"
        >
          <img
            src={images[i % images.length]}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default function TestimonialsOnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#fff5f8] via-[#fff0f5] to-[#ffe6ef] px-6 py-8">
      {/* Header */}
      <div className="mx-auto w-full max-w-md pt-2">
        <div className="flex items-center justify-between">
          <Link
            href="/onboarding/results"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <span className="text-xl">←</span>
          </Link>
          <div className="text-xl font-bold text-pink-300">The Ick</div>
          <div className="w-10" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 py-8">
        {/* Title Section */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-pink-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-pink-400">
              #1 Follow Tracker App
            </span>
          </div>
          <div className="mb-4 text-center text-4xl text-amber-400">
            ⭐⭐⭐⭐⭐
          </div>
          <h1 className="text-3xl font-black leading-tight text-gray-900">
            The Ick was made for people like you
          </h1>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-3 rounded-full bg-white/60 p-2 backdrop-blur-sm">
          <AvatarCircles count={3} />
          <span className="text-sm font-semibold text-gray-600">
            +100K The Ick users
          </span>
        </div>

        {/* Testimonials Cards */}
        <div className="space-y-4">
          {testimonials.map((item, idx) => (
            <div
              key={item.name}
              className={`rounded-[2rem] bg-white p-6 shadow-sm transition-transform ${
                idx % 2 === 0 ? "-rotate-1" : "rotate-1"
              }`}
            >
              <p className="mb-4 text-lg font-medium leading-snug text-gray-700">
                "{item.quote}"
              </p>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-pink-400">{item.name}</span>
                </div>
                <div className="flex gap-0.5 text-amber-400">
                  {"★".repeat(5)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Button */}
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/onboarding/track"
          className="flex w-full items-center justify-center rounded-[2rem] bg-pink-300 py-4 text-lg font-bold text-white shadow-lg shadow-pink-200 transition-transform active:scale-95"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
