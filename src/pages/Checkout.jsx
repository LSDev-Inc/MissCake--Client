import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const Checkout = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const state = useMemo(() => {
    if (params.get("success") === "true") return "success";
    if (params.get("canceled") === "true") return "canceled";
    return "idle";
  }, [params]);

  useEffect(() => {
    if (state !== "canceled" || !orderId) return;
    api.delete(`/orders/cancel-pending/${orderId}`).catch(() => {});
  }, [state, orderId]);

  return (
    <div className="page-container py-10">
      <div className="mx-auto max-w-xl card p-7 text-center">
        {state === "success" ? (
          <>
            <h1 className="text-2xl font-bold text-green-700">Pagamento completato</h1>
            <p className="mt-2 text-slate-600">Ordine ricevuto. Stato iniziale: In attesa.</p>
          </>
        ) : null}

        {state === "canceled" ? (
          <>
            <h1 className="text-2xl font-bold text-amber-700">Pagamento annullato</h1>
            <p className="mt-2 text-slate-600">Puoi riprovare in qualsiasi momento dal carrello.</p>
          </>
        ) : null}

        {state === "idle" ? (
          <>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="mt-2 text-slate-600">Verrai reindirizzato qui dopo il pagamento Stripe.</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Checkout;
