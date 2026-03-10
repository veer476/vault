import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Shield, Chrome, Loader2 } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@getmocha/users-service/react";

export default function Login() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isPending) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7" />
            <span className="font-bold text-xl">Vault</span>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="border-white/20 hover:bg-white/10">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-white/60">Sign in to access your secure vault</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <Button
              onClick={redirectToLogin}
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium text-base"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>

            <div className="mt-6 text-center text-sm text-white/60">
              Don't have an account?{" "}
              <Link to="/register" className="text-white hover:underline font-medium">
                Create one
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">
                Vault uses secure Google authentication to protect your data. 
                We never see or store your Google password.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
