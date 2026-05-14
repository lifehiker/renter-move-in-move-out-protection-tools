# Forge PRD Task Checklist

Last updated: 2026-05-14

Status legend:
- `[x]` complete
- `[-]` partially complete / needs verification or expansion
- `[ ]` not complete

## 1. Foundation
- [x] Read `PRD.md` end-to-end
- [x] Read `BUILD_INSTRUCTIONS.md` end-to-end
- [x] Review existing routes, schema, actions, and integrations
- [x] Confirm Next.js config uses `output: "standalone"`
- [x] Run `npm run build` to establish current failures
- [x] Ensure all build/runtime code avoids network-dependent build behavior
- [x] Verify env-guarded lazy initialization for third-party integrations

## 2. Data Model
- [x] Users, sessions, accounts, verification tokens
- [x] Property model with address, lease dates, rent, deposit, utility categories
- [x] Household members / roommate placeholders
- [x] Recurring bill templates
- [x] Monthly bill occurrences
- [x] One-off expenses
- [x] Checklist templates and property checklist items
- [x] Photo assets with capture/upload timestamps and EXIF support fields
- [x] Issue notes with severity
- [x] Reports with snapshots and watermark flag
- [x] Share links
- [x] Subscription records
- [x] Validate schema supports all required workflows cleanly in app logic

## 3. Auth
- [x] NextAuth route configured
- [x] Google provider behind env guard
- [x] Demo credentials fallback for local testing
- [x] Protected app routes require session
- [x] Verify session/user flow across onboarding and app routes
- [x] Ensure sign-out/account controls exist in app UX
- [x] Fix production host trust for deployed Auth.js session requests

## 4. User-Facing App Pages
- [x] Sign-in page
- [x] Onboarding page
- [x] Dashboard page
- [x] Property workspace page
- [x] Property bills/expenses page
- [x] Property checklist page
- [x] Property reports page
- [x] Billing settings page
- [x] Shared read-only report page
- [x] Ensure every app page is polished, responsive, and complete against PRD
  Verified through route rendering, shared/app shell inspection, and CSS/markup review in this CLI environment.

## 5. Core Workflows
- [x] Create first property from onboarding
- [x] Edit property details
- [x] Add roommate placeholder
- [x] Invite roommate fallback flow
- [x] Create recurring bill with equal/fixed/percentage split
- [x] Auto-generate monthly recurring occurrences
- [x] Add one-off expense with payer and owed amounts
- [x] Dashboard balances and recent/upcoming activity
- [x] Room-by-room checklist completion
- [x] Add custom checklist item
- [x] Issue logging with severity
- [x] Photo upload with timestamps and storage fallback
- [x] Move-in PDF report generation
- [x] Move-out PDF report generation
- [x] Shareable read-only report link
- [x] Email report delivery with graceful fallback
- [x] Prorated roommate transition calculator
- [x] Ensure all actions validate ownership and inputs robustly
- [x] Ensure move-in vs move-out data flow is represented clearly in UI and exports

## 6. Billing / Email / Storage Integrations Or Safe Fallbacks
- [x] Stripe checkout entrypoint with local Pro preview fallback
- [x] Stripe webhook route with env guard
- [x] Resend email sender with env guard
- [x] S3-compatible storage writer with inline fallback
- [x] Expose clear UX when Stripe/Resend/S3 are unavailable
- [x] Ensure local fallbacks keep entire app runnable without credentials

## 7. Marketing / SEO Pages
- [x] Homepage
- [x] Pricing page
- [x] `/security-deposit-app`
- [x] `/move-in-checklist-app`
- [x] `/renter-photo-log`
- [x] `/roommate-bill-split`
- [x] `/prorated-rent-calculator`
- [x] `/move-out-checklist-deposit-proof`
- [x] Blog index
- [x] Blog detail pages
- [x] Privacy page
- [x] Terms page
- [x] Disclaimer page
- [x] `robots.ts`
- [x] `sitemap.ts`
- [x] Verify metadata, internal linking, polish, and keyword alignment across pages

## 8. API / Server Routes / Actions
- [x] NextAuth route
- [x] Stripe webhook route
- [x] Report PDF route
- [x] Server actions for onboarding/property/bills/checklist/reports
- [x] Add any missing app routes/actions required by PRD
- [x] Harden validation/error handling/authorization for actions and routes

## 9. Deployment / Docker
- [x] Production-ready Dockerfile using Next standalone output
- [x] Confirm Dockerfile only copies directories that exist
- [-] Test `docker build .` if Docker is available
  Docker is installed, but this environment cannot access `/var/run/docker.sock`, so image build verification is blocked by host permissions rather than app code.

## 10. Verification
- [x] Run `npm run build` successfully
- [x] Start dev server successfully
- [x] Smoke-test primary routes
- [x] Check polished visual presentation on each page
  Reviewed rendered HTML/CSS structure and page content across public, app, and shared routes; no broken layouts or missing content found in CLI verification.
- [x] Test forms, buttons, navigation, and key interactions
- [x] Create `HUMAN_INPUT_NEEDED.md` only for real credential dependencies
- [x] Create `FORGE_COMPLETION_AUDIT.md` mapping PRD requirements to implementation
- [x] Re-read relevant PRD sections after each major phase and update this checklist
