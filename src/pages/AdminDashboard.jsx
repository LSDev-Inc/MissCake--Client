import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/imageUrl";

const SectionCard = ({ title, subtitle, onClick }) => (
  <motion.button
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.995 }}
    onClick={onClick}
    className="card p-5 text-left transition"
  >
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
  </motion.button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isOwner } = useAuth();

  const [stats, setStats] = useState({ users: 0, admins: 0, owners: 0, categories: 0, products: 0 });
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState("site");

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderUpdateForm, setOrderUpdateForm] = useState({
    status: "In attesa",
    remainingTime: "",
    adminComment: "",
  });

  const loadData = async () => {
    try {
      const [statsRes, adminsRes, ordersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/admins"),
        api.get("/orders/staff"),
      ]);
      setStats(statsRes.data.stats);
      setAdmins(adminsRes.data.admins || []);
      setOrders(ordersRes.data.orders || []);

      if (isOwner) {
        const { data } = await api.get("/admin/logs");
        setLogs(data.logs || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Errore caricamento dashboard");
    }
  };

  useEffect(() => {
    loadData();
  }, [isOwner]);

  const resetForm = () => {
    setForm({ username: "", email: "", password: "" });
    setSelectedAdmin(null);
  };

  const openEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setForm({ username: admin.username, email: admin.email, password: "" });
    setShowEditModal(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/admins", form);
      toast.success("Admin creato");
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossibile creare admin");
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    try {
      const payload = {
        username: form.username,
        email: form.email,
      };
      if (form.password) payload.password = form.password;
      await api.put(`/admin/admins/${selectedAdmin._id}`, payload);
      toast.success("Admin aggiornato");
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossibile aggiornare admin");
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      await api.delete(`/admin/admins/${selectedAdmin._id}`);
      toast.success("Admin eliminato");
      setShowDeleteModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossibile eliminare admin");
    }
  };

  const canManageAdmin = (admin) => isOwner && admin.role === "admin";

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderUpdateForm({
      status: order.status || "In attesa",
      remainingTime: order.remainingTime || "",
      adminComment: order.adminComment || "",
    });
    setShowOrderModal(true);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.put(`/orders/staff/${selectedOrder._id}`, orderUpdateForm);
      toast.success("Ordine aggiornato");
      setShowOrderModal(false);
      setSelectedOrder(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossibile aggiornare ordine");
    }
  };

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders]
  );

  return (
    <div className="page-container py-8 space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Dashboard Staff</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <SectionCard title="SitoWeb" subtitle="Vai alla Home" onClick={() => navigate("/")} />
        <SectionCard title="Gestione Account" subtitle="Lista admin e owner" onClick={() => setActiveSection("accounts")} />
        <SectionCard title="Ordini" subtitle="Gestione ordini clienti" onClick={() => setActiveSection("orders")} />
        <SectionCard title="Categorie" subtitle="Apri pagina categorie" onClick={() => navigate("/categories")} />
        <SectionCard title="Articoli" subtitle="Apri pagina articoli" onClick={() => navigate("/products")} />
        {isOwner ? <SectionCard title="Audit Log" subtitle="Azioni di sistema" onClick={() => setActiveSection("logs")} /> : null}
      </div>

      {activeSection === "site" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["users", "Utenti"],
            ["admins", "Admin"],
            ["owners", "Owner"],
            ["categories", "Categorie"],
            ["products", "Articoli"],
          ].map(([key, label]) => (
            <div key={key} className="card p-5">
              <p className="text-sm uppercase text-slate-500">{label}</p>
              <p className="text-3xl font-bold text-brand-700">{stats[key]}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeSection === "accounts" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Utenti staff</h2>
            <button
              className="btn-primary"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              Aggiungi admin
            </button>
          </div>

          <div className="card space-y-2 p-4">
            {admins.map((admin) => (
              <div key={admin._id} className="rounded-xl border border-orange-100 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {admin.username}{" "}
                      <span className="text-xs font-medium uppercase text-slate-500">({admin.role})</span>
                    </p>
                    <p className="text-sm text-slate-600">{admin.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {canManageAdmin(admin) ? (
                      <>
                        <button className="rounded-lg border border-brand-200 px-3 py-1 text-sm text-brand-700" onClick={() => openEditAdmin(admin)}>
                          Modifica
                        </button>
                        <button
                          className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowDeleteModal(true);
                          }}
                        >
                          Elimina
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        {admin.role === "owner" ? "Account protetto" : "Solo owner puo modificare admin"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeSection === "orders" ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Ordini clienti</h2>
          <div className="card space-y-2 p-4">
            {sortedOrders.length === 0 ? (
              <p className="text-slate-500">Nessun ordine disponibile.</p>
            ) : (
              sortedOrders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => openOrderModal(order)}
                  className="w-full rounded-xl border border-orange-100 p-3 text-left hover:bg-orange-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{order.user?.username || "Utente"}</p>
                    <p className="text-sm text-brand-700">{order.status}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleString()} | Totale EUR {Number(order.totalAmount).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">Ordine ID: {order._id}</p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeSection === "logs" && isOwner ? (
        <div className="card space-y-3 p-5">
          <h2 className="text-2xl font-bold">Audit Log (solo owner)</h2>
          {logs.length === 0 ? (
            <p className="text-slate-500">Nessun log disponibile.</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="rounded-xl border border-orange-100 p-3">
                <p className="text-sm font-semibold text-slate-800">{log.details || log.action}</p>
                <p className="text-xs text-slate-500">
                  Attore: {log.actor?.username || "unknown"} | Tipo: {log.targetType} | Data: {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      ) : null}

      <Modal open={showCreateModal} title="Aggiungi nuovo admin" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateAdmin} className="space-y-3">
          <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          <button className="btn-primary w-full">Crea admin</button>
        </form>
      </Modal>

      <Modal open={showEditModal} title={`Modifica admin: ${selectedAdmin?.username || ""}`} onClose={() => setShowEditModal(false)}>
        <form onSubmit={handleEditAdmin} className="space-y-3">
          <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <input className="input" type="password" placeholder="Nuova password (opzionale)" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          <button className="btn-primary w-full">Salva modifiche</button>
        </form>
      </Modal>

      <Modal open={showDeleteModal} title="Conferma eliminazione admin" onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-4">
          <p>
            Vuoi eliminare l&apos;admin <span className="font-semibold">{selectedAdmin?.username}</span>?
          </p>
          <button className="w-full rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700" onClick={handleDeleteAdmin}>
            Conferma eliminazione
          </button>
        </div>
      </Modal>

      <Modal open={showOrderModal} title="Dettaglio ordine" onClose={() => setShowOrderModal(false)} maxWidth="max-w-3xl">
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-orange-100 p-3">
              <p className="font-semibold">{selectedOrder.user?.username || "Utente"}</p>
              <p className="text-sm text-slate-600">{selectedOrder.user?.email || "Email non disponibile"}</p>
              <p className="text-sm text-slate-600">Data: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p className="text-sm text-slate-600">Totale: EUR {Number(selectedOrder.totalAmount).toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              {selectedOrder.products?.map((item) => (
                <div key={`${selectedOrder._id}-${item._id}`} className="rounded-xl border border-orange-100 p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(item.product?.image)}
                      alt={item.product?.title || "Prodotto"}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold">{item.product?.title || "Prodotto rimosso"}</p>
                      <p className="text-sm text-slate-600">Quantita: {item.quantity}</p>
                      <p className="text-sm text-slate-600">Prezzo unitario: EUR {Number(item.unitPrice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-3">
              <select
                className="input"
                value={orderUpdateForm.status}
                onChange={(e) => setOrderUpdateForm((prev) => ({ ...prev, status: e.target.value }))}
                required
              >
                <option value="In attesa">In attesa</option>
                <option value="In preparazione">In preparazione</option>
                <option value="Completato">Completato</option>
              </select>
              <input
                className="input"
                placeholder="Tempo rimanente (facoltativo)"
                value={orderUpdateForm.remainingTime}
                onChange={(e) => setOrderUpdateForm((prev) => ({ ...prev, remainingTime: e.target.value }))}
              />
              <textarea
                className="input"
                rows={3}
                placeholder="Commento personale per il cliente (facoltativo)"
                value={orderUpdateForm.adminComment}
                onChange={(e) => setOrderUpdateForm((prev) => ({ ...prev, adminComment: e.target.value }))}
              />
              <button className="btn-primary w-full">Aggiorna ordine</button>
            </form>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
