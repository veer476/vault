import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Shield, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/dashboard");
      } catch (err) {
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/"), 3000);
      }
    };
    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-black" />
        </div>
        {error ? (
          <>
            <p className="text-destructive mb-2">{error}</p>
            <p className="text-muted-foreground text-sm">Redirecting...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium">Unlocking your vault...</p>
            <p className="text-muted-foreground text-sm mt-1">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
}
