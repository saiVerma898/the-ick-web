import { loadStripe } from "@stripe/stripe-js";

// TODO: Replace with your actual Stripe Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default stripePromise;
