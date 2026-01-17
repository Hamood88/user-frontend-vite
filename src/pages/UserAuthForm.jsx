import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { ChipsMultiSelect } from "../components/ChipsMultiSelect";
import { DOBWithAge } from "../components/DOBWithAge";
import { ReferralField } from "../components/ReferralField";
import { Loader2, AlertCircle } from "lucide-react";
import { apiPost, setUserSession } from "../api";

console.log("[UserAuthForm] Module loaded");

function readInviterFromUrl() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const v =
      sp.get("inviter") ||
      sp.get("inviterCode") ||
      sp.get("ref") ||
      sp.get("refCode") ||
      sp.get("code") ||
      "";
    return String(v || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

export function UserAuthForm({ mode }) {
  console.log("[UserAuthForm] Rendering with mode:", mode);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const inviterFromLink = useMemo(() => readInviterFromUrl(), []);
  const [invitedByCode, setInvitedByCode] = useState("");

  const inviterLocked = Boolean(inviterFromLink);

  useEffect(() => {
    if (inviterFromLink) setInvitedByCode(inviterFromLink);
  }, [inviterFromLink]);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [favoriteSport, setFavoriteSport] = useState("");
  const [interests, setInterests] = useState([]);

  const interestOptions = [
    "Fashion",
    "Electronics",
    "Sports",
    "Beauty",
    "Home & Garden",
    "Books",
    "Toys",
    "Health",
    "Automotive",
    "Food & Beverage",
  ];

  const sportsOptions = [
    "Football",
    "Basketball",
    "Tennis",
    "Baseball",
    "Soccer",
    "Golf",
    "Swimming",
    "Running",
    "Cycling",
    "Yoga",
  ];

  const selectClass =
    "w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10 hover:ring-white/20 focus:outline-none focus:ring-2 focus:ring-white/20";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const payload = { email: email.trim(), password };

        const data = await apiPost("/auth/login", payload);
        setUserSession({ token: data.token, user: data.user });
        setError(null);
        navigate("/dashboard");
      } else {
        // ✅ REGISTRATION - validate all required fields
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
          throw new Error("Please fill in first name, last name, email, and password");
        }
        if (!phoneNumber.trim()) {
          throw new Error("Phone number is required");
        }
        if (!gender) {
          throw new Error("Gender is required");
        }
        if (!dateOfBirth) {
          throw new Error("Date of birth is required");
        }

        const finalReferralCode =
          referralCode.trim().toUpperCase() ||
          (() => {
            const generated = generateReferralCode();
            setReferralCode(generated);
            return generated;
          })();

        if (dateOfBirth) {
          const age = calculateAge(dateOfBirth);
          if (age < 10) throw new Error("You must be at least 10 years old to register");
        }

        const payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          referralCode: finalReferralCode,
          // ✅ REQUIRED fields (validated above)
          phoneNumber: phoneNumber.trim(),
          gender: gender.toLowerCase(),
          dateOfBirth: dateOfBirth,
        };

        if (invitedByCode.trim()) payload.invitedByCode = invitedByCode.trim().toUpperCase();
        if (country) payload.country = country;
        if (favoriteSport) payload.favoriteSport = favoriteSport;
        if (interests.length > 0) payload.interests = interests;

        const data = await apiPost("/auth/register", payload);
        setUserSession({ token: data.token, user: data.user });
        setError(null);
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
        <div
          className="flex items-start gap-2 p-3 bg-red-500/10 ring-1 ring-red-400/20 rounded-lg"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {mode === "register" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="John"
            />
            <Input
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Doe"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            showToggle
            placeholder="••••••••"
          />

          <ReferralField
            label="Your Referral Code"
            value={referralCode}
            onChange={setReferralCode}
            required
            autoGenerate
            helperText="Share this code to earn rewards when others sign up."
          />

          <Input
            label="Inviter Code"
            type="text"
            value={invitedByCode}
            onChange={(e) => setInvitedByCode(e.target.value.toUpperCase())}
            placeholder={inviterLocked ? "" : "Enter inviter code (optional)"}
            className="uppercase"
            locked={inviterLocked}
            helperText={
              inviterLocked
                ? "Inviter code was applied from your invite link."
                : "If you have an invite code, add it to earn referral benefits."
            }
          />

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/45 mb-3">Optional: Help us personalize your experience</p>
            <DOBWithAge value={dateOfBirth} onChange={setDateOfBirth} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <Input label="Country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" />
          </div>

          <Input label="Phone Number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 (555) 123-4567" />

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Favorite Sport</label>
            <select value={favoriteSport} onChange={(e) => setFavoriteSport(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              {sportsOptions.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <ChipsMultiSelect label="Interests" options={interestOptions} value={interests} onChange={setInterests} placeholder="Select your interests..." />
        </>
      ) : (
        <>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />

          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required showToggle placeholder="••••••••" />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-white/80" />
              <span className="text-white/60">Remember me</span>
            </label>
            <a href="#" className="text-cyan-200 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-white/20 rounded px-1">Forgot password?</a>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg py-2.5 px-4 font-medium transition-all flex items-center justify-center gap-2
          bg-gradient-to-r from-cyan-400/25 via-purple-500/25 to-fuchsia-500/25
          ring-1 ring-white/10 hover:ring-white/20 hover:bg-white/10
          shadow-[0_0_30px_rgba(34,211,238,0.12)]
          disabled:opacity-50 disabled:cursor-not-allowed"
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

function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default UserAuthForm;
