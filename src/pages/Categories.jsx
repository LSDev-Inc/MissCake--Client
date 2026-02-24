import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import api from "../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/categories");
      setCategories(data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Errore caricamento categorie");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/categories", { name });
      toast.success("Categoria creata");
      setName("");
      setShowCreateModal(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Creazione non riuscita");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await api.put(`/admin/categories/${selectedCategory._id}`, { name });
      toast.success("Categoria aggiornata");
      setName("");
      setSelectedCategory(null);
      setShowEditModal(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Modifica non riuscita");
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await api.delete(`/admin/categories/${selectedCategory._id}`);
      toast.success("Categoria eliminata");
      setSelectedCategory(null);
      setShowDeleteModal(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Eliminazione non riuscita");
    }
  };

  return (
    <div className="page-container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Categorie</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setName("");
            setShowCreateModal(true);
          }}
        >
          Aggiungi categoria
        </button>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-xl font-bold">Elenco categorie esistenti</h2>
        {loading ? (
          <p className="text-slate-500">Caricamento...</p>
        ) : categories.length === 0 ? (
          <p className="text-slate-500">Nessuna categoria creata.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category._id} className="rounded-xl border border-orange-100 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-slate-500">{new Date(category.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="rounded-lg border border-brand-200 px-3 py-1 text-sm text-brand-700"
                      onClick={() => {
                        setSelectedCategory(category);
                        setName(category.name);
                        setShowEditModal(true);
                      }}
                    >
                      Modifica
                    </button>
                    <button
                      className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowDeleteModal(true);
                      }}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showCreateModal} title="Aggiungi categoria" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreate} className="space-y-3">
          <input className="input" placeholder="Nome categoria" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn-primary w-full">Crea</button>
        </form>
      </Modal>

      <Modal open={showEditModal} title="Modifica categoria" onClose={() => setShowEditModal(false)}>
        <form onSubmit={handleEdit} className="space-y-3">
          <input className="input" placeholder="Nome categoria" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn-primary w-full">Salva modifiche</button>
        </form>
      </Modal>

      <Modal open={showDeleteModal} title="Conferma eliminazione" onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-4">
          <p>
            Vuoi eliminare la categoria <span className="font-semibold">{selectedCategory?.name}</span>?
          </p>
          <button className="w-full rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700" onClick={handleDelete}>
            Conferma eliminazione
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
