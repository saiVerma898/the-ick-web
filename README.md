# The Ick Web App

Mobile-first marketing and onboarding experience for The Ick follow tracker.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_key
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_WEEKLY=price_xxx
APIFY_API_TOKEN=your_apify_token

# TikTok Pixel + Events API
NEXT_PUBLIC_TIKTOK_PIXEL_ID=D6LME7JC77UDVRSEJMU0
TIKTOK_PIXEL_ID=D6LME7JC77UDVRSEJMU0
TIKTOK_ACCESS_TOKEN=your_events_api_access_token
# Optional: send events to TikTok Test Events
TIKTOK_TEST_EVENT_CODE=optional_test_code
```

## Stripe Webhook Setup

To guarantee server-side `CompletePayment` events even when users close the tab before redirect:

1. In Stripe, create a webhook endpoint:
   - URL: `https://www.theickk.com/api/stripe/webhook`
   - Event: `checkout.session.completed`
2. Copy the endpoint signing secret (`whsec_...`) into:
   - `STRIPE_WEBHOOK_SECRET` (Vercel + local `.env.local`)
3. Redeploy after setting the env variable.

## Deployment (Vercel)

1. Create a new project in Vercel and import this repo.
2. Framework preset: Next.js (auto-detected).
3. Build command: `npm run build` (default).
4. Output: `.next` (default).

## Create a GitHub Repo

From the project root:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:<your-username>/<repo-name>.git
git push -u origin main
```
