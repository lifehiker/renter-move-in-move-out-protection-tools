# Forge Completion Audit

Last updated: 2026-05-14

This maps each major PRD requirement to the routes, components, actions, and helpers that implement it.

## Foundation and deploy

| Requirement | Implementation |
|---|---|
| Next.js App Router app with standalone output | `next.config.ts` |
| Tailwind/global visual system and responsive layout | `src/app/globals.css`, `src/components/ui-shell.tsx` |
| Production Docker image for standalone Next app + Prisma runtime init | `Dockerfile` |
| Prisma client and app DB access | `src/lib/db.ts`, `prisma/schema.prisma` |
| Default checklist seed data | `prisma/seed.ts` |

## Data model

| Requirement | Implementation |
|---|---|
| Users, accounts, sessions, verification tokens | `prisma/schema.prisma` models `User`, `Account`, `Session`, `VerificationToken` |
| Property with address, lease dates, rent, deposit, utility categories | `prisma/schema.prisma` model `Property` |
| Household members and placeholder roommates | `prisma/schema.prisma` model `HouseholdMember` |
| Recurring shared bills and monthly occurrences | `prisma/schema.prisma` models `RecurringBill`, `BillOccurrence` |
| One-off shared expenses | `prisma/schema.prisma` model `Expense` |
| Checklist templates and property checklist items | `prisma/schema.prisma` models `ChecklistTemplate`, `ChecklistItem` |
| Photo evidence with capture/upload/EXIF timestamps | `prisma/schema.prisma` model `PhotoAsset` |
| Issue logging with severity | `prisma/schema.prisma` model `IssueNote` |
| Reports, share links, and subscriptions | `prisma/schema.prisma` models `Report`, `ShareLink`, `Subscription` |

## Auth and session handling

| Requirement | Implementation |
|---|---|
| NextAuth v5 setup | `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` |
| Google sign-in when credentials exist | `src/auth.ts`, `src/lib/env.ts` |
| Credential-free demo mode | `src/components/sign-in-panel.tsx`, `src/app/sign-in/page.tsx` |
| Protected app routes and current-user lookup | `src/lib/session.ts`, `src/app/(app)/layout.tsx` |
| Sign-out UX in the app shell | `src/components/ui-shell.tsx`, `src/app/actions/app-actions.ts:signOutUser` |

## Onboarding and property setup

| Requirement | Implementation |
|---|---|
| First-run onboarding flow | `src/app/(app)/onboarding/page.tsx`, `src/app/actions/app-actions.ts:completeOnboarding` |
| Create property with default checklist + placeholder roommates | `src/lib/app-data.ts:createPropertyWithDefaults`, `src/lib/app-data.ts:ensureDefaultChecklistItems` |
| Property details editing, including utility categories | `src/app/(app)/properties/[propertyId]/page.tsx`, `src/app/actions/app-actions.ts:updatePropertyDetails` |
| Roommate placeholders and invite fallback | `src/app/actions/app-actions.ts:addRoommate`, `src/app/actions/app-actions.ts:sendInviteFallback` |

## Bills, balances, and household finance

| Requirement | Implementation |
|---|---|
| Recurring bills with equal/fixed/percentage splits | `src/app/(app)/properties/[propertyId]/expenses/page.tsx`, `src/app/actions/app-actions.ts:saveRecurringBill`, `src/lib/app-data.ts:computeShareBreakdown` |
| Monthly occurrence generation | `src/lib/app-data.ts:ensureMonthlyOccurrences`, `src/lib/app-data.ts:getUpcomingOccurrences` |
| One-off expenses with payer tracking | `src/app/(app)/properties/[propertyId]/expenses/page.tsx`, `src/app/actions/app-actions.ts:saveExpense` |
| Dashboard balance summary and usage cards | `src/app/(app)/dashboard/page.tsx`, `src/lib/app-data.ts:calculateBalances`, `src/lib/app-data.ts:getUsageSummary` |
| Recent activity feed | `src/app/(app)/dashboard/page.tsx`, `src/lib/app-data.ts:getRecentActivity` |
| Prorated rent/utilities calculator | `src/components/prorated-calculator.tsx`, `src/app/prorated-rent-calculator/page.tsx`, `src/app/(app)/properties/[propertyId]/expenses/page.tsx` |

## Checklist, notes, and photos

| Requirement | Implementation |
|---|---|
| Room-by-room renter checklist | `src/app/(app)/properties/[propertyId]/checklist/page.tsx`, `src/lib/checklist.ts`, `src/lib/app-data.ts:groupChecklistByRoom` |
| Checklist status updates and custom items | `src/app/actions/app-actions.ts:saveChecklistItem` |
| Issue logging with severity | `src/app/actions/app-actions.ts:saveIssueNote`, `src/app/(app)/properties/[propertyId]/checklist/page.tsx` |
| Photo upload with EXIF extraction and timestamp baseline | `src/app/actions/app-actions.ts:uploadPhoto`, `src/lib/storage.ts` |
| S3-compatible storage with inline local fallback | `src/lib/storage.ts`, `src/lib/env.ts` |
| Photo evidence display in app and shared views | `src/app/(app)/properties/[propertyId]/checklist/page.tsx`, `src/app/shared/[token]/page.tsx` |

## Reports, PDF export, sharing, and email

| Requirement | Implementation |
|---|---|
| Move-in and move-out report creation | `src/app/actions/app-actions.ts:createReport`, `src/app/(app)/properties/[propertyId]/reports/page.tsx` |
| Snapshot-based report data assembly | `src/lib/app-data.ts:createReportSnapshot` |
| PDF export route | `src/app/api/reports/[reportId]/pdf/route.tsx` |
| Free-tier watermarking | `src/app/actions/app-actions.ts:createReport`, `src/app/api/reports/[reportId]/pdf/route.tsx` |
| Read-only share links | `src/app/actions/app-actions.ts:createPublicShareLink`, `src/lib/app-data.ts:createShareLink`, `src/app/shared/[token]/page.tsx` |
| Public/shared PDF access only through valid share token | `src/app/api/reports/[reportId]/pdf/route.tsx` |
| Email delivery with graceful fallback | `src/lib/email.ts`, `src/app/actions/app-actions.ts:emailReport`, `src/app/(app)/properties/[propertyId]/reports/page.tsx` |

## Billing and plan enforcement

| Requirement | Implementation |
|---|---|
| Free plan limits | `src/lib/plans.ts`, enforced in `src/app/actions/app-actions.ts` |
| Billing page and upgrade flow | `src/app/(app)/settings/billing/page.tsx`, `src/app/actions/app-actions.ts:startUpgradeCheckout` |
| Stripe checkout when configured | `src/lib/payments.ts`, `src/app/actions/app-actions.ts:startUpgradeCheckout` |
| Local Pro preview fallback when Stripe is missing | `src/app/actions/app-actions.ts:startUpgradeCheckout` |
| Stripe webhook handling | `src/app/api/stripe/webhook/route.ts` |

## Marketing, SEO, and public pages

| Requirement | Implementation |
|---|---|
| Homepage | `src/app/page.tsx` |
| Product landing pages | `src/app/security-deposit-app/page.tsx`, `src/app/move-in-checklist-app/page.tsx`, `src/app/renter-photo-log/page.tsx`, `src/app/roommate-bill-split/page.tsx`, `src/app/prorated-rent-calculator/page.tsx`, `src/app/move-out-checklist-deposit-proof/page.tsx` |
| Pricing and legal pages | `src/app/pricing/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/disclaimer/page.tsx` |
| Blog index and 5 SEO posts | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/lib/content.ts` |
| Robots and sitemap | `src/app/robots.ts`, `src/app/sitemap.ts` |
| Global metadata base title/description | `src/app/layout.tsx`, `src/lib/content.ts` |

## Authorization hardening

| Requirement | Implementation |
|---|---|
| Owner-only property mutations | `src/lib/app-data.ts:requireOwnedProperty`, used by `src/app/actions/app-actions.ts` |
| Authenticated report PDF download | `src/app/api/reports/[reportId]/pdf/route.tsx` |
| Public PDF download only through share token | `src/app/api/reports/[reportId]/pdf/route.tsx` |

## Verification completed

| Verification | Result |
|---|---|
| `npm run build` | Passed on 2026-05-14 |
| `npm run dev` start | Passed on 2026-05-14, local dev served on port `3001` because `3000` was already in use |
| Public route smoke tests | `/`, `/sign-in`, `/prorated-rent-calculator` returned `200` |
| Auth redirect smoke test | `/dashboard` redirected to `/sign-in` before login |
| Demo login | Verified through credentials callback on 2026-05-14 |
| Authenticated route smoke tests | `/dashboard`, `/properties/[id]`, `/expenses`, `/checklist`, `/reports` returned `200` after login |
| Shared route and PDF smoke tests | `/shared/[token]` returned `200`; PDF route returned `200` with owner cookie and with share token; PDF route returned `401` without auth/token |
| Browser screenshot check | Homepage rendered successfully in Playwright screenshot at `/tmp/rentready-home.png` |

## Intentional credential-dependent items

These are intentionally left credential-dependent, but the app still runs fully with local fallbacks:

| External service | Fallback that keeps app runnable | Credential requirement |
|---|---|---|
| Google OAuth | Demo mode sign-in | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Stripe | Local Pro preview flow | Stripe keys, price ID, webhook secret |
| Resend | Email delivery disabled with UI notice | `RESEND_API_KEY`, `EMAIL_FROM` |
| S3/R2 | Photos stored inline in DB | S3-compatible bucket credentials |

See `HUMAN_INPUT_NEEDED.md` for the exact env vars and setup steps.
