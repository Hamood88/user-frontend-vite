import { useState, useEffect } from "react";
import { Gift, TrendingUp, Shield, Package, BarChart3, Users } from "lucide-react";
import { BenefitRow } from "./BenefitRow";
import { UserAuthForm } from "./UserAuthForm";
import { ShopAuthForm } from "./ShopAuthForm";

export function AuthPanel({ type, mode, isActive, onFocus, icon: Icon, title, hint }) {
  const [benefitIndex, setBenefitIndex] = useState(0);

  const userBenefits = [
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Get cashback and exclusive deals on every purchase",
    },
    {
      icon: Users,
      title: "Referral Network",
      description: "Invite friends and earn commission on their purchases",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Shop with confidence with buyer protection",
    },
  ];

  const shopBenefits = [
    {
      icon: Package,
      title: "Easy Selling",
      description: "List products and manage inventory effortlessly",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track sales, customers, and growth metrics",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Reach matched buyers and scale faster",
    },
  ];

  const benefits = type === "user" ? userBenefits : shopBenefits;

  useEffect(() => {
    const interval = setInterval(() => {
      setBenefitIndex((prev) => (prev + 1) % benefits.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [benefits.length]);

  const accent =
    type === "user"
      ? {
          chip: "from-cyan-400/20 via-purple-500/20 to-fuchsia-500/20",
          ring: "ring-cyan-400/20",
          iconBg: "bg-cyan-400/10",
          iconText: "text-cyan-200",
        }
      : {
          chip: "from-amber-300/15 via-fuchsia-500/15 to-purple-500/20",
          ring: "ring-amber-300/20",
          iconBg: "bg-amber-300/10",
          iconText: "text-amber-200",
        };

  return (
    <div
      onClick={onFocus}
      className={[
        "w-full p-6 md:p-8 transition-all cursor-pointer outline-none",
        "relative",
        isActive
          ? "bg-white/[0.03]"
          : "bg-white/[0.015] hover:bg-white/[0.03]",
      ].join(" ")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFocus();
        }
      }}
      aria-label={`${title} panel`}
    >
      {/* Active glow edge */}
      <div
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity",
          isActive ? "opacity-100" : "",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-0 rounded-none",
            "ring-1 ring-white/10",
          ].join(" ")}
        />
        <div
          className={[
            "absolute -inset-10 blur-2xl",
            "bg-gradient-to-br",
            accent.chip,
            "opacity-40",
          ].join(" ")}
        />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Panel Header */}
        <div
          className={[
            "flex items-center gap-3 mb-3 transition-opacity",
            isActive ? "opacity-100" : "opacity-70",
          ].join(" ")}
        >
          <div
            className={[
              "p-2 rounded-xl ring-1 ring-white/10",
              "shadow-[0_0_30px_rgba(255,255,255,0.06)]",
              accent.iconBg,
            ].join(" ")}
          >
            <Icon className={["w-5 h-5", accent.iconText].join(" ")} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-white/60">{hint}</p>
          </div>
        </div>

        {/* Benefits Carousel */}
        <div className="mb-6 rounded-xl p-4 ring-1 ring-white/10 bg-white/[0.03] backdrop-blur">
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <BenefitRow
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                isActive={index === benefitIndex}
                variant={type}
              />
            ))}
          </div>
        </div>

        {/* Auth Form */}
        <div
          className={[
            "transition-opacity",
            isActive ? "opacity-100" : "opacity-50 pointer-events-none",
          ].join(" ")}
        >
          {type === "user" ? (
            <UserAuthForm mode={mode} />
          ) : (
            <ShopAuthForm mode={mode} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPanel;
