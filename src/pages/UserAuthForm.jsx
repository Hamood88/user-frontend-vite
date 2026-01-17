import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { apiPost, setUserSession } from "../api";

console.log("[UserAuthForm] Module loaded");

export function UserAuthForm({ mode }) {
  console.log("[UserAuthForm] Rendering with mode:", mode);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const data = await apiPost("/auth/login", { email: email.trim(), password });
        setUserSession({ token: data.token, user: data.user });
        navigate("/dashboard");
      } else {
        const data = await apiPost("/auth/register", {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        });
        setUserSession({ token: data.token, user: data.user });
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 ring-1 ring-red-400/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {mode === "register" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={mode === "register"}
                placeholder="John"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required={mode === "register"}
                placeholder="Doe"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 outline-none"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="john@example.com"
          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg py-2.5 px-4 font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400/25 via-purple-500/25 to-fuchsia-500/25 ring-1 ring-white/10 hover:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Please wait...
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
