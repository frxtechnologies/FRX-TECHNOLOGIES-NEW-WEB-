"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FrxMark } from "@/components/brand/frx-logo";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/assistant", label: "Quick Assistant" },
  { href: "/admin/founders", label: "Founders" },
] as const;

export function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="admin-sidebar">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5" title="Back to site">
          <FrxMark className="w-6" sizes="24px" />
          <span className="text-step-xs font-semibold">Admin</span>
        </Link>

        <nav className="admin-nav" aria-label="Admin sections">
          {LINKS.map((l) => {
            const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className="admin-nav-link"
              >
                <span className="admin-nav-dot" aria-hidden="true" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto flex items-center gap-3 pt-4 md:flex-col md:items-start md:gap-2 md:border-t md:border-[var(--border)]">
        {email && (
          <span className="truncate text-[0.72rem] text-[var(--text-faint)]" title={email}>
            {email}
          </span>
        )}
        <button type="button" onClick={signOut} className="frx-textlink text-step-xs">
          Sign out
        </button>
      </div>
    </aside>
  );
}
