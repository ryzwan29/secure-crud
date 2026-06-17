import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { Spinner } from "./ui";

/**
 * Handles the root path ("/"). Checks whether an admin account has been
 * created yet — if not, sends the user to /setup automatically. Otherwise
 * falls through to the normal dashboard flow (which itself redirects to
 * /login if the user isn't authenticated).
 */
export function RootRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .checkSetup()
      .then((setupRequired) => setTarget(setupRequired ? "/setup" : "/dashboard"))
      .catch(() => setTarget("/dashboard"));
  }, []);

  if (!target) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <Navigate to={target} replace />;
}