import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
}

interface TabSwitcherProps {
  activeTab: string;
  onTabChange: (tabId: any) => void;
  tabs: Tab[];
  accentColor?: 'purple' | 'blue';
}

export function TabSwitcher({ activeTab, onTabChange, tabs, accentColor = 'purple' }: TabSwitcherProps) {
  const gradients = {
    purple: 'from-[#6B46C1] via-[#8B5CF6] to-[#D4AF37]',
    blue: 'from-[#D4AF37] via-[#C4A962] to-[#6B46C1]',
  };

  const shadows = {
    purple: '0 8px 24px rgba(107, 70, 193, 0.25)',
    blue: '0 8px 24px rgba(212, 175, 55, 0.25)',
  };

  return (
    <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId={`tab-indicator-${accentColor}`}
              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradients[accentColor]}`}
              style={{
                boxShadow: shadows[accentColor],
              }}
              transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}