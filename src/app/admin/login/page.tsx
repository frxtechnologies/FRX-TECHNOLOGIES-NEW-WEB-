"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/supabase/env";
import { FrxLogo } from "@/components/brand/frx-logo";
import { ActionButton } from "@/components/ui/button";

/**
 * The only door into /admin. Plain email/password against Supabase Auth — no
 * public sign-up exists anywhere in this app, so the single account has to be
 * created once by hand in the Supabase dashboard (see supabase/schema.sql).
 *
 * A correct password for the wrong email still fails: RLS only trusts one
 * address, so a session for anyone else reads and writes nothing regardless
 * of what this form lets through. This check is just so the wrong person sees
 * a clear error instead of a dashboard that's silently empty.
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError("Supabase isn't configured for this deployment.");
      setPending(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError("Incorrect email or password.");
      setPending(false);
      return;
    }

    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      setError("This account doesn't have access to the admin panel.");
      setPending(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <Link href="/" className="mx-auto block w-36">
          <FrxLogo sizes="144px" />
        </Link>

        <div className="text-center">
          <h1 className="t-h3">Admin</h1>
          <p className="mt-1 text-step-xs text-[var(--text-faint)]">
            FRX Technologies internal panel
          </p>
        </div>

        <form onSubmit={onSubmit} className="frx-form" noValidate>
          <div className="frx-field">
            <label className="frx-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="frx-input"
            />
            <span className="frx-field-rule" aria-hidden="true" />
          </div>

          <div className="frx-field">
            <label className="frx-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="frx-input"
            />
            <span className="frx-field-rule" aria-hidden="true" />
          </div>

          {error && (
            <p className="frx-error" role="alert">
              {error}
            </p>
          )}

          <ActionButton type="submit" className="w-full justify-center">
            {pending ? "Signing in…" : "Sign in"}
          </ActionButton>
        </form>
      </div>
    </div>
  );
}
