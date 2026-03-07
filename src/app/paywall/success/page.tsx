"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getTikTokAttributionContext,
  trackTikTokEvent,
} from "@/lib/tiktok-browser";

function PaywallSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "paid" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasTrackedPaymentRef = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        setErrorMessage("Missing session ID.");
        return;
      }

      try {
        const purchaseContentId = sessionId.trim() || "subscription_purchase";
        const dedupEventId = `purchase_${sessionId}`;
        const eventTimeUnix = Math.floor(Date.now() / 1000);
        const { url, ttclid, ttp } = getTikTokAttributionContext();
        const res = await fetch("/api/stripe/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            tiktokEventId: dedupEventId,
            eventTimeUnix,
            url,
            ttclid,
            ttp,
          }),
        });
        const data = await res.json();

        if (!res.ok || data.payment_status !== "paid") {
          throw new Error("Payment not completed.");
        }

        if (!hasTrackedPaymentRef.current) {
          const paidValue =
            typeof data.amount_total === "number"
              ? data.amount_total / 100
              : undefined;
          const paidCurrency =
            typeof data.currency === "string"
              ? data.currency.toUpperCase()
              : "USD";
          const eventProperties: Record<string, unknown> = {
            content_type: "product",
            content_id: purchaseContentId,
            content_name:
              typeof data?.metadata?.contentName === "string"
                ? data.metadata.contentName
                : "subscription",
            currency: paidCurrency,
            url,
            ttclid,
            ttp,
          };

          if (typeof paidValue === "number" && Number.isFinite(paidValue)) {
            eventProperties.value = Number(paidValue.toFixed(2));
          }
          eventProperties.contents = [
            {
              content_id: purchaseContentId,
              content_type: "product",
              content_name:
                typeof data?.metadata?.contentName === "string"
                  ? data.metadata.contentName
                  : "subscription",
              quantity: 1,
              price:
                typeof paidValue === "number" && Number.isFinite(paidValue)
                  ? Number(paidValue.toFixed(2))
                  : undefined,
              currency: paidCurrency,
            },
          ];

          trackTikTokEvent("Purchase", eventProperties, {
            event_id: dedupEventId,
          });
          hasTrackedPaymentRef.current = true;
        }

        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, "users", user.uid), {
            paid: true,
            paidAt: serverTimestamp(),
            stripeCustomerEmail: data.customer_email || null,
          });
        }

        setStatus("paid");

        // Auto-redirect to results with the username
        const savedUsername = localStorage.getItem("ick_tracking_username") || "";
        setTimeout(() => {
          if (savedUsername) {
            router.push(
              `/onboarding/results?u=${encodeURIComponent(savedUsername)}`
            );
          } else {
            router.push("/onboarding/track");
          }
        }, 1500);
      } catch {
        setStatus("error");
        setErrorMessage("Could not verify payment.");
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-pink-300 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-gray-600">
            Verifying payment...
          </p>
        </div>
      )}
      {status === "paid" && (
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-gray-500">Redirecting to your results...</p>
          <div className="mt-4 h-8 w-8 border-4 border-pink-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-red-500 font-medium">{errorMessage}</p>
          <button
            onClick={() => router.push("/paywall")}
            className="mt-4 rounded-2xl bg-black px-6 py-3 text-white font-bold"
          >
            Back to Paywall
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaywallSuccessPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center">Loading...</div>}
    >
      <PaywallSuccessContent />
    </Suspense>
  );
}
