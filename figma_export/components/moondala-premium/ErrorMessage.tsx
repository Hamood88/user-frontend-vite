import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
  type?: 'error' | 'success' | 'info';
}

export function ErrorMessage({ message, type = 'error' }: ErrorMessageProps) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: AlertCircle,
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle,
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: Info,
    },
  };

  const { bg, border, text, icon: Icon } = styles[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className={`flex items-start gap-3 p-4 rounded-xl ${bg} border ${border} backdrop-blur-sm`}
        role="alert"
      >
        <Icon className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
        <p className={`text-sm font-medium ${text}`}>{message}</p>
      </motion.div>
    </AnimatePresence>
  );
}
