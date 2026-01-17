import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface BenefitRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive: boolean;
}

export function BenefitRow({ icon: Icon, title, description, isActive }: BenefitRowProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: isActive ? 1.02 : 1,
        opacity: isActive ? 1 : 0.6,
      }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
        isActive ? 'bg-white shadow-sm' : ''
      }`}
    >
      <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
}
