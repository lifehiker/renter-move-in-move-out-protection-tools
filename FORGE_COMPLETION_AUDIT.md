# Forge Completion Audit

Maps every major PRD requirement to the concrete files/routes/components that implement it.

---

## Data Model

| Requirement | Implementation |
|---|---|
| User, Account, Session, VerificationToken | `prisma/schema.prisma` lines 34-86 |
| Property, HouseholdMember | `prisma/schema.prisma` lines 88-134 |
| RecurringBill, BillOccurrence | `prisma/schema.prisma` lines 136-170 |
| Expense | `prisma/schema.prisma` lines 172-189 |
| ChecklistTemplate, ChecklistItem | `prisma/schema.prisma` lines 191-221 |
| PhotoAsset | `prisma/schema.prisma` lines 223-244 |
| IssueNote | `prisma/schema.prisma` lines 246-259 |
| Report, ShareLink | `prisma/schema.prisma` lines 261-290 |
| Subscription | `prisma/schema.prisma` lines 292-307 |
| SplitMethod, ChecklistStatus, IssueSeverity, ReportType enums | `prisma/schema.prisma` lines 10-32 |
| SQLite with binaryTargets for Debian container | `prisma/schema.prisma` generator block |
| Default checklist templates (Entry, Living room, Kitchen, Bathroom, Bedroom) | `prisma/seed.ts` |

---

## Authentication

| Requirement | Implementation |
|---|---|
| NextAuth v5 config with Credentials + optional Google | `src/auth.ts` |
| Auth route handlers | `src/app/api/auth/[...nextauth]/route.ts` |
| Session utility with redirect guard | `src/lib/session.ts` |
| Demo mode (no credentials needed) | `src/app/sign-in/page.tsx`, `src/components/sign-in-panel.tsx` |
| Google OAuth when env vars are set | `src/auth.ts`, `src/lib/env.ts` |
| Session type augmentation (user.id) | `src/types/next-auth.d.ts` |

---

## Core App Shell

| Requirement | Implementation |
|---|---|
| Authenticated app layout and navigation | `src/app/(app)/layout.tsx`, `src/components/ui-shell.tsx` |
| Dashboard with balances, upcoming bills, usage stats | `src/app/(app)/dashboard/page.tsx` |
| Onboarding redirect for first-run users | `src/app/(app)/dashboard/page.tsx` (redirect to /onboarding if no property) |

---

## Property and Household

| Requirement | Implementation |
|---|---|
| Onboarding flow (address, roommates, move-in date, first goal) | `src/app/(app)/onboarding/page.tsx`, `src/app/actions/app-actions.ts:completeOnboarding` |
| Property details page and edit form | `src/app/(app)/properties/[propertyId]/page.tsx`, `src/app/actions/app-actions.ts:updatePropertyDetails` |
| Roommate management with placeholder support | `src/app/(app)/properties/[propertyId]/page.tsx`, `src/app/actions/app-actions.ts:addRoommate` |
| Roommate invite/placeholder creation fallback | `src/app/actions/app-actions.ts:sendInviteFallback` |
| Property creation with default checklist items | `src/lib/app-data.ts:createPropertyWithDefaults`, `src/lib/app-data.ts:ensureDefaultChecklistItems` |

---

## Bills and Expenses

| Requirement | Implementation |
|---|---|
| Recurring bill CRUD (equal, fixed, percentage splits) | `src/app/(app)/properties/[propertyId]/expenses/page.tsx`, `src/app/actions/app-actions.ts:saveRecurringBill` |
| Auto-generate monthly BillOccurrence records | `src/lib/app-data.ts:ensureMonthlyOccurrences` |
| One-off household expense CRUD | `src/app/actions/app-actions.ts:saveExpense` |
| Balance calculation utility | `src/lib/app-data.ts:calculateBalances`, `src/lib/app-data.ts:computeShareBreakdown` |
| Upcoming occurrences for dashboard | `src/lib/app-data.ts:getUpcomingOccurrences` |
| Prorated rent calculator | `src/app/(app)/properties/[propertyId]/expenses/page.tsx:ProratedCalculator` |

---

## Checklist, Notes, and Photos

| Requirement | Implementation |
|---|---|
| Move-in/move-out checklist page | `src/app/(app)/properties/[propertyId]/checklist/page.tsx` |
| Room-by-room checklist display | `src/lib/app-data.ts:groupChecklistByRoom`, `src/lib/checklist.ts` |
| Checklist status (OK, DAMAGED, MISSING, REVIEW) | `src/app/actions/app-actions.ts:saveChecklistItem` |
| Custom checklist items per property | `src/app/actions/app-actions.ts:saveChecklistItem` (no itemId branch) |
| Issue/note logging with severity | `src/app/actions/app-actions.ts:saveIssueNote` |
| Photo upload with EXIF date extraction | `src/app/actions/app-actions.ts:uploadPhoto` |
| Local photo storage (base64 inline) with S3 fallback | `src/lib/storage.ts` |
| Upload timestamp baseline evidence | `prisma/schema.prisma` PhotoAsset.uploadTimestamp |

---

## Reports, Sharing, Email

| Requirement | Implementation |
|---|---|
| Move-in and move-out PDF report generation | `src/app/api/reports/[reportId]/pdf/route.tsx`, `src/lib/app-data.ts:createReportSnapshot` |
| Report history and management | `src/app/(app)/properties/[propertyId]/reports/page.tsx` |
| Free-tier watermark on PDF exports | `src/app/actions/app-actions.ts:createReport`, `src/app/api/reports/[reportId]/pdf/route.tsx` |
| Shareable read-only report links | `src/app/actions/app-actions.ts:createPublicShareLink`, `src/app/shared/[token]/page.tsx` |
| Email delivery via Resend (with fallback) | `src/lib/email.ts`, `src/app/actions/app-actions.ts:emailReport` |
| Report snapshot stored at creation time | `src/lib/app-data.ts:createReportSnapshot` |

---

## Billing

| Requirement | Implementation |
|---|---|
| Free-tier limits (1 property, 3 roommates, 5 bills, 20 photos, 1 export) | `src/lib/plans.ts`, checked in `src/app/actions/app-actions.ts` |
| Pro upgrade UX and billing page | `src/app/(app)/settings/billing/page.tsx` |
| Stripe checkout (lazy-initialized, guarded) | `src/lib/payments.ts`, `src/app/actions/app-actions.ts:startUpgradeCheckout` |
| Local Pro preview when Stripe is unavailable | `src/app/actions/app-actions.ts:startUpgradeCheckout` (hasStripe fallback) |
| Stripe webhook handling | `src/app/api/stripe/webhook/route.ts` |
| Entitlement checks throughout the app | `src/lib/plans.ts:isProPlan` |

---

## Public Marketing and SEO Pages

| Requirement | Implementation |
|---|---|
| Homepage with renter positioning | `src/app/page.tsx` |
| /security-deposit-app | `src/app/security-deposit-app/page.tsx` |
| /move-in-checklist-app | `src/app/move-in-checklist-app/page.tsx` |
| /roommate-bill-split | `src/app/roommate-bill-split/page.tsx` |
| /prorated-rent-calculator | `src/app/prorated-rent-calculator/page.tsx` |
| /renter-photo-log | `src/app/renter-photo-log/page.tsx` |
| /move-out-checklist-deposit-proof | `src/app/move-out-checklist-deposit-proof/page.tsx` |
| Blog collection with 5 articles | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/lib/content.ts` |
| Sitemap | `src/app/sitemap.ts` |
| Robots.txt | `src/app/robots.ts` |

---

## Legal Pages

| Requirement | Implementation |
|---|---|
| Privacy policy | `src/app/privacy/page.tsx` |
| Terms of service | `src/app/terms/page.tsx` |
| Disclaimer (not legal advice) | `src/app/disclaimer/page.tsx` |
| Pricing page | `src/app/pricing/page.tsx` |

---

## Deployment

| Requirement | Implementation |
|---|---|
| output: "standalone" in next.config.ts | `next.config.ts` |
| Production-ready Dockerfile with OpenSSL, Prisma generate, db push at startup | `Dockerfile` |
| SQLite zero-config database | `prisma/schema.prisma` (provider = "sqlite"), `Dockerfile` CMD |
| Auth secret baked into Dockerfile | `Dockerfile` ENV AUTH_SECRET |
| Credential-free startup (all external services have fallbacks) | `src/lib/env.ts`, `src/lib/payments.ts`, `src/lib/email.ts`, `src/lib/storage.ts` |

---

## Intentionally Deferred External-Credential Items

These require credentials that cannot be auto-provisioned. The app runs fully without them via safe fallbacks:

| Service | Fallback behavior | Required for full feature |
|---|---|---|
| Google OAuth | Demo mode (email+name sign-in, no password) | Real Google sign-in |
| Stripe | Local Pro preview toggle in billing page | Paid subscription checkout |
| Resend | Email delivery silently skipped with log | Report email delivery |
| S3/R2 storage | Photos stored inline as base64 in SQLite | Large-scale photo storage |

See `HUMAN_INPUT_NEEDED.md` for setup instructions for each service.
