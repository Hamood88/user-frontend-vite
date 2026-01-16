import { useMemo, useState } from "react";
import { AuthPanel } from "./AuthPanel";
import { Users, Store } from "lucide-react";
import logo from "../assets/moondala-logo.svg";

export default function SplitAuthPage() {
  const [mode, setMode] = useState("login");
  const [activeSide, setActiveSide] = useState("user");

  const tagline = useMemo(() => {
    return "Social Commerce • Shared Profits";
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-white relative overflow-hidden">
      {/* Luxury animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-fuchsia-500/20 via-purple-500/15 to-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-48 -right-40 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-amber-400/10 via-violet-500/15 to-sky-400/10 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_30%,rgba(0,0,0,0.35))]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Moondala logo" className="w-11 h-11 rounded-xl ring-1 ring-white/10 shadow-md object-cover" />
            <div className="leading-tight">
              <h1 className="text-xl font-semibold tracking-tight">Moondala</h1>
              <p className="text-xs text-white/60">{tagline}</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 rounded-xl bg-white/5 ring-1 ring-white/10 p-1 backdrop-blur">
            <button
              onClick={() => setMode("login")}
              className={[
                "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                mode === "login"
                  ? "bg-white/10 text-white ring-1 ring-white/15 shadow"
                  : "text-white/70 hover:text-white hover:bg-white/5",
              ].join(" ")}
              type="button"
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={[
                "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                mode === "register"
                  ? "bg-white/10 text-white ring-1 ring-white/15 shadow"
                  : "text-white/70 hover:text-white hover:bg-white/5",
              ].join(" ")}
              type="button"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Split Panels */}
      <div className="relative z-10 w-full pb-10">
        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/[0.03] backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen md:min-h-96">
            {/* User Panel */}
            <div>
              <AuthPanel
                type="user"
                mode={mode}
                isActive={activeSide === "user"}
                onFocus={() => setActiveSide("user")}
                icon={Users}
                title="Join as User"
                hint="Shop, earn rewards, and build your network"
              />
            </div>

            {/* Divider */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

            {/* Shop Panel */}
            <div>
              <AuthPanel
                type="shop"
                mode={mode}
                isActive={activeSide === "shop"}
                onFocus={() => setActiveSide("shop")}
                icon={Store}
                title="Join as Shop"
                hint="Sell products and grow your business"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/45">
          By continuing you agree to Terms • Privacy • Support
        </div>
      </div>
    </div>
  );
}
