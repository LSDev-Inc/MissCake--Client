import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100">
      <motion.div
        className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-brand-200/60 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-8 h-64 w-64 rounded-full bg-amber-200/70 blur-3xl"
        animate={{ x: [0, -45, 0], y: [0, -18, 0] }}
        transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="grid h-full place-items-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.06, 1] }}
          transition={{ rotate: { repeat: Infinity, duration: 2.2, ease: "linear" }, scale: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
          className="mx-auto mb-5 h-16 w-16 rounded-full border-4 border-brand-200 border-t-brand-600 shadow-soft"
        />
        <p className="text-xl font-bold text-brand-700">Miss Cake</p>
        <p className="text-sm text-slate-600">Prepariamo qualcosa di speciale...</p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-brand-100">
          <motion.div
            className="h-full rounded-full bg-brand-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
