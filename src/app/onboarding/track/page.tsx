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

export default function TrackOnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f8] via-[#f9f1f5] to-[#f9c8d6] text-[#111111]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-5 pb-16 pt-8 sm:max-w-2xl sm:px-8 lg:max-w-5xl">
        <header className="flex items-center justify-between">
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
            <span className="text-xl">←</span>
          </button>
          <span className="text-lg font-semibold text-pink-300">The Ick</span>
          <div className="h-11 w-11" />
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Who do you want to track?
            </h1>
            <p className="text-base text-black/50">
              Enter the Instagram username
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4 text-black/40">
              <span className="text-lg">@</span>
              <span className="text-base">Instagram username</span>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 px-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-200 text-emerald-700">
                🔒
              </div>
              <div>
                <p className="font-semibold">Secure & Anonymous</p>
                <p className="text-sm text-black/50">
                  No Instagram login required
                </p>
              </div>
            </div>
            <button className="w-full rounded-2xl bg-black/10 py-4 text-base font-semibold text-black/35">
              Start The Search
            </button>
          </div>
          <PhoneFrame>
            <div className="space-y-4 rounded-3xl bg-gradient-to-b from-pink-100 via-white to-white p-4">
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200" />
                <div className="flex-1 px-3">
                  <p className="text-xs text-black/40">Followers</p>
                  <p className="text-lg font-semibold text-rose-500">1.2K</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-black/40">Following</p>
                  <p className="text-lg font-semibold text-emerald-500">512</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-lg font-semibold">Alex recently followed</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-pink-100 px-4 py-3">
                    <span className="text-2xl font-bold">12</span>
                    <span className="text-sm font-semibold">girls</span>
                    <AvatarStack count={5} />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-blue-100 px-4 py-3">
                    <span className="text-2xl font-bold">8</span>
                    <span className="text-sm font-semibold">guys</span>
                    <AvatarStack count={4} />
                  </div>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </section>
      </div>
    </div>
  );
}
