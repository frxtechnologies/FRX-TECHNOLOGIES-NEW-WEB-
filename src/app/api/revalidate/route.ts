import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/env";

/**
 * Called by the admin panel right after a content save so the public site shows
 * the change immediately instead of waiting for the one-minute ISR window.
 * Admin-only: it checks the signed-in user the same way /api/admin/reply does,
 * so a stranger cannot trigger cache churn.
 */
export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdminEmail(user?.email)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
