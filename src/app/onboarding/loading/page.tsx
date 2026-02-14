"use client";

import { useEffect, Suspense, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?background=f9a8d4&color=fff&size=300&bold=true&name=";

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = (searchParams.get("u") || "").trim();

  const [progress, setProgress] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [phase, setPhase] = useState<"slow" | "fast">("slow");

  // Track readiness of both fetches
  const [photoReady, setPhotoReady] = useState(false);
  const [analyzeReady, setAnalyzeReady] = useState(false);

  // Prevent double-start
  const analyzeStarted = useRef(false);

  /* ------------------------------------------------------------------ */
  /*  Redirect if no username                                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!username) router.replace("/onboarding/track");
  }, [username, router]);

  /* ------------------------------------------------------------------ */
  /*  1) Fetch profile photo (fast — ~5s)                                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!username) return;
    fetch(`/api/profile-photo?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.photoUrl) {
          setProfilePhoto(data.photoUrl);
          try {
            sessionStorage.setItem(`ick_photo_${username}`, data.photoUrl);
          } catch {}
        }
        if (data.fullName) {
          setFullName(data.fullName);
          try {
            sessionStorage.setItem(`ick_name_${username}`, data.fullName);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setPhotoReady(true));
  }, [username]);

  /* ------------------------------------------------------------------ */
  /*  2) Analyze: start → poll → results  (async, no 504)                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!username || analyzeStarted.current) return;
    analyzeStarted.current = true;

    let cancelled = false;

    (async () => {
      try {
        /* --- Step 1: kick off the Apify run --- */
        const startRes = await fetch("/api/analyze/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        if (!startRes.ok) throw new Error("start failed");
        const { runId, datasetId } = await startRes.json();

        /* --- Step 2: poll until SUCCEEDED (every 3 s) --- */
        let status = "RUNNING";
        let finalDatasetId = datasetId;

        while (!cancelled && status !== "SUCCEEDED") {
          await new Promise((r) => setTimeout(r, 3000));

          const pollRes = await fetch(
            `/api/analyze/poll?runId=${encodeURIComponent(runId)}`
          );
          if (!pollRes.ok) throw new Error("poll failed");

          const pollData = await pollRes.json();
          status = pollData.status;
          if (pollData.datasetId) finalDatasetId = pollData.datasetId;

          if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
            throw new Error(`Apify run ${status}`);
          }
        }

        if (cancelled) return;

        /* --- Step 3: fetch results + gender classification --- */
        const resultsRes = await fetch(
          `/api/analyze/results?datasetId=${encodeURIComponent(
            finalDatasetId
          )}&username=${encodeURIComponent(username)}`
        );
        if (!resultsRes.ok) throw new Error("results failed");

        const analysisData = await resultsRes.json();

        if (!cancelled && !analysisData.error) {
          try {
            sessionStorage.setItem(
              `ick_results_${username}`,
              JSON.stringify(analysisData)
            );
          } catch {}
        }
      } catch (err) {
        console.error("Analyze error:", err);
      } finally {
        if (!cancelled) setAnalyzeReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  /* ------------------------------------------------------------------ */
  /*  Switch to fast phase once BOTH photo + analyze are done            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (photoReady && analyzeReady) setPhase("fast");
  }, [photoReady, analyzeReady]);

  // Safety: force fast phase after 70s even if a fetch hangs
  useEffect(() => {
    if (!username) return;
    const timeout = setTimeout(() => setPhase("fast"), 70000);
    return () => clearTimeout(timeout);
  }, [username]);

  /* ------------------------------------------------------------------ */
  /*  Steps                                                              */
  /* ------------------------------------------------------------------ */
  const steps = [
    { label: "Connecting to Instagram...", icon: "cloud" },
    { label: "Finding profile...", icon: "search" },
    { label: "Fetching following list...", icon: "download" },
    { label: "Analyzing recent follows...", icon: "user" },
    { label: "Classifying profiles...", icon: "chart" },
    { label: "Preparing your results...", icon: "shield" },
  ];

  const currentStep =
    progress < 10
      ? 0
      : progress < 25
      ? 1
      : progress < 45
      ? 2
      : progress < 65
      ? 3
      : progress < 85
      ? 4
      : 5;

  /* ------------------------------------------------------------------ */
  /*  Progress bar: slow crawl → fast finish                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!username) return;

    const TICK_MS = 100;
    const SLOW_RATE = 0.08; // ~0.8%/sec → reaches 40% in ~50s
    const FAST_RATE = 3.0;  // ~2s from wherever to 100%
    const CEILING = 40;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        if (phase === "slow" && prev >= CEILING) return prev;
        const rate = phase === "fast" ? FAST_RATE : SLOW_RATE;
        return Math.min(prev + rate, 100);
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [username, phase]);

  /* ------------------------------------------------------------------ */
  /*  Navigate to results once progress hits 100%                        */
  /* ------------------------------------------------------------------ */
  const handleComplete = useCallback(() => {
    router.push(`/onboarding/results?u=${encodeURIComponent(username)}`);
  }, [router, username]);

  useEffect(() => {
    if (progress < 100) return;
    const timer = setTimeout(handleComplete, 400);
    return () => clearTimeout(timer);
  }, [progress, handleComplete]);

  /* ------------------------------------------------------------------ */
  /*  Icon renderer                                                      */
  /* ------------------------------------------------------------------ */
  const renderIcon = (
    type: string,
    isActive: boolean,
    isCompleted: boolean
  ) => {
    if (isCompleted)
      return <span className="text-emerald-500 text-lg font-bold">✓</span>;
    if (isActive)
      return (
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      );

    switch (type) {
      case "cloud":
        return <span className="text-xl">☁️</span>;
      case "search":
        return <span className="text-xl">🔍</span>;
      case "download":
        return <span className="text-xl">📥</span>;
      case "user":
        return <span className="text-xl">👤</span>;
      case "chart":
        return <span className="text-xl">📊</span>;
      case "shield":
        return <span className="text-xl">🛡️</span>;
      default:
        return <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />;
    }
  };

  if (!username) return null;

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 px-6 py-8">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col pt-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analyzing Follows
          </h1>
          <p className="mt-1 text-lg text-gray-500">@{username}</p>
          {fullName && (
            <p className="mt-0.5 text-sm text-gray-400">{fullName}</p>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="mx-auto mb-6 relative">
          <div className="h-32 w-32 rounded-full p-1 bg-pink-100 ring-4 ring-pink-50">
            <div className="h-full w-full rounded-full overflow-hidden bg-gray-200">
              <img
                src={
                  profilePhoto ||
                  `${FALLBACK_AVATAR}${encodeURIComponent(username)}`
                }
                alt={`@${username}`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-semibold text-gray-300 mb-2">
            <span>Progression</span>
            <span className="text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 rounded-full transition-all duration-100 linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-50 border border-blue-100 shadow-sm scale-[1.02]"
                    : "bg-white border border-transparent opacity-60"
                }`}
              >
                <div className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400">
                  {renderIcon(step.icon, isActive, isCompleted)}
                </div>
                <span
                  className={`font-medium ${
                    isActive ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LoadingOnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadingContent />
    </Suspense>
  );
}
