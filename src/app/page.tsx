import Link from "next/link";

const onboardingLinks = [
  {
    title: "Track screen",
    description: "Username input + secure & anonymous message.",
    href: "/onboarding/track",
  },
  {
    title: "Testimonials screen",
    description: "Ratings, users, and social proof.",
    href: "/onboarding/testimonials",
  },
  {
    title: "Results screen",
    description: "Recent follows and CTA to get started.",
    href: "/onboarding/results",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f8] via-[#f9f1f5] to-[#f9c8d6] text-[#111111]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-16 pt-10 sm:max-w-2xl sm:px-8">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-300">
            The Ick
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Onboarding screens
          </h1>
          <p className="mt-3 text-base text-black/60">
            Each screen lives on its own route so you can preview them
            independently.
          </p>
        </header>

        <div className="space-y-4">
          {onboardingLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-3xl border border-black/10 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-black/60">{item.description}</p>
            </Link>
          ))}
        </div>

        <Link
          href="/onboarding/track"
          className="w-full rounded-3xl bg-pink-300 py-4 text-center text-lg font-semibold text-white shadow-sm"
        >
          Start with track screen
        </Link>
      </div>
    </div>
  );
}
