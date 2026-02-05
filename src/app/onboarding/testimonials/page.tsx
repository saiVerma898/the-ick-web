import Link from "next/link";

const testimonials = [
  {
    quote:
      "This app helped me discover my boyfriend was cheating on me. Literally saved my life!",
    name: "Sarah M.",
  },
  {
    quote: "The profile analysis is genius. Love tracking my ex's activity!",
    name: "Jenna R.",
  },
];

function AvatarStack({ count }: { count: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-9 w-9 -ml-2 rounded-full border-2 border-white bg-gradient-to-br from-pink-200 via-rose-200 to-purple-200 first:ml-0"
        />
      ))}
    </div>
  );
}

export default function TestimonialsOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f8] via-[#f9f1f5] to-[#f9c8d6] text-[#111111]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-5 pb-16 pt-8 sm:max-w-2xl sm:px-8 lg:max-w-4xl">
        <header className="flex items-center justify-between">
          <Link
            href="/onboarding/results"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm"
          >
            <span className="text-xl">←</span>
          </Link>
          <span className="text-lg font-semibold text-pink-300">The Ick</span>
          <div className="h-11 w-11" />
        </header>

        <section className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-300">
              The Ick
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              #1 Follow Tracker App
            </h1>
          </div>
          <div className="flex justify-center">
            <div className="rounded-3xl bg-white/90 px-6 py-3 text-2xl shadow-sm">
              ⭐⭐⭐⭐⭐
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-center text-2xl font-semibold">
              The Ick was made for people like you
            </h2>
            <div className="mt-6 flex items-center justify-center gap-3">
              <AvatarStack count={3} />
              <span className="text-sm text-black/50">+100K The Ick users</span>
            </div>
          </div>
          <div className="space-y-4">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-3xl bg-white px-6 py-5 shadow-sm"
              >
                <p className="text-base italic text-black/70">
                  “{item.quote}”
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200" />
                    <span className="font-semibold text-pink-300">
                      {item.name}
                    </span>
                  </div>
                  <span>⭐️⭐️⭐️⭐️⭐️</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/onboarding/loading"
            className="block w-full rounded-3xl bg-pink-300 py-4 text-center text-lg font-semibold text-white shadow-sm"
          >
            Continue
          </Link>
        </section>
      </div>
    </div>
  );
}
