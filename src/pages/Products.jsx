import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const initialForm = {
  title: "",
  image: "",
  description: "",
  preparationTime: "",
  price: "",
  category: "",
};

const normalize = (value) => String(value || "").toLowerCase().trim();

const Products = () => {
  const { isStaff } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data.products || []);
  };

  const loadCategories = async () => {
    const { data } = await api.get("/products/categories");
    setCategories(data.categories || []);
  };

  const load = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProducts(), loadCategories()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Errore caricamento prodotti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedCategoryIds([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const toggleCategoryFilter = (categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const uploadImage = async (file) => {
    if (!file) return;

    const body = new FormData();
    body.append("image", file);
    setUploadingImage(true);
    try {
      const { data } = await api.post("/uploads/image", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image: data.imageUrl }));
      toast.success("Immagine caricata");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload immagine non riuscito");
    } finally {
      setUploadingImage(false);
    }
  };

  const buildPayload = () => ({
    title: form.title,
    image: form.image,
    description: form.description,
    preparationTime: form.preparationTime ? Number(form.preparationTime) : undefined,
    price: Number(form.price),
    category: form.category,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", buildPayload());
      toast.success("Prodotto creato");
      setShowCreateModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Creazione fallita");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await api.put(`/products/${selectedProduct._id}`, buildPayload());
      toast.success("Prodotto modificato");
      setShowEditModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Modifica fallita");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`/products/${selectedProduct._id}`);
      toast.success("Prodotto eliminato");
      setShowDeleteModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Eliminazione fallita");
    }
  };

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const tokens = normalize(searchText).split(/\s+/).filter(Boolean);
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    return sortedProducts.filter((product) => {
      const text = normalize(`${product.title} ${product.description} ${product.category?.name || ""}`);
      const matchesText = tokens.every((token) => text.includes(token));

      const hasCategoryFilter = selectedCategoryIds.length > 0;
      const matchesCategory = !hasCategoryFilter || selectedCategoryIds.includes(product.category?._id);

      const price = Number(product.price);
      const matchesMin = min == null || price >= min;
      const matchesMax = max == null || price <= max;

      return matchesText && matchesCategory && matchesMin && matchesMax;
    });
  }, [sortedProducts, searchText, selectedCategoryIds, minPrice, maxPrice]);

  const openEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      title: product.title,
      image: product.image,
      description: product.description,
      preparationTime: product.preparationTime || "",
      price: product.price,
      category: product.category?._id || "",
    });
    setShowEditModal(true);
  };

  const renderProductForm = (onSubmit) => (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input className="input" placeholder="Titolo" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
      <textarea className="input" rows={3} placeholder="Descrizione" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
      <input className="input" type="number" min="0" step="0.01" placeholder="Prezzo" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
      <input className="input" type="number" min="0" placeholder="Ore preparazione (opzionale)" value={form.preparationTime} onChange={(e) => setForm((p) => ({ ...p, preparationTime: e.target.value }))} />
      <select className="input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required>
        <option value="">Seleziona categoria</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>{category.name}</option>
        ))}
      </select>
      <div className="rounded-xl border border-orange-100 p-3">
        <p className="mb-2 text-sm font-semibold text-slate-700">Immagine</p>
        <input className="input mb-2" placeholder="URL immagine (opzionale)" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
        <input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} />
        {uploadingImage ? <p className="mt-2 text-xs text-slate-500">Caricamento immagine...</p> : null}
      </div>
      <button className="btn-primary w-full" disabled={uploadingImage || !form.image}>
        Salva
      </button>
    </form>
  );

  return (
    <div className="page-container py-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black">Articoli</h1>
        {isStaff ? (
          <button
            className="btn-primary w-full sm:w-auto"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            Aggiungi articolo
          </button>
        ) : null}
      </div>

      <div className="card space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="input md:col-span-2"
            placeholder="Cerca prodotti (es: torta alla cioccolata)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Prezzo min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Prezzo max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Filtra per categoria</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = selectedCategoryIds.includes(category._id);
              return (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => toggleCategoryFilter(category._id)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    selected
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-orange-200 bg-white text-slate-700 hover:border-brand-300"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Risultati: <span className="font-semibold text-slate-800">{filteredProducts.length}</span>
          </p>
          <button type="button" className="btn-secondary w-full sm:w-auto" onClick={clearFilters}>
            Reset filtri
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="mb-3 h-40 rounded-xl bg-orange-100" />
              <div className="mb-2 h-4 w-2/3 rounded bg-orange-100" />
              <div className="h-4 w-full rounded bg-orange-100" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card p-6 text-center text-slate-600">
          Nessun articolo trovato con i filtri correnti.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product._id} className="space-y-2">
              <ProductCard product={product} />
              {isStaff ? (
                <div className="card flex justify-end gap-2 p-2">
                  <button className="rounded-lg border border-brand-200 px-3 py-1 text-sm text-brand-700" onClick={() => openEdit(product)}>Modifica</button>
                  <button
                    className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowDeleteModal(true);
                    }}
                  >
                    Elimina
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreateModal} title="Aggiungi articolo" onClose={() => setShowCreateModal(false)} maxWidth="max-w-2xl">
        {renderProductForm(handleCreate)}
      </Modal>

      <Modal open={showEditModal} title="Modifica articolo" onClose={() => setShowEditModal(false)} maxWidth="max-w-2xl">
        {renderProductForm(handleEdit)}
      </Modal>

      <Modal open={showDeleteModal} title="Conferma eliminazione" onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-4">
          <p>
            Vuoi eliminare l&apos;articolo <span className="font-semibold">{selectedProduct?.title}</span>?
          </p>
          <button className="w-full rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700" onClick={handleDelete}>
            Conferma eliminazione
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
