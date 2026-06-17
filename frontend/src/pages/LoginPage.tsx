import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Button, Input } from "../components/ui";
import { extractErrorMessage } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-8 w-8 text-brand-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-ink-900">Sign in to your account</h1>
          <p className="text-sm text-ink-500">Secure CRUD Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
