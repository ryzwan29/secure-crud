import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../api/auth.api";
import { Button, Input } from "../components/ui";
import { extractErrorMessage } from "../api/client";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.register(form);
      toast.success("Account created successfully, please sign in");
      navigate("/login");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Registration failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-surface-border bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-8 w-8 text-brand-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-ink-900">Create a new account</h1>
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
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
