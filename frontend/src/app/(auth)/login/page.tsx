import { useState } from "react";
import { Link } from "react-router-dom";
import { Nav } from "@/components/synapz/Nav";
import { Footer } from "@/components/synapz/Footer";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { username, password });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <span className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              AUTH / LOGIN
            </span>
            <h1 className="font-display text-5xl tracking-tighter text-ink mt-3">
              LOG IN
            </h1>
            <p className="mt-3 text-foreground">Access your second brain.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={50}
                className="w-full border border-ink bg-background px-4 py-3 text-ink focus:outline-none focus:bg-secondary"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={100}
                className="w-full border border-ink bg-background px-4 py-3 text-ink focus:outline-none focus:bg-secondary"
              />
            </div>

            <button
              type="submit"
              className="w-full border border-ink bg-ink px-6 py-3 font-mono-tech text-xs uppercase tracking-[0.25em] text-ink-foreground transition-colors hover:bg-background hover:text-ink"
            >
              Log In →
            </button>
          </form>

          <p className="mt-8 text-sm text-foreground">
            No account?{" "}
            <Link
              to="/signup"
              className="text-ink underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
