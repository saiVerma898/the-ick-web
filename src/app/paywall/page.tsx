"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  createTikTokEventId,
  getTikTokAttributionContext,
  trackTikTokEvent,
} from "@/lib/tiktok-browser";

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "weekly">("yearly");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const hasTrackedViewContentRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hasTrackedViewContentRef.current) {
      return;
    }

    const { url, ttclid, ttp } = getTikTokAttributionContext();
    const viewContentEventId = createTikTokEventId("viewcontent_paywall");

    trackTikTokEvent(
      "ViewContent",
      {
        content_type: "product",
        content_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || "yearly_plan",
        content_name: "yearly_subscription",
        quantity: 1,
        value: 44.99,
        currency: "USD",
        url,
        ttclid,
        ttp,
      },
      { event_id: viewContentEventId }
    );

    hasTrackedViewContentRef.current = true;
  }, []);

  const handleCheckout = async () => {
    setCheckoutError("");
    setIsCheckoutLoading(true);

    const priceId =
      selectedPlan === "yearly"
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY;
    const planValue = selectedPlan === "yearly" ? 44.99 : 11.99;
    const planContentName =
      selectedPlan === "yearly" ? "yearly_subscription" : "weekly_subscription";
    const checkoutEventId = createTikTokEventId("initiate_checkout");
    const eventTimeUnix = Math.floor(Date.now() / 1000);
    const { url, ttclid, ttp } = getTikTokAttributionContext();

    if (!priceId) {
      setCheckoutError("Stripe price ID is not configured.");
      setIsCheckoutLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId,
          tiktokEventId: checkoutEventId,
          value: planValue,
          currency: "USD",
          contentName: planContentName,
          eventTimeUnix,
          url,
          ttclid,
          ttp,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        const message = data?.details || data?.error || "Checkout failed";
        throw new Error(message);
      }

      trackTikTokEvent(
        "InitiateCheckout",
        {
          content_type: "product",
          content_id: priceId,
          content_name: planContentName,
          quantity: 1,
          value: planValue,
          currency: "USD",
          url,
          ttclid,
          ttp,
        },
        { event_id: checkoutEventId }
      );

      window.location.href = data.url;
    } catch (error) {
      setCheckoutError((error as Error).message || "Checkout failed.");
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/onboarding/results" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <span className="text-xl">←</span>
        </Link>
        <span className="text-gray-400 font-medium">Restore</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-black leading-tight">Unlock The Ick</h1>
          <h2 className="text-2xl font-black text-pink-300 mt-1">#1 Follow Tracker App</h2>
        </div>

        {/* Features */}
        <div className="space-y-6 mb-10 px-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full border-2 border-black flex items-center justify-center shrink-0">
              🔒
            </div>
            <p className="text-sm font-medium text-black">
              100% anonymous & secure –<br />No login required
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full border-2 border-black flex items-center justify-center shrink-0">
              🕒
            </div>
            <p className="text-sm font-medium text-black">
              View recent follows in<br />chronological order
            </p>
          </div>
        </div>

        {/* Exclusive Offer Banner */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-zinc-900 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="text-lg">🏷️</span>
              <span className="font-bold">EXCLUSIVE OFFER</span>
            </div>
            <div className="h-6 w-12 rounded-full bg-white/20 p-1">
              <div className="h-4 w-4 rounded-full bg-white" />
            </div>
          </div>
          {/* Blur effect */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-pink-500/30 blur-xl" />
        </div>

        {/* Plan Selection */}
        <div className="space-y-3 mb-8">
          {/* Yearly Plan */}
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all ${
              selectedPlan === "yearly"
                ? "border-black bg-gray-50 ring-1 ring-black"
                : "border-gray-200 bg-white"
            }`}
          >
            {selectedPlan === "yearly" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-zinc-800 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                Unlimited
              </div>
            )}
            {selectedPlan === "yearly" && (
               <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black text-white flex items-center justify-center text-xs">✓</div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-black">Yearly</p>
                <p className="text-sm font-medium text-gray-500">12mo • $44.99</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-black">$0.87/wk</p>
              </div>
            </div>
          </button>

          {/* Weekly Plan */}
          <button
            onClick={() => setSelectedPlan("weekly")}
            className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all ${
              selectedPlan === "weekly"
                ? "border-black bg-gray-50 ring-1 ring-black"
                : "border-gray-200 bg-white"
            }`}
          >
             {selectedPlan === "weekly" && (
               <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black text-white flex items-center justify-center text-xs">✓</div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-gray-400">Weekly</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-400">$11.99/wk</p>
              </div>
            </div>
          </button>
        </div>

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-black text-sm">🛡️</span>
          <p className="text-xs font-medium text-black">Cancel anytime, no commitments</p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleCheckout}
          disabled={isCheckoutLoading}
          className={`w-full rounded-2xl py-4 text-xl font-bold text-white shadow-lg transition-transform ${
            isCheckoutLoading ? "bg-gray-300" : "bg-black active:scale-95"
          }`}
        >
          {isCheckoutLoading ? "Starting Checkout..." : "Start My Journey"}
        </button>
        {checkoutError ? (
          <p className="mt-3 text-center text-sm text-rose-500">{checkoutError}</p>
        ) : null}
      </div>
    </div>
  );
}
