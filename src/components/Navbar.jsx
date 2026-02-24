import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";

const Navbar = () => {
  const { totalQuantity, setIsDrawerOpen } = useCart();
  const { user, isStaff, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setSettingsForm({
      username: user.username || "",
      email: user.email || "",
      password: "",
    });
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setMobileNavOpen(false);
    navigate("/");
  };

  const handleOpenSettings = () => {
    if (!user) return;
    setSettingsForm({
      username: user.username || "",
      email: user.email || "",
      password: "",
    });
    setShowSettings(true);
    setMenuOpen(false);
    setMobileNavOpen(false);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const payload = {
        username: settingsForm.username.trim(),
        email: settingsForm.email.trim(),
      };
      if (settingsForm.password.trim()) {
        payload.password = settingsForm.password.trim();
      }

      await updateProfile(payload);
      setShowSettings(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Aggiornamento profilo non riuscito");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between gap-2">
          <Link to="/" className="text-xl font-black tracking-tight text-brand-700">
            Miss Cake
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-brand-700" : "text-slate-700 hover:text-brand-700"}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-brand-700" : "text-slate-700 hover:text-brand-700"}`}
            >
              Prodotti
            </NavLink>
            {user ? (
              <NavLink
                to="/purchases"
                className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-brand-700" : "text-slate-700 hover:text-brand-700"}`}
              >
                Acquisti
              </NavLink>
            ) : null}
            {isStaff ? (
              <NavLink
                to="/admin"
                className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-brand-700" : "text-slate-700 hover:text-brand-700"}`}
              >
                Dashboard
              </NavLink>
            ) : null}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-orange-200 bg-white text-slate-700 md:hidden"
              aria-label="Apri menu"
            >
              <span className="text-lg leading-none">{mobileNavOpen ? "x" : "☰"}</span>
            </button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDrawerOpen(true)}
              className="relative rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-2 text-xs font-semibold sm:px-3 sm:text-sm"
            >
              Carrello
              {totalQuantity > 0 ? <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{totalQuantity}</span> : null}
            </motion.button>

            {user ? (
              <div
                ref={menuRef}
                className="relative hidden md:block"
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-2 py-1.5 sm:px-3"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {user.username?.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs text-slate-500">Ciao, {user.username}</p>
                    <p className="text-[11px] uppercase tracking-wide text-brand-700">{user.role}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-orange-100 bg-white p-2 shadow-soft"
                    >
                      <button
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-orange-50"
                        onClick={handleOpenSettings}
                      >
                        Impostazioni account
                      </button>
                      <button
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden btn-primary text-sm md:inline-flex">Login</Link>
            )}
          </div>
        </div>

        <AnimatePresence>
          {mobileNavOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-orange-100 bg-white md:hidden"
            >
              <div className="page-container py-3">
                <div className="grid gap-2">
                  <Link onClick={() => setMobileNavOpen(false)} to="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50">
                    Home
                  </Link>
                  <Link onClick={() => setMobileNavOpen(false)} to="/products" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50">
                    Prodotti
                  </Link>
                  {user ? (
                    <Link onClick={() => setMobileNavOpen(false)} to="/purchases" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50">
                      Acquisti
                    </Link>
                  ) : null}
                  {isStaff ? (
                    <Link onClick={() => setMobileNavOpen(false)} to="/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50">
                      Dashboard
                    </Link>
                  ) : null}

                  {user ? (
                    <>
                      <button
                        onClick={handleOpenSettings}
                        className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-orange-50"
                      >
                        Impostazioni account
                      </button>
                      <button
                        onClick={handleLogout}
                        className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link onClick={() => setMobileNavOpen(false)} to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-orange-50">
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <Modal open={showSettings} title="Impostazioni account" onClose={() => setShowSettings(false)} maxWidth="max-w-xl">
        <form onSubmit={handleSaveSettings} className="space-y-3">
          <input
            className="input"
            placeholder="Username"
            value={settingsForm.username}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={settingsForm.email}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Nuova password (opzionale)"
            type="password"
            value={settingsForm.password}
            onChange={(e) => setSettingsForm((prev) => ({ ...prev, password: e.target.value }))}
            minLength={8}
          />
          <button className="btn-primary w-full" disabled={savingSettings}>
            {savingSettings ? "Salvataggio..." : "Salva modifiche"}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default Navbar;
