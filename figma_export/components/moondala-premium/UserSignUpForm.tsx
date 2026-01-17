import { useState, FormEvent } from 'react';
import { User, Mail, Lock, Phone, MapPin, Dumbbell } from 'lucide-react';
import { PremiumInput } from './PremiumInput';
import { PremiumButton } from './PremiumButton';
import { PremiumDropdown } from './PremiumDropdown';
import { DOBSelector } from './DOBSelector';
import { MultiSelectChips } from './MultiSelectChips';
import { LockedInput } from './LockedInput';
import { countries } from '../../utils/countries';

interface UserSignUpFormProps {
  inviterCode: string | null;
}

export function UserSignUpForm({ inviterCode }: UserSignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [country, setCountry] = useState('');
  const [favoriteSport, setFavoriteSport] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [userInviterCode, setUserInviterCode] = useState(inviterCode || '');

  const sports = [
    'Football', 'Basketball', 'Tennis', 'Baseball', 'Soccer', 'Golf',
    'Swimming', 'Running', 'Cycling', 'Yoga', 'Boxing', 'Cricket',
    'Hockey', 'Volleyball', 'Badminton', 'Table Tennis', 'Skiing',
    'Surfing', 'Skateboarding', 'Martial Arts', 'Wrestling', 'Rugby',
  ];

  const interestOptions = [
    'Fashion', 'Electronics', 'Sports', 'Beauty', 'Home & Garden',
    'Books', 'Toys', 'Health', 'Automotive', 'Food & Beverage',
    'Travel', 'Music', 'Gaming', 'Fitness', 'Art', 'Photography',
    'Jewelry', 'Watches', 'Shoes', 'Bags', 'Cosmetics', 'Skincare',
    'Furniture', 'Decor', 'Kitchen', 'Pets', 'Baby Products', 'Outdoors',
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert('User account created!');
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <PremiumInput
          label="First Name"
          icon={<User className="w-5 h-5" />}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <PremiumInput
          label="Last Name"
          icon={<User className="w-5 h-5" />}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <PremiumInput
        label="Email"
        type="email"
        icon={<Mail className="w-5 h-5" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <PremiumInput
        label="Password"
        type="password"
        icon={<Lock className="w-5 h-5" />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        showPasswordToggle
      />

      <PremiumInput
        label="Phone Number"
        type="tel"
        icon={<Phone className="w-5 h-5" />}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+1 (555) 000-0000"
        required
      />

      <PremiumDropdown
        label="Gender"
        value={gender}
        onChange={setGender}
        options={['Male', 'Female', 'Other', 'Prefer not to say']}
        required
      />

      <DOBSelector
        day={dobDay}
        month={dobMonth}
        year={dobYear}
        onDayChange={setDobDay}
        onMonthChange={setDobMonth}
        onYearChange={setDobYear}
        required
      />

      <PremiumDropdown
        label="Country"
        value={country}
        onChange={setCountry}
        options={countries}
        searchable
        required
      />

      <PremiumDropdown
        label="Favorite Sport"
        value={favoriteSport}
        onChange={setFavoriteSport}
        options={sports}
        icon={<Dumbbell className="w-5 h-5" />}
      />

      <MultiSelectChips
        label="Interests"
        selected={interests}
        onChange={setInterests}
        options={interestOptions}
      />

      <LockedInput
        label="Inviter Code"
        value={userInviterCode}
        onChange={setUserInviterCode}
        isLocked={!!inviterCode}
        helperText={
          inviterCode
            ? 'Inviter code was applied from your invite link.'
            : 'If you have an invite code, add it to earn referral benefits.'
        }
        tooltipText="Enter the code shared by someone who invited you. You'll both earn rewards!"
      />

      <PremiumButton type="submit" isLoading={isLoading} accentColor="blue">
        Create User Account
      </PremiumButton>

      <p className="text-center text-xs text-white/40">
        Already have an account?{' '}
        <button type="button" className="text-[#50C9C3] hover:underline">
          Log In
        </button>
      </p>

      <p className="text-center text-xs text-white/30 pt-2 border-t border-white/5">
        By continuing you agree to{' '}
        <button type="button" className="text-white/50 hover:text-[#50C9C3]">
          Terms
        </button>
        {' & '}
        <button type="button" className="text-white/50 hover:text-[#50C9C3]">
          Privacy
        </button>
        .
      </p>
    </form>
  );
}