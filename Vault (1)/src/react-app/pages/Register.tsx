import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Shield, Chrome, Loader2, Lock, Cloud, Zap } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@getmocha/users-service/react";

export default function Register() {
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
          <Link to="/login">
            <Button variant="outline" className="border-white/20 hover:bg-white/10">
              Sign In
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
            <h1 className="text-3xl font-bold mb-2">Create Your Vault</h1>
            <p className="text-white/60">Secure your passwords, notes, and sensitive data</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-6">
            <Button
              onClick={redirectToLogin}
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium text-base"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Sign up with Google
            </Button>

            <div className="mt-6 text-center text-sm text-white/60">
              Already have an account?{" "}
              <Link to="/login" className="text-white hover:underline font-medium">
                Sign in
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy. 
                Your data is encrypted and secure.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Lock className="h-5 w-5 mx-auto mb-2 text-white/60" />
              <p className="text-xs text-white/60">End-to-End Encrypted</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Cloud className="h-5 w-5 mx-auto mb-2 text-white/60" />
              <p className="text-xs text-white/60">Cloud Synced</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Zap className="h-5 w-5 mx-auto mb-2 text-white/60" />
              <p className="text-xs text-white/60">Instant Access</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
