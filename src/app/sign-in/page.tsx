import { Footer, PublicHeader } from "@/components/ui-shell";
import { SignInPanel } from "@/components/sign-in-panel";
import { hasGoogleAuth } from "@/lib/env";

export default function SignInPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell">
        <section className="hero-panel mb-6 space-y-4">
          <p className="eyebrow">Access the app</p>
          <h1 className="display-title">Move-in evidence and roommate bills in one login.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Google OAuth is supported when credentials are configured. For local
            development and credential-free testing, demo mode signs you into a
            fully runnable account.
          </p>
        </section>
        <SignInPanel googleEnabled={hasGoogleAuth()} />
      </main>
      <Footer />
    </>
  );
}
