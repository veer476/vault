import { Link } from "react-router";
import { Shield, Lock, Key, Eye, Sparkles, Zap, Check, Cloud, Smartphone } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@getmocha/users-service/react";

export default function Landing() {
  const { user, redirectToLogin } = useAuth();

  return (
    <div className="min-h-screen bg-background dark">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl opacity-30" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-foreground">Vault</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="bg-white text-black hover:bg-white/90 shadow-lg">
                  Open Vault
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-white text-black hover:bg-white/90 shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Military-grade encryption</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Your secrets,
            <br />
            <span className="text-white/60">
              locked away safely
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Store passwords, secure notes, and sensitive information in your personal encrypted vault. 
            Access anywhere, anytime, with peace of mind.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={redirectToLogin} className="bg-white text-black hover:bg-white/90 shadow-xl px-8">
              Create Free Vault
            </Button>
            <Button size="lg" variant="outline" onClick={redirectToLogin} className="border-white/20 hover:bg-white/10">
              Access Your Vault
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to stay secure
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built with the latest security standards to keep your data safe
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="End-to-End Encryption"
            description="Your data is encrypted before it ever leaves your device. Only you can decrypt it."
          />
          <FeatureCard
            icon={<Key className="w-6 h-6" />}
            title="Password Manager"
            description="Store unlimited passwords with usernames, URLs, and auto-fill support."
          />
          <FeatureCard
            icon={<Eye className="w-6 h-6" />}
            title="Secure Notes"
            description="Store sensitive documents, recovery codes, and private notes with full encryption."
          />
          <FeatureCard
            icon={<Cloud className="w-6 h-6" />}
            title="Cloud Sync"
            description="Access your vault from any device with automatic cloud synchronization."
          />
          <FeatureCard
            icon={<Smartphone className="w-6 h-6" />}
            title="Payment Cards"
            description="Securely store credit card information for quick access when you need it."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Instant Access"
            description="Quick search and one-click copy make accessing your data effortless."
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            period="forever"
            description="Perfect for getting started"
            features={[
              "Unlimited passwords",
              "Unlimited secure notes",
              "Unlimited payment cards",
              "Cloud sync across devices",
              "256-bit encryption",
            ]}
            cta="Get Started"
            onClick={redirectToLogin}
          />
          <PricingCard
            name="Pro"
            price="$4.99"
            period="per month"
            description="For power users"
            features={[
              "Everything in Free",
              "Password health reports",
              "2FA storage",
              "Secure file attachments",
              "Priority support",
              "Advanced sharing",
            ]}
            cta="Coming Soon"
            highlighted
            onClick={() => {}}
          />
          <PricingCard
            name="Family"
            price="$9.99"
            period="per month"
            description="For up to 6 people"
            features={[
              "Everything in Pro",
              "Up to 6 family members",
              "Shared vaults",
              "Family admin dashboard",
              "Individual accounts",
              "Dedicated support",
            ]}
            cta="Coming Soon"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-24">
        <div className="max-w-4xl mx-auto bg-white/5 rounded-3xl p-12 text-center border border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to secure your digital life?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of users who trust Vault to protect their most sensitive information.
          </p>
          <Button size="lg" onClick={redirectToLogin} className="bg-white text-black hover:bg-white/90 shadow-xl px-8">
            Get Started for Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-foreground">Vault</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Vault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-white/30 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:bg-white/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  cta, 
  highlighted,
  onClick 
}: { 
  name: string; 
  price: string; 
  period: string; 
  description: string; 
  features: string[]; 
  cta: string;
  highlighted?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`relative p-8 rounded-2xl border transition-all hover:scale-105 ${
      highlighted 
        ? "bg-white text-black border-white shadow-2xl" 
        : "bg-card border-border hover:border-white/30"
    }`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-black text-white text-xs font-medium rounded-full border border-white/20">
          Most Popular
        </div>
      )}
      
      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-2 ${highlighted ? "text-black" : "text-foreground"}`}>
          {name}
        </h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`text-4xl font-bold ${highlighted ? "text-black" : "text-foreground"}`}>
            {price}
          </span>
          <span className={highlighted ? "text-black/60" : "text-muted-foreground"}>
            /{period}
          </span>
        </div>
        <p className={highlighted ? "text-black/70" : "text-muted-foreground"}>
          {description}
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className={`w-5 h-5 flex-shrink-0 ${highlighted ? "text-black" : "text-white"}`} />
            <span className={`text-sm ${highlighted ? "text-black" : "text-muted-foreground"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button 
        onClick={onClick}
        disabled={cta === "Coming Soon"}
        className={`w-full ${
          highlighted 
            ? "bg-black text-white hover:bg-black/90" 
            : "bg-white text-black hover:bg-white/90"
        }`}
      >
        {cta}
      </Button>
    </div>
  );
}
