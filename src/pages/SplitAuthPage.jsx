import { useState } from "react";
import { Users, Store, Heart, Package, Users as UsersIcon, ShoppingBag, TrendingUp, Users2, Mail, Lock } from "lucide-react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";
import { Badge } from "../components/ui";

export default function SplitAuthPage() {
  const [mode, setMode] = useState("login");
  console.log("[SplitAuthPage] Rendered", { mode });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-slate-900 text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 -right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 -left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col p-8">
        {/* Top title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent mb-2">Users - Shops</h1>
          <p className="text-gray-400">Choose your role and get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto w-full">
        {/* LEFT: BUYER SECTION */}
        <div className="flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg bg-yellow-600/20 border border-yellow-600/40 flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Buyer</h1>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Badge>
                <Heart className="w-4 h-4 text-purple-400" />
                <span>Earn rewards</span>
              </Badge>
              <Badge>
                <Package className="w-4 h-4 text-purple-400" />
                <span>Discover products</span>
              </Badge>
              <Badge>
                <UsersIcon className="w-4 h-4 text-purple-400" />
                <span>Build network</span>
              </Badge>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-gradient-to-br from-purple-950/60 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-purple-700/30 p-8">
            {/* Mode toggle */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  mode === "login"
                    ? "bg-gradient-to-r from-yellow-400 via-yellow-300 to-purple-500 text-white"
                    : "bg-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Log In
              </button>
            </div>

            <UserAuthForm mode={mode} />

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6 text-center">
              By continuing you agree to <span className="text-white font-semibold">Terms & Privacy</span>
            </p>
          </div>
        </div>

        {/* RIGHT: SELLER SECTION */}
        <div className="flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg bg-yellow-600/20 border border-yellow-600/40 flex items-center justify-center">
                <Store className="w-6 h-6 text-yellow-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Seller</h1>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Badge>
                <ShoppingBag className="w-4 h-4 text-yellow-400" />
                <span>Launch mall</span>
              </Badge>
              <Badge>
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span>Track earnings</span>
              </Badge>
              <Badge>
                <Users2 className="w-4 h-4 text-yellow-400" />
                <span>Reach buyers</span>
              </Badge>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-gradient-to-br from-purple-950/60 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-purple-700/30 p-8">
            {/* Mode toggle */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  mode === "login"
                    ? "bg-gradient-to-r from-yellow-400 via-yellow-300 to-purple-500 text-white"
                    : "bg-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Log In
              </button>
            </div>

            <ShopAuthForm mode={mode} />

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6 text-center">
              By continuing you agree to <span className="text-white font-semibold">Terms & Privacy</span>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
