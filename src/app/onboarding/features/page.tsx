import Link from "next/link";
import Image from "next/image";

const benefits = [
  "Get instant alerts the moment your crush follows a new person",
  "Preview recent follows and see the latest activity",
  "View history to track every change over time",
  "Stay safe: no Instagram login, no risks to your account",
];

const steps = [
  "Choose the person you want to track",
  "See their most recent follows (blurred preview included)",
  "Turn on alerts to get notified the second they follow someone new",
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#fff5f8] via-[#fff0f5] to-[#ffe6ef] px-6 py-8">
      <div className="mx-auto w-full max-w-md pt-2">
        <div className="flex items-center justify-between">
          <Link
            href="/onboarding/track"
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
        <section className="rounded-[2rem] bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <h1 className="text-xl font-bold text-gray-900">
            With The Ick you can:
          </h1>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            {benefits.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-pink-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[2rem] bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-xl font-bold text-gray-900">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-gray-700">
            {steps.map((item, index) => (
              <li key={item} className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-500">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mx-auto w-full max-w-md">
        <Link
          href="/onboarding/loading"
          className="flex w-full items-center justify-center rounded-[2rem] bg-pink-300 py-4 text-lg font-bold text-white shadow-lg shadow-pink-200 transition-transform active:scale-95"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
