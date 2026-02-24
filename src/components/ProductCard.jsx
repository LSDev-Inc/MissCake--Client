import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { resolveImageUrl } from "../utils/imageUrl";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="card overflow-hidden"
    >
      <div className="flex h-52 w-full items-center justify-center bg-orange-50 p-2 sm:h-56">
        <img
          src={resolveImageUrl(product.image)}
          alt={product.title}
          className="h-full w-full rounded-lg object-contain"
          loading="lazy"
        />
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-bold text-slate-900">{product.title}</h3>
        <p className="text-sm text-slate-600">
          {product.description.length > 110 ? `${product.description.slice(0, 110)}...` : product.description}
        </p>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{product.category?.name || "Senza categoria"}</span>
          {product.preparationTime ? <span>{product.preparationTime}h prep</span> : null}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-brand-700">EUR {Number(product.price).toFixed(2)}</p>
          <button onClick={() => addToCart(product)} className="btn-primary">
            Aggiungi
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
