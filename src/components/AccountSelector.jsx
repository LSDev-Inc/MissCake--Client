import { motion } from "framer-motion";

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.45, ease: "easeOut" },
  }),
};

const AccountSelector = ({ onSelect }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { key: "user", title: "User", icon: "U", subtitle: "Accedi o crea account" },
        { key: "admin", title: "Admin", icon: "A", subtitle: "Accesso amministratore" },
      ].map((item, index) => (
        <motion.button
          key={item.key}
          custom={index}
          variants={cardAnimation}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect(item.key)}
          className="card p-6 text-left"
        >
          <motion.div
            animate={{ scale: [1, 1.09, 1], rotate: [0, 4, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-100 font-bold text-brand-700"
          >
            {item.icon}
          </motion.div>
          <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
          <p className="text-sm text-slate-600">{item.subtitle}</p>
        </motion.button>
      ))}
    </div>
  );
};

export default AccountSelector;
