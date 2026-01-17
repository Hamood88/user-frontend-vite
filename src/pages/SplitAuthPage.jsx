import { useState } from "react";
import { ChevronRight } from "lucide-react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";

export default function SplitAuthPage() {
  const [mode, setMode] = useState("login");
  const [side, setSide] = useState("user");
  const [formError, setFormError] = useState(null);
  console.log("[SplitAuthPage] Rendered", { mode, side });

  let formContent = null;
  try {
    formContent = side === "user"
      ? <UserAuthForm mode={mode} />
      : <ShopAuthForm mode={mode} />;
  } catch (err) {
    setFormError(err);
    console.error("[SplitAuthPage] Error rendering form:", err);
    formContent = <div className="text-red-400">Error rendering form: {String(err)}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-2xl px-4">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left side - Info & Branding */}
          <div className="hidden md:flex flex-col justify-between py-8">
            <div>
              <div className="mb-12">
                <div className="inline-block">
                  <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                    Moondala
                  </div>
                  <p className="text-lg text-gray-400 font-light tracking-wide">Social Commerce • Shared Profits</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                    <span className="text-cyan-400 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Sell & Earn</h3>
                    <p className="text-gray-400 text-sm">Create your shop and start earning immediately</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                    <span className="text-purple-400 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Shared Profits</h3>
                    <p className="text-gray-400 text-sm">Earn rewards when you refer friends to our platform</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/20 flex items-center justify-center flex-shrink-0 border border-fuchsia-500/30">
                    <span className="text-fuchsia-400 font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Safe & Secure</h3>
                    <p className="text-gray-400 text-sm">Your data is encrypted and protected end-to-end</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <p className="text-sm text-gray-500">Join thousands of creators and sellers worldwide</p>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="flex flex-col">
            {/* Mode toggle */}
            <div className="mb-8">
              <div className="flex gap-3 bg-gray-800/30 backdrop-blur-md p-1.5 rounded-xl border border-white/10 w-fit">
                <button
                  onClick={() => setSide("user")}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    side === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  User
                </button>
                <button
                  onClick={() => setSide("shop")}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    side === "shop"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Shop Owner
                </button>
              </div>
            </div>

            {/* Form container */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {mode === "login" ? "Welcome Back" : `Join as ${side === "user" ? "User" : "Seller"}`}
                </h2>
                <p className="text-gray-400 text-sm">
                  {mode === "login"
                    ? "Sign in to your account and continue"
                    : `Create your ${side === "user" ? "buyer" : "seller"} account to get started`}
                </p>
              </div>

              {/* Form content */}
              {formError && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-300 text-sm">Error: {String(formError)}</p>
                </div>
              )}
              {formContent}

              {/* Mode toggle */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-center text-gray-400 text-sm">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold hover:from-cyan-300 hover:to-purple-300 transition-all"
                  >
                    {mode === "login" ? "Create one" : "Sign in"}
                  </button>
                </p>
              </div>

              {/* Switch user type hint */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-gray-400 text-xs">
                  💡 {side === "user" ? "Are you a seller?" : "Looking to buy?"} Switch to{" "}
                  <button
                    onClick={() => setSide(side === "user" ? "shop" : "user")}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    {side === "user" ? "Shop Owner" : "User"}
                  </button>{" "}
                  mode above
                </p>
              </div>
            </div>

            {/* Mobile Moondala branding */}
            <div className="md:hidden text-center mt-8">
              <div className="inline-block">
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">
                  Moondala
                </div>
                <p className="text-sm text-gray-400">Social Commerce • Shared Profits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
