"use client";

import Link from "next/link";

export default function PaywallCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-2xl font-bold text-black">Payment canceled</h1>
      <p className="mt-2 text-gray-500">You can try again anytime.</p>
      <Link
        href="/paywall"
        className="mt-6 rounded-2xl bg-black px-6 py-3 text-white font-bold"
      >
        Back to Paywall
      </Link>
    </div>
  );
}
