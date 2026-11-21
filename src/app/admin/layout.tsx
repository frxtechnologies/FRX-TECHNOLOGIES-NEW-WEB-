import type { Metadata } from "next";
import "./admin.css";
import "./admin-ext.css";

/** The admin area is private: never indexed or followed (robots.txt also disallows /admin). */
export const metadata: Metadata = {
  title: { absolute: "Admin | FRX Technologies" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Loads the admin-only stylesheet and nothing else. Auth is not checked here
 * on purpose — `/admin/login` lives under this same segment and must render
 * without a session. The actual gate is `(protected)/layout.tsx`, which wraps
 * every other admin route via a route group and never touches `/login`.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
