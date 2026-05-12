"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ZodError } from "zod";
import { signupSchema } from "@/lib/validation";
import { useAuthStore } from "@/store/authStore";

type SignupFormData = {
  username: string;
  password: string;
  confirmPassword: string;
};

type SignupFormErrors = Partial<Record<keyof SignupFormData, string>>;

export default function SignupForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");
    setErrors({});
    setLoading(true);

    try {
      const validated = signupSchema.parse(formData);

      const response = await fetch("http://localhost:5000/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: validated.username,
          password: validated.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error || "Signup failed");
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
        const fieldErrors: SignupFormErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof SignupFormData;
            fieldErrors[field] = issue.message;
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

      <div>
        <label className="block text-sm font-medium">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full border px-3 py-2 mt-1"
          placeholder="Confirm password"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {apiError && <p className="text-red-600 bg-red-50 p-2">{apiError}</p>}

      <button type="submit" disabled={loading} className="btn-brutalist w-full">
        {loading ? "Creating..." : "Sign Up"}
      </button>

      {/* Login Link */}
      <p className="text-sm text-center text-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-ink hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  );
}
