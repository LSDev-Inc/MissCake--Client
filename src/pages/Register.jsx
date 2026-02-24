import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await register(form);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registrazione fallita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-10">
      <div className="mx-auto max-w-lg card p-6">
        <h1 className="mb-4 text-2xl font-bold">Crea account</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input"
            placeholder="Username"
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            minLength={8}
          />
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creazione..." : "Crea account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
