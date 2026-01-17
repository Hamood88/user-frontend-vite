import { useState, useEffect } from 'react';
import { LucideIcon, Gift, TrendingUp, Shield, Package, BarChart3, Users } from 'lucide-react';
import { BenefitRow } from './BenefitRow';
import { UserAuthForm } from './UserAuthForm';
import { ShopAuthForm } from './ShopAuthForm';

type AuthMode = 'login' | 'register';

interface AuthPanelProps {
  type: 'user' | 'shop';
  mode: AuthMode;
  isActive: boolean;
  onFocus: () => void;
  icon: LucideIcon;
  title: string;
  hint: string;
}

export function AuthPanel({ type, mode, isActive, onFocus, icon: Icon, title, hint }: AuthPanelProps) {
  const [benefitIndex, setBenefitIndex] = useState(0);

  const userBenefits = [
    {
      icon: Gift,
      title: 'Earn Rewards',
      description: 'Get cashback and exclusive deals on every purchase',
    },
    {
      icon: Users,
      title: 'Referral Network',
      description: 'Invite friends and earn commission on their purchases',
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Shop with confidence with buyer protection',
    },
  ];

  const shopBenefits = [
    {
      icon: Package,
      title: 'Easy Selling',
      description: 'List products and manage inventory effortlessly',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track sales, customers, and growth metrics',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Reach millions of buyers on our platform',
    },
  ];

  const benefits = type === 'user' ? userBenefits : shopBenefits;

  useEffect(() => {
    const interval = setInterval(() => {
      setBenefitIndex((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  return (
    <div
      onClick={onFocus}
      className={`flex-1 p-6 lg:p-8 transition-all cursor-pointer ${
        isActive 
          ? 'bg-white' 
          : 'bg-slate-50/50 hover:bg-white/50'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFocus();
        }
      }}
      aria-label={`${title} panel`}
    >
      <div className="max-w-md mx-auto">
        {/* Panel Header */}
        <div className={`flex items-center gap-3 mb-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          <div className={`p-2 rounded-lg ${type === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>
            <Icon className={`w-5 h-5 ${type === 'user' ? 'text-blue-600' : 'text-purple-600'}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
        </div>

        {/* Benefits Carousel */}
        <div className="mb-6 bg-gradient-to-br from-slate-50 to-white rounded-lg p-4 border border-slate-200">
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <BenefitRow
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                isActive={index === benefitIndex}
              />
            ))}
          </div>
        </div>

        {/* Auth Form */}
        <div className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          {type === 'user' ? (
            <UserAuthForm mode={mode} />
          ) : (
            <ShopAuthForm mode={mode} />
          )}
        </div>
      </div>
    </div>
  );
}
