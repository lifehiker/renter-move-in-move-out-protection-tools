# Forge PRD Tasks

## Foundation
- [x] Read `PRD.md` end-to-end.
- [x] Read `BUILD_INSTRUCTIONS.md` end-to-end.
- [x] Inventory the repository to determine what already exists.
- [x] Bootstrap Next.js app foundation in this repository.
- [x] Configure `next.config.ts` with `output: "standalone"`.
- [x] Set up shared styling, layout, navigation, and polished responsive design system.
- [x] Add environment handling with safe local fallbacks.

## Data Model
- [x] Set up Prisma with a runnable local database configuration.
- [x] Define auth models: `User`, `Account`, `Session`, `VerificationToken`.
- [x] Define product models: `Property`, `HouseholdMember`, `RecurringBill`, `BillOccurrence`, `Expense`, `ChecklistTemplate`, `ChecklistItem`, `PhotoAsset`, `IssueNote`, `Report`, `ShareLink`, `Subscription`.
- [x] Add enums: `SplitMethod`, `ChecklistStatus`, `IssueSeverity`, `ReportType`.
- [x] Add seed data for default room and checklist templates.
- [x] Run Prisma generate and migration for local development.

## Auth
- [x] Configure NextAuth/Auth.js v5.
- [x] Support Google sign-in when credentials are available.
- [x] Provide a safe local/demo sign-in fallback when Google credentials are unavailable.
- [x] Protect authenticated app routes.
- [x] Add sign-in and sign-out flows.

## Core App Shell
- [x] Add onboarding redirect logic for first-run users.
- [x] Build authenticated app layout and navigation.
- [x] Build dashboard summary cards, recent activity, and upcoming recurring charges.

## Property And Household
- [x] Build onboarding flow for property address, roommates, move-in date, and first goal.
- [x] Build property details page and edit form.
- [x] Build roommate management UI.
- [x] Support placeholder roommates without signup.
- [x] Support roommate invite/send flow or safe fallback.

## Bills And Expenses
- [x] Build recurring bill CRUD.
- [x] Support split methods: equal, fixed, percentage.
- [x] Auto-generate monthly bill occurrences from recurring templates.
- [x] Build one-off household expense CRUD.
- [x] Track who paid and who owes.
- [x] Calculate household balances and settlement summaries.

## Checklist, Notes, And Photos
- [x] Build move-in/move-out checklist page.
- [x] Use prebuilt checklist areas: entry, living room, kitchen, bathroom, bedroom, windows, walls, floors, appliances.
- [x] Support custom checklist items per property.
- [x] Support checklist statuses: ok, damaged, missing, needs review.
- [x] Build issue/note logging with severity.
- [x] Build photo upload flow from browser.
- [x] Store upload timestamp and capture timestamp metadata.
- [x] Preserve EXIF date when available or fall back gracefully.
- [x] Provide safe local photo storage fallback when S3 is unavailable.

## Reports, Sharing, Email
- [x] Generate move-in and move-out PDF reports.
- [x] Include property details, checklist statuses, notes, photo thumbnails, timestamps, and declaration.
- [x] Apply free-tier watermark/limit behavior.
- [x] Build shareable read-only report links.
- [x] Build email delivery flow through Resend or safe local fallback.
- [x] Store report history.

## Billing
- [x] Model free tier usage limits.
- [x] Build pricing and upgrade UX.
- [x] Build Stripe checkout/session flow with missing-env guards.
- [x] Build billing management page.
- [x] Build webhook handling or safe fallback.

## Public Marketing, SEO, And Legal
- [x] Build polished homepage with renter-focused positioning.
- [x] Build SEO landing pages:
- [x] `/move-in-checklist-app`
- [x] `/security-deposit-app`
- [x] `/renter-photo-log`
- [x] `/roommate-bill-split`
- [x] `/prorated-rent-calculator`
- [x] `/move-out-checklist-deposit-proof`
- [x] Build blog/content pages:
- [x] `how-to-document-apartment-damage-before-move-in`
- [x] `how-to-protect-your-security-deposit-as-a-renter`
- [x] `how-to-split-rent-when-a-roommate-moves-out-mid-month`
- [x] `what-evidence-helps-in-a-deposit-dispute`
- [x] `move-in-checklist-by-room-printable-and-digital`
- [x] Add metadata, sitemap-ready structure, and internal links.
- [x] Add legal pages: privacy, terms, disclaimer.

## Deployment And Operations
- [x] Create production-ready Dockerfile for standalone Next.js output.
- [x] Ensure Dockerfile only copies paths that actually exist.
- [x] Add any needed npm scripts for build, seed, and local setup.
- [x] Document required external credentials in `HUMAN_INPUT_NEEDED.md`.

## Verification
- [x] Run `npm run build` successfully.
- [x] Start the dev server successfully.
- [x] Smoke-test primary public and authenticated routes.
- [x] Review major pages/components visually and fix polish issues.
- [x] Test interactive forms, buttons, and navigation.
- [x] Create `FORGE_COMPLETION_AUDIT.md` mapping PRD requirements to implementation.
