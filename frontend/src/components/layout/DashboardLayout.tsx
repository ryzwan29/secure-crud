import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, Package, Users, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, adminOnly: false },
  { to: "/dashboard/products", label: "Produk", icon: Package, adminOnly: false },
  { to: "/dashboard/users", label: "Manajemen User", icon: Users, adminOnly: true },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-dvh bg-surface-subtle">
      <aside className="hidden w-64 flex-col border-r border-surface-border bg-white px-4 py-6 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <ShieldCheck className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink-900">Secure CRUD Admin</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Navigasi utama">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === "admin")
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-surface-subtle"
                  }`
                }
              >
                <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
        </nav>

        <button
          onClick={logout}
          className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-700 hover:bg-surface-subtle"
        >
          <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
          Logout
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-surface-border bg-white px-6">
          <p className="text-sm text-ink-500">
            Masuk sebagai <span className="font-medium text-ink-900">{user?.username}</span>
          </p>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {user?.role === "admin" ? "Admin" : "User"}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
