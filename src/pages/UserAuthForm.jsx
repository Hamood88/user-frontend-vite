import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { apiPost, setUserSession } from "../api";
import { Button, Input, Alert, Label } from "../components/ui";

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
      {success && <Alert type="success" message="Success! Redirecting..." />}

      {/* Error message */}
      {error && <Alert type="error" message={error} />}

      {/* Register fields */}
      {mode === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="mb-2 block">First Name *</Label>
            <Input
              id="firstName"
              icon={User}
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="mb-2 block">Last Name *</Label>
            <Input
              id="lastName"
              icon={User}
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      {/* Email */}
      <div>
        <Label htmlFor="email" className="mb-2 block">Email *</Label>
        <Input
          id="email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password" className="mb-2 block">Password *</Label>
        <Input
          id="password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Remember & Forgot */}
      {mode === "login" && (
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-900/40" />
            <span className="text-gray-400">Remember me</span>
          </label>
          <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">Forgot password?</a>
        </div>
      )}

      {/* Submit button */}
      <Button 
        type="submit" 
        variant="default" 
        className="w-full mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === "login" ? "Signing in..." : "Creating account..."}
          </>
        ) : (
          mode === "login" ? "Log In" : "Sign Up"
        )}
      </Button>
    </form>
  );
}

export default UserAuthForm;
