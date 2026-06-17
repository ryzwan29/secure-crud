import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <p className="text-3xl font-semibold text-ink-900">404</p>
      <p className="text-sm text-ink-500">The page you're looking for could not be found.</p>
      <Link to="/dashboard">
        <Button variant="secondary">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
