import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Admin overview", robots: { index: false, follow: false } };

export default async function AdminOverviewPage() {
  const supabase = await createServerSupabase();

  const [{ count: newCount }, { count: totalCount }, { count: assistantCount }, { count: founderCount }, pendingReviews, publishedProjects] =
    await Promise.all([
      supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("inquiries").select("*", { count: "exact", head: true }),
      supabase.from("assistant_entries").select("*", { count: "exact", head: true }),
      supabase.from("founders").select("*", { count: "exact", head: true }),
      // These two tables come from the content migration; before it is run they simply read as 0.
      supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("published", true),
    ]);

  const { data: recent } = await supabase
    .from("inquiries")
    .select("id, name, project_type, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      <header className="admin-header">
        <h1 className="admin-title">Overview</h1>
      </header>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <span className="admin-stat-value">{newCount ?? 0}</span>
          <span className="admin-stat-label">New inquiries</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{totalCount ?? 0}</span>
          <span className="admin-stat-label">Total inquiries</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{assistantCount ?? 0}</span>
          <span className="admin-stat-label">Assistant entries</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{founderCount ?? 0}</span>
          <span className="admin-stat-label">Founders</span>
        </div>
        <Link href="/admin/reviews" className="admin-stat">
          <span className="admin-stat-value">{pendingReviews.count ?? 0}</span>
          <span className="admin-stat-label">Reviews awaiting approval</span>
        </Link>
        <Link href="/admin/projects" className="admin-stat">
          <span className="admin-stat-value">{publishedProjects.count ?? 0}</span>
          <span className="admin-stat-label">Published projects</span>
        </Link>
      </div>

      <div className="admin-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-step-sm font-medium">Recent inquiries</h2>
          <Link href="/admin/inquiries" className="frx-textlink text-step-xs">
            View all
          </Link>
        </div>

        {!recent?.length ? (
          <p className="admin-empty">No inquiries yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.project_type}</td>
                    <td>
                      <span className="admin-pill" data-status={r.status}>
                        {r.status}
                      </span>
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
