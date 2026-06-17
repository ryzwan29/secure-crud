import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <p className="text-3xl font-semibold text-ink-900">404</p>
      <p className="text-sm text-ink-500">Halaman yang kamu cari tidak ditemukan.</p>
      <Link to="/dashboard">
        <Button variant="secondary">Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
