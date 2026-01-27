import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, Mail, Lock, User, Phone, Globe, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiPost, setUserSession } from "../api";
import { Button, Input, Alert, Label, Select, Checkbox } from "../components/ui";
import { countries } from "../utils/countries";
import { countryCodes } from "../utils/countryCodes";
import { 
  setupRecaptcha, 
  sendVerificationCode, 
  verifyCode, 
  resendVerificationCode,
  cleanupFirebaseAuth,
  formatPhoneNumber,
  getFirebaseIdToken
} from "../utils/firebasePhoneAuth";

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
  "Soccer", "Football", "Basketball", "Tennis", "Cricket", "Volleyball", 
  "Baseball", "Golf", "Swimming", "Track & Field", "Gymnastics", "Running",
  "Boxing", "MMA", "Cycling", "Skiing", "Surfing", "Hockey", "Rugby",
  "Table Tennis", "Badminton", "Wrestling", "Archery", "Martial Arts", "Other"
];

const INTERESTS = [
  "Fashion", "Electronics", "Sports", "Beauty", "Home & Garden",
  "Books", "Toys", "Health", "Automotive", "Food & Beverage"
];

export function UserAuthForm({ mode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+1");
  const [gender, setGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [country, setCountry] = useState("");
  const [favoriteSport, setFavoriteSport] = useState("");
  const [interests, setInterests] = useState([]);
  
  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  
  // Terms Agreement
  const [termsAgreed, setTermsAgreed] = useState(false);
  
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

  // Setup reCAPTCHA on component mount
  useEffect(() => {
    if (mode === "signup") {
      setupRecaptcha();
    }
    
    // Cleanup on unmount
    return () => {
      cleanupFirebaseAuth();
    };
  }, [mode]);

  const handleInterestChange = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setVerificationInProgress(true);
    
    try {
      // Step 1: Verify code with Firebase
      const result = await verifyCode(otp);
      console.log('✅ Firebase verification successful');
      
      // Step 2: Get Firebase ID token (this proves verification happened)
      const firebaseToken = await getFirebaseIdToken();
      console.log('✅ Got Firebase ID token');
      
      // Step 3: Send token to backend for server-side verification
      const res = await apiPost("/auth/verify-phone", { 
        email: email.trim(), 
        firebaseToken: firebaseToken
      });
      
      if (res.success) {
        console.log('✅ Backend verified Firebase token');
        
        // Auto-login with credentials
        const loginData = await apiPost("/auth/login", { email: email.trim(), password });
        setUserSession({ token: loginData.token, user: loginData.user });
        setSuccess(true);
        
        // Clear referral data
        try {
          localStorage.removeItem("referralCode");
          localStorage.removeItem("referralMessage");
        } catch {}
        
        setTimeout(() => navigate("/feed"), 500);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Verification failed. Please check the code and try again.");
    } finally {
      setIsLoading(false);
      setVerificationInProgress(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      const formattedPhone = `${phoneCode}${phone.trim()}`;
      await resendVerificationCode(formattedPhone);
      alert("Verification code resent!");
    } catch (err) {
      console.error("Resend error:", err);
      alert(err.message || "Failed to resend code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!validateEmail(email)) {
          throw new Error('Invalid email address');
        }
        
        const data = await apiPost("/auth/login", { email: email.trim(), password });
        setSuccess(true);
        setUserSession({ token: data.token, user: data.user });
        setTimeout(() => navigate("/feed"), 500);
      } else if (mode === "signup") {
        // Validate required fields
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
          throw new Error('All fields are required');
        }

        if (!validateEmail(email)) {
          throw new Error('Invalid email address');
        }

        if (!validatePassword(password)) {
          throw new Error('Password must meet requirements');
        }

        // Validate phone (required)
        if (!phone.trim()) {
          throw new Error('Phone number is required');
        }

        // Validate gender (required)
        if (!gender) {
          throw new Error('Gender is required');
        }

        // Validate DOB (required)
        if (!dobDay || !dobMonth || !dobYear) {
          throw new Error('Date of birth is required');
        }
        
        const dateStr = `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`;
        const age = calculateAge(dateStr);
        if (age < 10) {
          throw new Error('You must be at least 10 years old');
        }

        // Validate country (required)
        if (!country) {
          throw new Error('Country is required');
        }

        // Validate interests (required - at least 1)
        if (interests.length < 1) {
          throw new Error('Select at least one interest');
        }

        // Combine phone code and phone number
        const fullPhoneNumber = `${phoneCode}${phone.trim()}`;

        const registerData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phoneNumber: fullPhoneNumber,
          gender: gender.toLowerCase(), // Convert M/F/Other to male/female/other
          dateOfBirth: dateStr, // Format: YYYY-MM-DD
          country: country,
          interests: interests,
        };

        // Add language preference from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const langPref = urlParams.get('lang') || localStorage.getItem('userLanguage');
        if (langPref) {
           registerData.language = langPref;
        }

        if (favoriteSport) registerData.favoriteSport = favoriteSport;
        if (inviterCode.trim()) registerData.invitedByCode = inviterCode.trim().toUpperCase();

        const data = await apiPost("/auth/register", registerData);
        
        // After successful registration, send Firebase verification code
        setSuccess(false);
        
        // Send verification code via Firebase
        try {
          const formattedPhone = `${phoneCode}${phone.trim()}`;
          console.log('📱 Sending verification code to:', formattedPhone);
          
          const confirmationResult = await sendVerificationCode(formattedPhone);
          console.log('✅ Verification code sent successfully');
          
          // Now show verification UI
          setIsVerifying(true);
        } catch (firebaseErr) {
          console.error("Firebase error:", firebaseErr);
          
          // Provide more specific error messages
          let errorMessage = "Failed to send verification code. ";
          if (firebaseErr.code === 'auth/invalid-phone-number') {
            errorMessage += "Invalid phone number format.";
          } else if (firebaseErr.code === 'auth/too-many-requests') {
            errorMessage += "Too many requests. Please try again later.";
          } else if (firebaseErr.code === 'auth/quota-exceeded') {
            errorMessage += "SMS quota exceeded. Please try again later.";
          } else {
            errorMessage += firebaseErr.message || "Please try again.";
          }
          
          setError(errorMessage);
          setIsVerifying(false);
          return;
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <form onSubmit={handleVerify} className="space-y-6">
        {/* reCAPTCHA container (invisible) */}
        <div id="recaptcha-container"></div>
        
        <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto text-teal-400">
                <Phone size={24} />
            </div>
            <h3 className="text-lg font-medium text-white">Verify Phone Number</h3>
            <p className="text-sm text-gray-400">
                We sent a 6-digit code to <b>{phoneCode} {phone}</b> via SMS.
            </p>
            <p className="text-xs text-gray-500">
                Please enter the code to verify your phone number.
            </p>
        </div>

        {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
            </div>
        )}

        <div>
            <Label htmlFor="otp" className="mb-2 block">Enter 6-digit Code</Label>
            <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center tracking-widest text-xl"
                maxLength={6}
                required
                disabled={verificationInProgress}
            />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Verify Code
        </Button>
        
        <div className="text-center">
            <button 
              type="button" 
              onClick={handleResend} 
              className="text-sm text-teal-400 hover:text-teal-300 disabled:opacity-50"
              disabled={verificationInProgress}
            >
                Didn't receive code? Resend
            </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
      {/* reCAPTCHA container (invisible) */}
      <div id="recaptcha-container"></div>
      
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
            <Label htmlFor="email" className="mb-2 block">Email Address</Label>
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
            <Label htmlFor="password" className="mb-2 block">Password</Label>
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
              <Label htmlFor="firstName" className="mb-2 block text-xs">First Name</Label>
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
              <Label htmlFor="lastName" className="mb-2 block text-xs">Last Name</Label>
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
            <Label htmlFor="email" className="mb-2 block text-xs">Email Address</Label>
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
              Password <span className="text-gray-500 text-xs ml-1">(8+ chars, uppercase, number)</span>
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
            <Label htmlFor="country" className="mb-2 block text-xs">Country</Label>
            <Select
              id="country"
              icon={Globe}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                // Auto-set phone code based on country
                const countryData = countryCodes.find(c => c.country === e.target.value);
                if (countryData) {
                  setPhoneCode(countryData.code);
                }
              }}
              options={countries.map(c => ({ value: c, label: c }))}
              placeholder="Select country"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2 block text-xs">Phone Number</Label>
            <div className="flex gap-2 items-center">
              <div className="px-4 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-300 font-medium min-w-[80px] text-center">
                {phoneCode}
              </div>
              <Input
                id="phone"
                icon={Phone}
                type="tel"
                placeholder="234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender" className="mb-2 block text-xs">Gender</Label>
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

          <div>
            <Label htmlFor="sport" className="mb-2 block text-xs">Favorite Sport (Optional)</Label>
            <Select
              id="sport"
              value={favoriteSport}
              onChange={(e) => setFavoriteSport(e.target.value)}
              options={SPORTS.map(s => ({ value: s, label: s }))}
              placeholder="Select a sport"
            />
          </div>

          <div>
            <Label className="mb-3 block text-xs">Interests</Label>
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
              Invitation Code <span className="text-gray-500">(Optional)</span> {inviterCode && <span className="text-green-400">(Auto-filled)</span>}
            </Label>
            <Input
              id="inviterCode"
              type="text"
              placeholder="ABC12345"
              value={inviterCode}
              onChange={(e) => setInviterCode(e.target.value)}
              disabled={!!inviterCode}
              className={inviterCode ? "bg-green-500/10 border-green-500/30" : ""}
            />
          </div>
        </>
      )}

      {mode === "signup" && (
        <div className="flex items-start gap-3 mt-4">
          <input
            type="checkbox"
            id="termsAgreement"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 text-primary bg-background border-2 border-primary/30 rounded cursor-pointer flex-shrink-0"
          />
          <label htmlFor="termsAgreement" className="text-sm leading-relaxed cursor-pointer text-foreground">
            {t('legal.agreeToTerms')}{' '}
            <Link to="/legal/terms" target="_blank" className="text-foreground underline hover:opacity-80">
              {t('legal.termsLink')}
            </Link>
            {', '}
            <Link to="/legal/privacy" target="_blank" className="text-foreground underline hover:opacity-80">
              {t('legal.privacyLink')}
            </Link>
            {', '}{t('legal.and')}{' '}
            <Link to="/legal/referrals" target="_blank" className="text-foreground underline hover:opacity-80">
              {t('legal.referralPolicyLink')}
            </Link>
            .
          </label>
        </div>
      )}

      <Button 
        type="submit" 
        variant="default" 
        className="w-full mt-6"
        disabled={isLoading || (mode === "signup" && !termsAgreed)}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === "login" ? 'Logging in...' : 'Creating Account...'}
          </>
        ) : (
          mode === "login" ? 'Log In' : 'Create Account'
        )}
      </Button>
    </form>
  );
}

export default UserAuthForm;

