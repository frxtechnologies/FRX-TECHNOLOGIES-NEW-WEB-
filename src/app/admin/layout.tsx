import "./admin.css";

/**
 * Loads the admin-only stylesheet and nothing else. Auth is not checked here
 * on purpose — `/admin/login` lives under this same segment and must render
 * without a session. The actual gate is `(protected)/layout.tsx`, which wraps
 * every other admin route via a route group and never touches `/login`.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
