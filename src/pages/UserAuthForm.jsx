import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Mail, Lock, User, CheckCircle } from "lucide-react";
import { apiPost, setUserSession } from "../api";

console.log("[UserAuthForm] Module loaded");

export function UserAuthForm({ mode }) {
  console.log("[UserAuthForm] Rendering with mode:", mode);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const data = await apiPost("/auth/login", { email: email.trim(), password });
        setSuccess(true);
        setUserSession({ token: data.token, user: data.user });
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        const data = await apiPost("/auth/register", {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        });
        setSuccess(true);
        setUserSession({ token: data.token, user: data.user });
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 ring-1 ring-green-400/30 rounded-xl animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300 font-medium">Success! Redirecting...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 ring-1 ring-red-400/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Register fields */}
      {mode === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/40" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={mode === "register"}
                placeholder="John"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/[0.06] transition-all outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/40" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required={mode === "register"}
                placeholder="Doe"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/[0.06] transition-all outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email field */}
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/40" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/[0.06] transition-all outline-none"
          />
        </div>
      </div>

      {/* Password field */}
      <div>
        <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/40" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/[0.06] transition-all outline-none"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || success}
        className="w-full mt-2 rounded-xl py-3 px-4 font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-cyan-600/50 disabled:to-cyan-700/50 disabled:cursor-not-allowed text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Success!
          </>
        ) : mode === "login" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}

export default UserAuthForm;
