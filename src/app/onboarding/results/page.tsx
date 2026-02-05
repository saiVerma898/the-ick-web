import Link from "next/link";

const statCards = [
  { label: "Followers", value: "1.2K", delta: "-23", tone: "text-rose-500" },
  { label: "Following", value: "512", delta: "+15", tone: "text-emerald-500" },
];

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

export default function ResultsOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f8] via-[#f9f1f5] to-[#f9c8d6] text-[#111111]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-5 pb-16 pt-8 sm:max-w-2xl sm:px-8 lg:max-w-4xl">
        <header className="flex items-center justify-between">
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
            <span className="text-xl">←</span>
          </button>
          <span className="text-lg font-semibold text-pink-300">The Ick</span>
          <div className="h-11 w-11" />
        </header>

        <section className="space-y-6">
          <div className="rounded-[32px] bg-pink-200/60 p-6 text-center text-pink-700">
            <p className="text-4xl font-semibold">The Ick 🤔</p>
            <p className="mt-2 text-sm">Alex recently followed</p>
          </div>
          <PhoneFrame className="bg-white/70">
            <div className="space-y-4 rounded-3xl bg-white p-4">
              <div className="flex items-center justify-between rounded-2xl bg-pink-100 px-4 py-3">
                {statCards.map((card) => (
                  <div key={card.label} className="flex-1 text-center">
                    <p className="text-xs text-black/40">{card.label}</p>
                    <p className={`text-lg font-semibold ${card.tone}`}>
                      {card.value}
                      <span className="ml-1 rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/50">
                        {card.delta}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-lg font-semibold">Who Alex recently followed</p>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200" />
                    <div>
                      <p className="font-semibold text-black/60">cindy.crt</p>
                      <p className="text-xs text-black/40">Tiktok (+80K)</p>
                    </div>
                  </div>
                  <span className="text-xs text-black/40">2 hours ago</span>
                </div>
              </div>
            </div>
          </PhoneFrame>
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              See who they just followed recently
            </h1>
            <Link
              href="/onboarding/testimonials"
              className="mt-4 block w-full rounded-3xl bg-pink-300 py-4 text-lg font-semibold text-white"
            >
              Get Started
            </Link>
            <p className="mt-3 text-xs text-black/50">
              By continuing, you accept our{" "}
              <span className="font-semibold text-black/80">Terms of Use</span>{" "}
              and{" "}
              <span className="font-semibold text-black/80">Privacy Policy</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
