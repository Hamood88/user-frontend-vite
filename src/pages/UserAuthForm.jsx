import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Lock, User, Phone, Globe } from "lucide-react";
import { apiPost, setUserSession } from "../api";
import { Button, Input, Alert, Label, Select, Checkbox } from "../components/ui";

console.log("[UserAuthForm] Module loaded");

// Country list (195+ countries)
const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "IN", label: "India" },
  { value: "PK", label: "Pakistan" },
  { value: "BD", label: "Bangladesh" },
  { value: "NG", label: "Nigeria" },
  { value: "ZA", label: "South Africa" },
  { value: "EG", label: "Egypt" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SG", label: "Singapore" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
].sort((a, b) => a.label.localeCompare(b.label));

const SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Cricket",
  "Volleyball",
  "Baseball",
  "Golf",
  "Swimming",
  "Track & Field",
  "Gymnastics",
  "Other"
];

const INTERESTS = [
  "Music",
  "Art",
  "Technology",
  "Fashion",
  "Travel",
  "Food",
  "Gaming",
  "Fitness",
  "Reading",
  "Photography",
  "Movies",
  "Business"
];

export function UserAuthForm({ mode }) {
  console.log("[UserAuthForm] Rendering with mode:", mode);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Basic fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Extended fields
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [country, setCountry] = useState("");
  const [favoriteSport, setFavoriteSport] = useState("");
  const [interests, setInterests] = useState([]);
  const [inviterCode, setInviterCode] = useState(searchParams.get("inviter") || "");

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
        const data = await apiPost("/auth/login", { email: email.trim(), password });
        setSuccess(true);
        setUserSession({ token: data.token, user: data.user });
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        // Validate required fields
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
          throw new Error("Please fill in all required fields");
        }

        const registerData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        };

        // Add optional fields if provided
        if (phone.trim()) registerData.phone = phone.trim();
        if (gender) registerData.gender = gender;
        if (dobDay && dobMonth && dobYear) {
          registerData.dateOfBirth = `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;
        }
        if (country) registerData.country = country;
        if (favoriteSport) registerData.favoriteSport = favoriteSport;
        if (interests.length > 0) registerData.interests = interests;
        if (inviterCode.trim()) registerData.inviterCode = inviterCode.trim();

        const data = await apiPost("/auth/register", registerData);
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
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
      {/* Success message */}
      {success && <Alert type="success" message="Success! Redirecting..." />}

      {/* Error message */}
      {error && <Alert type="error" message={error} />}

      {/* LOGIN MODE */}
      {mode === "login" ? (
        <>
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
          {/* REGISTER MODE - Basic Fields */}
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

          {/* Email */}
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

          {/* Password */}
          <div>
            <Label htmlFor="password" className="mb-2 block text-xs">Password *</Label>
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

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="mb-2 block text-xs">Phone Number</Label>
            <Input
              id="phone"
              icon={Phone}
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender" className="mb-2 block text-xs">Gender</Label>
            <Select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
              placeholder="Select gender"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Label className="mb-2 block text-xs">Date of Birth</Label>
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

          {/* Country */}
          <div>
            <Label htmlFor="country" className="mb-2 block text-xs">Country</Label>
            <Select
              id="country"
              icon={Globe}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={COUNTRIES}
              placeholder="Select country"
            />
          </div>

          {/* Favorite Sport */}
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

          {/* Interests */}
          <div>
            <Label className="mb-2 block text-xs">Interests</Label>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map(interest => (
                <Checkbox
                  key={interest}
                  id={`interest-${interest}`}
                  label={interest}
                  checked={interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                />
              ))}
            </div>
          </div>

          {/* Inviter Code */}
          <div>
            <Label htmlFor="inviterCode" className="mb-2 block text-xs">Inviter Code (if any)</Label>
            <Input
              id="inviterCode"
              type="text"
              placeholder="Enter inviter code"
              value={inviterCode}
              onChange={(e) => setInviterCode(e.target.value)}
              disabled={!!searchParams.get("inviter")}
            />
          </div>
        </>
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

