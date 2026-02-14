"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { analyzeProfile, type AnalysisResult, type FollowProfile } from "@/lib/service";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?background=f9a8d4&color=fff&size=300&bold=true&name=";

/** Route Instagram CDN URLs through our server-side proxy to avoid CORS blocks */
function proxyPic(url: string | undefined | null): string | null {
  if (!url) return null;
  // Only proxy external URLs (Instagram CDN etc.)
  if (url.startsWith("http")) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/* --------------------------------------------------------------- */
/*  Profile card component                                          */
/* --------------------------------------------------------------- */
function ProfileCard({ profile }: { profile: FollowProfile }) {
  const [imgError, setImgError] = useState(false);

  const genderColor =
    profile.gender === "female"
      ? "bg-pink-100 text-pink-600"
      : profile.gender === "male"
      ? "bg-blue-100 text-blue-600"
      : "";

  const avatarSrc =
    !imgError && profile.profilePicUrl
      ? proxyPic(profile.profilePicUrl)
      : null;

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
      {/* Avatar */}
      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
        <img
          src={
            avatarSrc ||
            `${FALLBACK_AVATAR}${encodeURIComponent(profile.username)}`
          }
          alt={profile.username}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-900 text-sm truncate">
            {profile.username}
          </span>
          {profile.isVerified && (
            <svg
              className="h-4 w-4 shrink-0 text-blue-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
        </div>
        {profile.fullName && (
          <p className="text-xs text-gray-500 truncate">{profile.fullName}</p>
        )}
      </div>

      {/* Gender pill */}
      {profile.gender !== "unknown" && (
        <span
          className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${genderColor}`}
        >
          {profile.gender === "female" ? "Girl" : "Guy"}
        </span>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- */
/*  Loading skeleton                                                */
/* --------------------------------------------------------------- */
function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-white rounded-2xl p-3"
        >
          <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- */
/*  Main content                                                    */
/* --------------------------------------------------------------- */
function ResultsContent() {
  const searchParams = useSearchParams();
  const username = (searchParams.get("u") || "").trim();
  const router = useRouter();

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  /* ---------- Redirect if no username ----------------------------- */
  useEffect(() => {
    if (!username) router.replace("/onboarding/track");
  }, [username, router]);

  /* ---------- Fetch profile photo --------------------------------- */
  useEffect(() => {
    if (!username) return;

    // Check sessionStorage cache first
    const cachedPhoto = sessionStorage.getItem(`ick_photo_${username}`);
    const cachedName = sessionStorage.getItem(`ick_name_${username}`);
    if (cachedPhoto) setProfilePhoto(cachedPhoto);
    if (cachedName) setFullName(cachedName);

    if (!cachedPhoto) {
      fetch(`/api/profile-photo?username=${encodeURIComponent(username)}`)
        .then((res) => res.json())
        .then((d) => {
          if (d.photoUrl) {
            setProfilePhoto(d.photoUrl);
            sessionStorage.setItem(`ick_photo_${username}`, d.photoUrl);
          }
          if (d.fullName) {
            setFullName(d.fullName);
            sessionStorage.setItem(`ick_name_${username}`, d.fullName);
          }
        })
        .catch(() => {});
    }
  }, [username]);

  /* ---------- Fetch analysis data (with cache) -------------------- */
  useEffect(() => {
    if (!username) return;

    // Check sessionStorage cache
    const cached = sessionStorage.getItem(`ick_results_${username}`);
    if (cached) {
      try {
        setData(JSON.parse(cached));
        setIsLoading(false);
        return;
      } catch {
        /* corrupted cache, re-fetch */
      }
    }

    setIsLoading(true);
    setError(false);
    analyzeProfile(username)
      .then((result) => {
        setData(result);
        sessionStorage.setItem(
          `ick_results_${username}`,
          JSON.stringify(result)
        );
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [username]);

  /* ---------- Firebase auth state --------------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId(null);
        setIsPaid(false);
        return;
      }

      setUserId(user.uid);
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        await setDoc(
          userRef,
          {
            email: user.email || null,
            name: user.displayName || null,
            photoURL: user.photoURL || null,
            paid: false,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
        setIsPaid(false);
      } else {
        const userData = snapshot.data();
        setIsPaid(Boolean(userData?.paid));
        await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
      }
    });

    return () => unsubscribe();
  }, []);

  /* ---------- Save search to Firestore ---------------------------- */
  useEffect(() => {
    if (!data || !userId) return;
    const saveKey = `${userId}-${data.username}-${data.recentFollows.total}`;
    if (lastSavedKey === saveKey || isSavingSearch) return;

    const saveSearch = async () => {
      setIsSavingSearch(true);
      try {
        const searchesRef = collection(db, "users", userId, "searches");
        await addDoc(searchesRef, {
          username: data.username,
          result: data,
          locked: !isPaid,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "users", userId), {
          lastSearchAt: serverTimestamp(),
          lastSearchUsername: data.username,
        });
        setLastSavedKey(saveKey);
      } catch {
        // silent
      } finally {
        setIsSavingSearch(false);
      }
    };

    saveSearch();
  }, [data, userId, lastSavedKey, isSavingSearch, isPaid]);

  /* ---------- Derived values -------------------------------------- */
  const isLocked = !isPaid;

  const girlCount = data?.recentFollows.girls ?? 0;
  const guyCount = data?.recentFollows.guys ?? 0;
  const totalCount = data?.recentFollows.total ?? 0;
  const profiles = data?.recentFollows.profiles ?? [];
  const previewProfiles = profiles.slice(0, 4);

  /* ---------- Handlers -------------------------------------------- */
  const handleUnlock = async () => {
    // Save username so we can redirect back after payment
    localStorage.setItem("ick_tracking_username", username);
    setAuthError("");
    setIsAuthLoading(true);
    try {
      if (!auth.currentUser) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
      router.push("/paywall");
    } catch {
      setAuthError("Google sign-in failed. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (!username) return null;

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="px-6 pt-8 pb-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Analyzing Follows
          </h1>
          <p className="text-base text-gray-400 mt-0.5">@{username}</p>
          {fullName && (
            <p className="text-sm text-gray-400 mt-0.5">{fullName}</p>
          )}
        </div>

        {/* Profile photo */}
        <div className="mx-auto mb-6">
          <div className="mx-auto h-28 w-28 rounded-full p-1 bg-pink-100 ring-4 ring-pink-50">
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
      </div>

      {/* ---- Stats cards (always visible) ---- */}
      {!isLoading && data && (
        <div className="px-6 mb-4 flex gap-3">
          <div className="flex-1 bg-pink-200 rounded-2xl p-3 text-center shadow-sm">
            <p className="text-3xl font-black text-white">{girlCount}</p>
            <p className="text-sm font-bold text-white/80 mt-0.5">Girls</p>
          </div>
          <div className="flex-1 bg-blue-300 rounded-2xl p-3 text-center shadow-sm">
            <p className="text-3xl font-black text-white">{guyCount}</p>
            <p className="text-sm font-bold text-white/80 mt-0.5">Guys</p>
          </div>
          <div className="flex-1 bg-gray-200 rounded-2xl p-3 text-center shadow-sm">
            <p className="text-3xl font-black text-gray-700">{totalCount}</p>
            <p className="text-sm font-bold text-gray-500 mt-0.5">Total</p>
          </div>
        </div>
      )}

      {/* ---- Section heading ---- */}
      <div className="px-6 mb-3">
        <h2 className="text-xl font-bold text-gray-900">Recent follows</h2>
      </div>

      {/* ---- Main content area ---- */}
      <div className="flex-1 px-6 pb-32">
        {/* Loading */}
        {isLoading && <Skeleton />}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">Failed to load results.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-pink-300 text-white rounded-full font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* ---------- PRE-PAYMENT: preview + locked overlay ---------- */}
        {!isLoading && data && isLocked && (
          <div className="relative">
            {/* First 4 profiles visible */}
            <div className="space-y-2.5">
              {previewProfiles.map((p) => (
                <ProfileCard key={p.username} profile={p} />
              ))}
            </div>

            {/* Blurred extra profiles */}
            {profiles.length > 4 && (
              <div className="mt-2.5 blur-sm opacity-60 select-none pointer-events-none space-y-2.5">
                {profiles.slice(4, 7).map((p) => (
                  <ProfileCard key={p.username} profile={p} />
                ))}
              </div>
            )}

            {/* Lock overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent flex items-end justify-center pb-4">
              <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-md border border-gray-100">
                <span className="text-gray-400 text-lg">🔒</span>
                <span className="text-sm font-semibold text-gray-600">
                  Pay to see all {totalCount} follows
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------- POST-PAYMENT: full following list -------------- */}
        {!isLoading && data && !isLocked && (
          <div className="space-y-2.5">
            {profiles.map((p, i) => (
              <ProfileCard key={`${p.username}-${i}`} profile={p} />
            ))}

            {profiles.length === 0 && (
              <p className="text-center text-gray-400 py-10">
                No followings found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- Bottom CTA (sticky) ---- */}
      {isLocked && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50/80 backdrop-blur-md px-6 pb-8 pt-4">
          <button
            onClick={handleUnlock}
            disabled={isAuthLoading}
            className={`w-full rounded-2xl py-4 text-xl font-bold text-white shadow-lg transition-all ${
              isAuthLoading
                ? "bg-pink-200"
                : "bg-pink-400 active:scale-[0.98] shadow-pink-200"
            }`}
          >
            {isAuthLoading ? "Unlocking..." : "Start Tracking"}
          </button>
          {authError && (
            <p className="text-red-500 text-center mt-2 text-sm">
              {authError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Page wrapper with Suspense                                        */
/* ================================================================== */
export default function ResultsOnboardingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
