"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ZodError } from "zod";
import { loginSchema } from "@/lib/validation";
import { useAuthStore } from "@/store/authStore";

type LoginFormData = {
  username: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

export default function LoginForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");
    setErrors({});
    setLoading(true);

    try {
      const validated = loginSchema.parse(formData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed", response.status, data);
        setApiError(
          data.error || data.message || "Invalid username or password",
        );
        setLoading(false);
        return;
      }

      if (!data.token) {
        console.error("Login succeeded but no token returned", data);
        setApiError("Login succeeded but the server did not return a token.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser({ username: validated.username });
      router.push("/dashboard");
    } catch (error: unknown) {
      setLoading(false);

      if (error instanceof ZodError) {
        const fieldErrors: LoginFormErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            fieldErrors[issue.path[0] as keyof LoginFormData] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setApiError("Something went wrong");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border px-3 py-2 mt-1"
          placeholder="Enter username"
        />
        {errors.username && (
          <p className="text-red-600 text-sm">{errors.username}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 mt-1"
          placeholder="Enter password"
        />
        {errors.password && (
          <p className="text-red-600 text-sm">{errors.password}</p>
        )}
      </div>

      {/* API Error */}
      {apiError && <p className="text-red-600 bg-red-50 p-2">{apiError}</p>}

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-brutalist w-full">
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Signup Link */}
      <p className="text-sm text-center text-foreground">
        Don't have an account?{" "}
        <Link href="/signup" className="text-ink hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
}
