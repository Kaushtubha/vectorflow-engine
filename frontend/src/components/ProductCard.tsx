import { Product } from "@/types";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="group relative overflow-hidden rounded-2xl glass p-1 transition-all duration-300 hover:bg-white/5 hover:shadow-2xl hover:shadow-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative aspect-square overflow-hidden rounded-xl bg-black/40">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3 rounded-full glass px-3 py-1 text-xs font-medium text-white/80">
          {product.category}
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="font-semibold tracking-tight text-white/90 line-clamp-1">
            {product.name}
          </h3>
          <p className="font-mono font-medium text-white/80">
            ${product.price.toFixed(2)}
          </p>
        </div>
        <p className="mb-4 text-sm text-white/50 line-clamp-2">
          {product.description}
        </p>
        
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-black">
          <ShoppingBag size={16} />
          <span>Add to cart</span>
        </button>
      </div>
    </motion.div>
  );
}
