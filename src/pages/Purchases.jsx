import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import api from "../services/api";
import { resolveImageUrl } from "../utils/imageUrl";

const Purchases = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders/my-orders");
      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Errore caricamento acquisti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders]
  );

  const openOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  return (
    <div className="page-container py-8 space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Acquisti</h1>
          <p className="text-sm text-slate-600">Storico ordini e stato aggiornato in tempo reale dallo staff.</p>
        </div>
        <button className="btn-secondary w-full sm:w-auto" onClick={loadOrders}>Aggiorna elenco</button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="mb-2 h-4 w-1/3 rounded bg-orange-100" />
              <div className="mb-2 h-4 w-2/3 rounded bg-orange-100" />
              <div className="h-4 w-1/4 rounded bg-orange-100" />
            </div>
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="card p-6 text-center text-slate-600">
          Nessun acquisto trovato. Quando completi un ordine lo vedrai qui.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order) => (
            <button
              key={order._id}
              onClick={() => openOrder(order)}
              className="card w-full p-4 text-left transition hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold">Ordine #{order._id.slice(-8).toUpperCase()}</p>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">Data: {new Date(order.createdAt).toLocaleString()}</p>
              <p className="text-sm text-slate-600">Totale: EUR {Number(order.totalAmount).toFixed(2)}</p>
              {order.remainingTime ? <p className="text-sm text-slate-600">Tempo rimanente: {order.remainingTime}</p> : null}
            </button>
          ))}
        </div>
      )}

      <Modal open={showOrderModal} title="Dettaglio acquisto" onClose={() => setShowOrderModal(false)} maxWidth="max-w-3xl">
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-orange-100 p-3">
              <p className="font-semibold">Ordine #{selectedOrder._id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-slate-600">Data: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p className="text-sm text-slate-600">Totale: EUR {Number(selectedOrder.totalAmount).toFixed(2)}</p>
              <p className="text-sm text-slate-600">Stato: {selectedOrder.status}</p>
              {selectedOrder.remainingTime ? <p className="text-sm text-slate-600">Tempo rimanente: {selectedOrder.remainingTime}</p> : null}
              {selectedOrder.adminComment ? <p className="text-sm text-slate-600">Commento staff: {selectedOrder.adminComment}</p> : null}
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
                      <p className="font-semibold">{item.product?.title || "Prodotto"}</p>
                      <p className="text-sm text-slate-600">Quantita: {item.quantity}</p>
                      <p className="text-sm text-slate-600">Prezzo unitario: EUR {Number(item.unitPrice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Purchases;
