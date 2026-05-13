"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function SignInPanel({ googleEnabled }: { googleEnabled: boolean }) {
  const [name, setName] = useState("Demo renter");
  const [email, setEmail] = useState("demo@rentready.local");
  const [loading, setLoading] = useState(false);

  async function handleDemoSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      name,
      email,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  }

  return (
    <div className="surface-grid">
      <div className="card-shell space-y-4">
        <p className="eyebrow">Fast access</p>
        <h2 className="section-title">Try the product in demo mode</h2>
        <p className="text-sm text-slate-600">
          Use a local demo account when OAuth is not configured. You can still
          create a property, upload photos, export a report, and review the full
          app flow.
        </p>
        <form className="space-y-3" onSubmit={handleDemoSignIn}>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button className="button-primary w-full" disabled={loading} type="submit">
            {loading ? "Starting demo..." : "Continue in demo mode"}
          </button>
        </form>
      </div>
      <div className="card-shell space-y-4">
        <p className="eyebrow">Production auth</p>
        <h2 className="section-title">Google sign-in</h2>
        <p className="text-sm text-slate-600">
          The app supports Google auth through NextAuth when OAuth credentials are
          present. Without them, the demo mode above keeps the full product
          runnable locally.
        </p>
        <button
          className="button-secondary w-full"
          disabled={!googleEnabled}
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          type="button"
        >
          {googleEnabled ? "Continue with Google" : "Google credentials not configured"}
        </button>
      </div>
    </div>
  );
}
