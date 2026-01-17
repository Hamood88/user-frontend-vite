import { useState } from "react";
import UserAuthForm from "./UserAuthForm";
import ShopAuthForm from "./ShopAuthForm";

export default function SplitAuthPage() {
  const [mode, setMode] = useState("login");
  const [side, setSide] = useState("user");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Moondala</h1>
        <p className="text-lg text-gray-400">Social Commerce • Shared Profits</p>
      </div>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${side === "user" ? "bg-fuchsia-700 text-white" : "bg-gray-800 text-gray-300"}`}
          onClick={() => setSide("user")}
        >
          User
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${side === "shop" ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-300"}`}
          onClick={() => setSide("shop")}
        >
          Shop
        </button>
      </div>
      <div className="flex gap-4 mb-8">
        <button
          className={`px-5 py-2 rounded-md font-medium transition-all ${mode === "login" ? "bg-white/10 text-white" : "bg-gray-800 text-gray-300"}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`px-5 py-2 rounded-md font-medium transition-all ${mode === "register" ? "bg-white/10 text-white" : "bg-gray-800 text-gray-300"}`}
          onClick={() => setMode("register")}
        >
          Create Account
        </button>
      </div>
      <div className="w-full max-w-md bg-gray-900/80 rounded-2xl shadow-xl p-8">
        {side === "user" ? (
          <UserAuthForm mode={mode} />
        ) : (
          <ShopAuthForm mode={mode} />
        )}
      </div>
    </div>
  );
}
