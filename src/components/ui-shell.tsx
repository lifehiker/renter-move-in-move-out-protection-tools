import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/content";

export function PublicHeader() {
  return (
    <header className="topbar">
      <Link href="/" className="brand-mark">
        {site.name}
      </Link>
      <nav className="topnav">
        <Link href="/move-in-checklist-app">Checklist</Link>
        <Link href="/roommate-bill-split">Bills</Link>
        <Link href="/prorated-rent-calculator">Calculator</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/sign-in" className="button-secondary px-4 py-2">
          Sign in
        </Link>
      </nav>
    </header>
  );
}

export function AppHeader({
  propertyId,
  userName,
}: {
  propertyId?: string;
  userName?: string | null;
}) {
  return (
    <header className="topbar">
      <Link href="/dashboard" className="brand-mark">
        {site.name}
      </Link>
      <nav className="topnav">
        <Link href="/dashboard">Dashboard</Link>
        {propertyId ? <Link href={`/properties/${propertyId}`}>Property</Link> : null}
        {propertyId ? <Link href={`/properties/${propertyId}/checklist`}>Checklist</Link> : null}
        {propertyId ? <Link href={`/properties/${propertyId}/expenses`}>Expenses</Link> : null}
        {propertyId ? <Link href={`/properties/${propertyId}/reports`}>Reports</Link> : null}
        <Link href="/settings/billing">Billing</Link>
        <span className="hidden rounded-full bg-white/70 px-3 py-2 text-sm text-slate-600 md:inline-block">
          {userName || "Renter"}
        </span>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="font-semibold text-slate-900">{site.name}</p>
        <p className="max-w-xl text-sm text-slate-600">{site.description}</p>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/disclaimer">Disclaimer</Link>
        <Link href="/blog">Blog</Link>
      </div>
    </footer>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-shell", className)}>
      <div className="mb-4 space-y-1">
        <h2 className="section-title">{title}</h2>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="stat-card">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-600">{detail}</p> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
