import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
