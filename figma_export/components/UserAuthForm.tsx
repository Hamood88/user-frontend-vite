import { useState, FormEvent } from 'react';
import { Input } from './Input';
import { ChipsMultiSelect } from './ChipsMultiSelect';
import { DOBWithAge } from './DOBWithAge';
import { ReferralField } from './ReferralField';
import { Loader2, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface UserAuthFormProps {
  mode: AuthMode;
}

export function UserAuthForm({ mode }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [invitedByCode, setInvitedByCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [favoriteSport, setFavoriteSport] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const interestOptions = [
    'Fashion', 'Electronics', 'Sports', 'Beauty', 'Home & Garden', 
    'Books', 'Toys', 'Health', 'Automotive', 'Food & Beverage'
  ];

  const sportsOptions = [
    'Football', 'Basketball', 'Tennis', 'Baseball', 'Soccer', 
    'Golf', 'Swimming', 'Running', 'Cycling', 'Yoga'
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        // API: POST /api/auth/login
        const payload = {
          email: email.trim(),
          password,
        };

        console.log('Login payload:', payload);
        
        // Mock API call
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const data = await response.json();
        // Store token and user data
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('Login successful! Redirecting...');
        // window.location.href = '/dashboard';
      } else {
        // Validate required fields
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
          throw new Error('Please fill in all required fields');
        }

        // Ensure referralCode is generated
        const finalReferralCode = referralCode.trim().toUpperCase() || (() => {
          const generated = generateReferralCode();
          setReferralCode(generated);
          return generated;
        })();

        // Validate age if provided
        if (dateOfBirth) {
          const age = calculateAge(dateOfBirth);
          if (age < 10) {
            throw new Error('You must be at least 10 years old to register');
          }
        }

        // API: POST /api/auth/register
        // Send exact keys expected by backend (User.js model)
        const payload: any = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          referralCode: finalReferralCode,
        };

        // Add optional fields only if present
        if (invitedByCode.trim()) payload.invitedByCode = invitedByCode.trim().toUpperCase();
        if (dateOfBirth) payload.dateOfBirth = dateOfBirth; // ISO format YYYY-MM-DD
        if (gender) payload.gender = gender.toLowerCase();
        if (country) payload.country = country;
        if (phoneNumber.trim()) payload.phoneNumber = phoneNumber.trim();
        if (favoriteSport) payload.favoriteSport = favoriteSport;
        if (interests.length > 0) payload.interests = interests;

        console.log('Register payload:', payload);

        // Mock API call
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        
        // Store token and user data
        if (data.token) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        alert('Registration successful! Welcome to SocialCommerce!');
        // window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {mode === 'register' ? (
        <>
          {/* Name Fields */}
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

          {/* Referral Code - Required, Auto-generate */}
          <ReferralField
            label="Your Referral Code"
            value={referralCode}
            onChange={setReferralCode}
            required
            autoGenerate
            helperText="This is your unique code. Share it to earn rewards when others sign up!"
          />

          {/* Invited By Code - Optional */}
          <Input
            label="Invited By (Optional)"
            type="text"
            value={invitedByCode}
            onChange={(e) => setInvitedByCode(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="uppercase"
          />

          {/* Optional Profile Fields */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3">Optional: Help us personalize your experience</p>
            
            <DOBWithAge
              value={dateOfBirth}
              onChange={setDateOfBirth}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <Input
              label="Country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="USA"
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Favorite Sport</label>
            <select
              value={favoriteSport}
              onChange={(e) => setFavoriteSport(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {sportsOptions.map((sport) => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <ChipsMultiSelect
            label="Interests"
            options={interestOptions}
            value={interests}
            onChange={setInterests}
            placeholder="Select your interests..."
          />
        </>
      ) : (
        <>
          {/* Login Mode - Minimal Fields */}
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <span className="text-slate-600">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
              Forgot password?
            </a>
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Please wait...
          </>
        ) : (
          mode === 'login' ? 'Sign In' : 'Create Account'
        )}
      </button>

      {mode === 'login' && (
        <p className="text-center text-sm text-slate-600">
          New to SocialCommerce?{' '}
          <button type="button" className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
            Create an account
          </button>
        </p>
      )}
    </form>
  );
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
