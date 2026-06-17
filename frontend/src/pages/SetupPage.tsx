import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../api/auth.api";
import { Button, Input } from "../components/ui";
import { extractErrorMessage } from "../api/client";

export function SetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi.checkSetup().then((required) => {
      if (!required) navigate("/login", { replace: true });
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.setup(form);
      toast.success("Admin account created successfully, please sign in");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Setup failed"));
    } finally {
      setIsLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Settings className="h-8 w-8 text-brand-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-ink-900">Admin Setup</h1>
          <p className="text-sm text-ink-500">Create the first admin account to start using the application.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Username"
            name="username"
            required
            minLength={3}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            hint="Minimum 8 characters, with a mix of uppercase, lowercase, numbers, and symbols."
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Create Admin
          </Button>
        </form>
      </div>
    </div>
  );
}