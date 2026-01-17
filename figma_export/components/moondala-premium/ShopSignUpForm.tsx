import { useState, FormEvent } from 'react';
import { Store, Mail, Lock, User, Phone } from 'lucide-react';
import { PremiumInput } from './PremiumInput';
import { PremiumButton } from './PremiumButton';
import { PremiumDropdown } from './PremiumDropdown';
import { DOBSelector } from './DOBSelector';
import { LockedInput } from './LockedInput';
import { countries } from '../../utils/countries';

interface ShopSignUpFormProps {
  inviterCode: string | null;
}

export function ShopSignUpForm({ inviterCode }: ShopSignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [country, setCountry] = useState('');
  const [shopInviterCode, setShopInviterCode] = useState(inviterCode || '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert('Shop account created!');
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
      <PremiumInput
        label="Shop Name"
        icon={<Store className="w-5 h-5" />}
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        required
      />

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
        label="Phone Number"
        type="tel"
        icon={<Phone className="w-5 h-5" />}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+1 (555) 000-0000"
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

      <LockedInput
        label="Inviter Code"
        value={shopInviterCode}
        onChange={setShopInviterCode}
        isLocked={!!inviterCode}
        helperText={
          inviterCode
            ? 'Inviter code was applied from your invite link.'
            : 'If you have an invite code, add it to earn referral benefits.'
        }
        tooltipText="Enter the code shared by someone who invited you. You'll both earn rewards!"
      />

      <PremiumButton type="submit" isLoading={isLoading} accentColor="gold">
        Create Shop Account
      </PremiumButton>

      <p className="text-center text-xs text-white/40">
        Already have a shop account?{' '}
        <button type="button" className="text-[#D4AF37] hover:underline">
          Log In
        </button>
      </p>

      <p className="text-center text-xs text-white/30 pt-2 border-t border-white/5">
        By continuing you agree to{' '}
        <button type="button" className="text-white/50 hover:text-[#D4AF37]">
          Terms
        </button>
        {' & '}
        <button type="button" className="text-white/50 hover:text-[#D4AF37]">
          Privacy
        </button>
        .
      </p>
    </form>
  );
}