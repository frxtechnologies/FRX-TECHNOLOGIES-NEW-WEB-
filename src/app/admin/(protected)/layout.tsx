import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/supabase/env";
import { AdminSidebar } from "@/components/admin/sidebar";

/**
 * Every admin route except /login goes through this. Redundant with
 * middleware.ts by design — belt and braces, cheap to keep in sync since both
 * check the same thing (`user.email === ADMIN_EMAIL`), and a layout-level
 * check still runs even if middleware's matcher is ever narrowed by mistake.
 *
 * Neither check is the real security boundary. That's the RLS policies in
 * supabase/schema.sql, which the database enforces regardless of what any
 * page or middleware here does or doesn't do.
 */
export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  let email: string | undefined;

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email;
  } catch {
    redirect("/admin/login");
  }

  if (email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar email={email} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
