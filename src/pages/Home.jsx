import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data.products || []);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="page-container py-8">
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-8 text-white">
        <motion.div
          className="absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl"
          animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-amber-200/25 blur-2xl"
          animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative text-4xl font-black"
        >
          Artigianalita, eleganza, gusto.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="relative mt-3 max-w-2xl text-brand-50"
        >
          Scopri la collezione Miss Cake: dolci professionali per eventi, regali e momenti speciali.
        </motion.p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">I nostri prodotti</h2>
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
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
