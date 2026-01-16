import { motion } from "framer-motion";

export function BenefitRow({ icon: Icon, title, description, isActive, variant = "user" }) {
  const activeAccent =
    variant === "user"
      ? "bg-cyan-400/10 text-cyan-200 ring-cyan-400/20"
      : "bg-amber-300/10 text-amber-200 ring-amber-300/20";

  return (
    <motion.div
      initial={false}
      animate={{
        scale: isActive ? 1.02 : 1,
        opacity: isActive ? 1 : 0.62,
      }}
      transition={{ duration: 0.3 }}
      className={[
        "flex items-start gap-3 p-2 rounded-lg transition-colors",
        isActive ? "bg-white/[0.04] ring-1 ring-white/10" : "",
      ].join(" ")}
    >
      <div
        className={[
          "p-2 rounded-lg flex-shrink-0 ring-1",
          isActive ? activeAccent : "bg-white/5 text-white/50 ring-white/10",
        ].join(" ")}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={[
            "text-sm font-medium",
            isActive ? "text-white" : "text-white/80",
          ].join(" ")}
        >
          {title}
        </h3>
        <p className="text-xs text-white/55 mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
}

export default BenefitRow;
