import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AccountSelector from "../components/AccountSelector";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("select");
  const [accountType, setAccountType] = useState("user");
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login({ ...form, accountType });
      navigate(accountType === "admin" ? "/admin" : "/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login fallito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-10">
      <div className="mx-auto max-w-lg card p-6">
        <AnimatePresence mode="wait">
          {step === "select" ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
            <h1 className="mb-4 text-2xl font-bold">Login</h1>
            <p className="mb-5 text-sm text-slate-600">Seleziona il tipo di account</p>
            <AccountSelector
              onSelect={(type) => {
                setAccountType(type);
                setStep("form");
              }}
            />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
            <button className="mb-3 text-sm text-brand-700" onClick={() => setStep("select")}>
              &#x21E6; Cambia tipo di account
            </button>
            <h1 className="mb-4 text-2xl font-bold">
              Login {accountType === "admin" ? "Admin" : "User"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="input"
                placeholder="Username o email"
                value={form.usernameOrEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, usernameOrEmail: e.target.value }))}
                required
              />
              <input
                className="input"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button disabled={loading} className="btn-primary w-full" type="submit">
                {loading ? "Accesso in corso..." : "Accedi"}
              </button>
            </form>
            {accountType === "user" ? (
              <p className="mt-4 text-sm text-slate-600">
                Non hai un account? <Link to="/register" className="text-brand-700">Crea account</Link>
              </p>
            ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
