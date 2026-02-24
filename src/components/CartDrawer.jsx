import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/imageUrl";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
let stripePromise = null;
const getStripe = () => {
  if (!stripePublicKey) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

const CartDrawer = () => {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalQuantity,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Devi effettuare il login prima del checkout");
      return;
    }

    if (items.length === 0) {
      toast.error("Il carrello e vuoto");
      return;
    }

    try {
      const stripeLoader = getStripe();
      if (!stripeLoader) {
        toast.error("Chiave Stripe pubblica mancante nel frontend");
        return;
      }

      const payload = {
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
      };

      const { data } = await api.post("/orders/checkout-session", payload);

      const stripe = await stripeLoader;
      if (stripe && data.sessionId) {
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (result?.error) {
          throw new Error(result.error.message);
        }
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Impossibile avviare il checkout Stripe");
      }

      clearCart();
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Checkout fallito");
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsDrawerOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white p-6 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Carrello ({totalQuantity})</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-2xl leading-none">x</button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-slate-500">Nessun prodotto nel carrello.</p>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item._id}
                    className="card p-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex gap-3">
                      <img src={resolveImageUrl(item.image)} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-slate-500">EUR {item.price.toFixed(2)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="rounded-md border px-2" onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button className="rounded-md border px-2" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                          <button className="ml-auto text-sm text-red-600" onClick={() => removeFromCart(item._id)}>Rimuovi</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-6 border-t border-orange-100 pt-4">
              <p className="mb-3 text-lg font-bold">Totale: EUR {totalPrice.toFixed(2)}</p>
              <button className="btn-primary w-full" onClick={handleCheckout}>Checkout</button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default CartDrawer;
