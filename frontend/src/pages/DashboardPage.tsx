import { useEffect, useState } from "react";
import { Package, ShieldCheck, UserCircle } from "lucide-react";
import { productsApi } from "../api/products.api";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    productsApi
      .list({ page: 1, limit: 1 })
      .then((res) => setProductCount(res.total))
      .catch(() => setProductCount(null));
  }, []);

  const stats = [
    { label: "Total Produk", value: productCount ?? "—", icon: Package },
    { label: "Role Kamu", value: user?.role === "admin" ? "Admin" : "User", icon: ShieldCheck },
    { label: "Username", value: user?.username ?? "—", icon: UserCircle },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500">Ringkasan singkat akun dan data kamu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-surface-border bg-white p-5 shadow-card">
            <div className="rounded-lg bg-brand-50 p-3">
              <stat.icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-ink-500">{stat.label}</p>
              <p className="text-lg font-semibold text-ink-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
