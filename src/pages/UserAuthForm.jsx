import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Lock, User, Phone, Globe, AlertCircle } from "lucide-react";
import { apiPost, setUserSession } from "../api";
import { Button, Input, Alert, Label, Select, Checkbox } from "../components/ui";
import { countries } from "../utils/countries";

// Validation utilities from Figma
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const calculateAge = (dateString) => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return minLength && hasUpper && hasLower && hasNumber;
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const SPORTS = [
  "Football", "Basketball", "Tennis", "Cricket", "Volleyball", "Baseball",
  "Golf", "Swimming", "Track & Field", "Gymnastics", "Running", "Other"
];

const INTERESTS = [
  "Fashion", "Electronics", "Sports", "Beauty", "Home & Garden",
  "Books", "Toys", "Health", "Automotive", "Food & Beverage"
];

export function UserAuthForm({ mode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [country, setCountry] = useState("");
  const [favoriteSport, setFavoriteSport] = useState("");
  const [interests, setInterests] = useState([]);
  
  // Get inviter code from URL params first, then fallback to localStorage
  const [inviterCode, setInviterCode] = useState(() => {
    const urlInviter = searchParams.get("inviter");
    if (urlInviter) return urlInviter;
    try {
      return localStorage.getItem("referralCode") || "";
    } catch {
      return "";
    }
  });

  const handleInterestChange = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!validateEmail(email)) {
          throw new Error("Please enter a valid email address");
        }
        
        const data = await apiPost("/auth/login", { email: email.trim(), password });
        setSuccess(true);
        setUserSession({ token: data.token, user: data.user });
        setTimeout(() => navigate("/feed"), 500);
      } else if (mode === "signup") {
        // Validate required fields
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
          throw new Error("Please fill in all required fields");
        }

        if (!validateEmail(email)) {
          throw new Error("Please enter a valid email address");
        }

        if (!validatePassword(password)) {
          throw new Error("Password must be at least 8 characters with uppercase, lowercase, and numbers");
        }

        // Validate phone (required)
        if (!phone.trim()) {
          throw new Error("Phone number is required");
        }

        // Validate gender (required)
        if (!gender) {
          throw new Error("Gender is required");
        }

        // Validate DOB (required)
        if (!dobDay || !dobMonth || !dobYear) {
          throw new Error("Date of birth is required");
        }
        
        const dateStr = `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`;
        const age = calculateAge(dateStr);
        if (age < 10) {
          throw new Error("You must be at least 10 years old to register");
        }

        // Validate country (required)
        if (!country) {
          throw new Error("Country is required");
        }

        // Validate interests (required - at least 1)
        if (interests.length < 1) {
          throw new Error("Please select at least 1 interest");
        }

        const registerData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phoneNumber: phone.trim(),
          gender: gender.toLowerCase(), // Convert M/F/Other to male/female/other
          dateOfBirth: dateStr, // Format: YYYY-MM-DD
          country: country,
          interests: interests,
        };

        if (favoriteSport) registerData.favoriteSport = favoriteSport;
        if (inviterCode.trim()) registerData.invitedByCode = inviterCode.trim().toUpperCase();

        const data = await apiPost("/auth/register", registerData);
        setSuccess(true);
        setUserSession({ token: data.token, user: data.user });
        // Clear referral data after successful registration
        try {
          localStorage.removeItem("referralCode");
          localStorage.removeItem("referralMessage");
        } catch {}
        setTimeout(() => navigate("/feed"), 500);
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
      {success && <Alert type="success" message="Success! Redirecting..." />}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {mode === "login" ? (
        <>
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

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-900/40" />
              <span className="text-gray-400">Remember me</span>
            </label>
            <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">Forgot password?</a>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="mb-2 block text-xs">First Name *</Label>
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
              <Label htmlFor="lastName" className="mb-2 block text-xs">Last Name *</Label>
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

          <div>
            <Label htmlFor="email" className="mb-2 block text-xs">Email *</Label>
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

          <div>
            <Label htmlFor="password" className="mb-2 block text-xs">
              Password * <span className="text-gray-500 text-xs ml-1">(8+ chars, uppercase, lowercase, number)</span>
            </Label>
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

          <div>
            <Label htmlFor="phone" className="mb-2 block text-xs">Phone Number *</Label>
            <Input
              id="phone"
              icon={Phone}
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="gender" className="mb-2 block text-xs">Gender *</Label>
            <Select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              placeholder="Select gender"
            />
          </div>

          <div>
            <Label className="mb-2 block text-xs">Date of Birth *</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                options={Array.from({ length: 31 }, (_, i) => ({
                  value: String(i + 1),
                  label: String(i + 1).padStart(2, '0')
                }))}
                placeholder="Day"
              />
              <Select
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                options={[
                  { value: "1", label: "January" },
                  { value: "2", label: "February" },
                  { value: "3", label: "March" },
                  { value: "4", label: "April" },
                  { value: "5", label: "May" },
                  { value: "6", label: "June" },
                  { value: "7", label: "July" },
                  { value: "8", label: "August" },
                  { value: "9", label: "September" },
                  { value: "10", label: "October" },
                  { value: "11", label: "November" },
                  { value: "12", label: "December" },
                ]}
                placeholder="Month"
              />
              <Select
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                options={Array.from({ length: 80 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return { value: String(year), label: String(year) };
                })}
                placeholder="Year"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country" className="mb-2 block text-xs">Country *</Label>
            <Select
              id="country"
              icon={Globe}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={countries.map(c => ({ value: c, label: c }))}
              placeholder="Select country"
            />
          </div>

          <div>
            <Label htmlFor="sport" className="mb-2 block text-xs">Favorite Sport</Label>
            <Select
              id="sport"
              value={favoriteSport}
              onChange={(e) => setFavoriteSport(e.target.value)}
              options={SPORTS.map(s => ({ value: s, label: s }))}
              placeholder="Select sport"
            />
          </div>

          <div>
            <Label className="mb-3 block text-xs">Interests *</Label>
            <div className="interests-grid">
              {INTERESTS.map(interest => (
                <label
                  key={interest}
                  className={`interest-chip ${interests.includes(interest) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="inviterCode" className="mb-2 block text-xs">
              Invited By Code {inviterCode && <span className="text-green-400">(Auto-filled from your referral link)</span>}
            </Label>
            <Input
              id="inviterCode"
              type="text"
              placeholder="Enter inviter code if you have one"
              value={inviterCode}
              onChange={(e) => setInviterCode(e.target.value)}
              disabled={!!inviterCode}
              className={inviterCode ? "bg-green-500/10 border-green-500/30" : ""}
            />
          </div>
        </>
      )}

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

