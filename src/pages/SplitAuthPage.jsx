import { useState } from "react";
import { User, Store, Heart, Package, Users, ShoppingBag, TrendingUp, Users2, Globe } from "lucide-react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";
import { Badge } from "../components/ui";

export default function SplitAuthPage() {
  const [mode, setMode] = useState("login");
  const [side, setSide] = useState("user");
  console.log("[SplitAuthPage] Rendered", { mode, side });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 min-h-screen grid md:grid-cols-2 gap-8 p-8 max-w-7xl mx-auto">
        {/* LEFT: BUYER SECTION */}
        <div className="flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 flex items-center justify-center border border-cyan-500/30">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold">Join as Buyer</h1>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge className="text-cyan-300 ring-cyan-500/30">
                <Heart className="w-3.5 h-3.5" />
                Earn rewards
              </Badge>
              <Badge className="text-cyan-300 ring-cyan-500/30">
                <Package className="w-3.5 h-3.5" />
                Discover products
              </Badge>
              <Badge className="text-cyan-300 ring-cyan-500/30">
                <Users className="w-3.5 h-3.5" />
                Build network
              </Badge>
            </div>
          </div>

          {/* Mode toggle for mobile/tablet */}
          <div className="md:hidden mb-6 flex gap-3">
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === "register"
                  ? "bg-white/10 text-white ring-1 ring-white/20"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === "login"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Log In
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            {/* Mode toggle - Desktop */}
            <div className="hidden md:flex gap-2 mb-6">
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  mode === "register"
                    ? "bg-white/10 text-white ring-1 ring-white/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  mode === "login"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Log In
              </button>
            </div>

            <UserAuthForm mode={mode} />

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              By continuing you agree to <span className="text-white font-semibold">Terms</span> & <span className="text-white font-semibold">Privacy</span>
            </p>
          </div>
        </div>

        {/* RIGHT: SELLER SECTION */}
        <div className="flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center border border-amber-500/30">
                <Store className="w-6 h-6 text-amber-400" />
              </div>
              <h1 className="text-3xl font-bold">Join as Seller</h1>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge className="text-amber-300 ring-amber-500/30">
                <ShoppingBag className="w-3.5 h-3.5" />
                Launch mall
              </Badge>
              <Badge className="text-amber-300 ring-amber-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                Track earnings
              </Badge>
              <Badge className="text-amber-300 ring-amber-500/30">
                <Users2 className="w-3.5 h-3.5" />
                Reach buyers
              </Badge>
            </div>
          </div>

          {/* Mode toggle for mobile/tablet */}
          <div className="md:hidden mb-6 flex gap-3">
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === "register"
                  ? "bg-white/10 text-white ring-1 ring-white/20"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold ${
                mode === "login" ? "" : ""
              }`}
            >
              Log In
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            {/* Mode toggle - Desktop */}
            <div className="hidden md:flex gap-2 mb-6">
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  mode === "register"
                    ? "bg-white/10 text-white ring-1 ring-white/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold hover:from-amber-300 hover:to-amber-400 ${
                  mode === "login" ? "" : ""
                }`}
              >
                Log In
              </button>
            </div>

            <ShopAuthForm mode={mode} />

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              By continuing you agree to <span className="text-white font-semibold">Terms</span> & <span className="text-white font-semibold">Privacy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
