"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef, useCallback } from "react";
import { PaginatedResponse, Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Database, Zap, ArrowDownToLine } from "lucide-react";

const fetchProducts = async ({ pageParam = null, category = "" }: { pageParam: string | null; category: string }): Promise<PaginatedResponse<Product>> => {
  const url = new URL("http://localhost:5000/api/products");
  url.searchParams.set("limit", "20");
  if (pageParam) url.searchParams.set("cursor", pageParam);
  if (category) url.searchParams.set("category", category);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

const CATEGORIES = ['All', 'Electronics', 'Home & Kitchen', 'Apparel', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive', 'Health', 'Grocery'];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["products", activeCategory],
    queryFn: ({ pageParam }) => fetchProducts({ pageParam: pageParam as string | null, category: activeCategory === "All" ? "" : activeCategory }),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    initialPageParam: null as string | null,
  });

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: '200px' });
    
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page) => page.data) || [];
  const totalLoaded = allProducts.length;

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="glass sticky top-0 z-40 h-auto w-full flex-none p-6 lg:h-screen lg:w-72 lg:border-r lg:border-white/10 lg:bg-transparent overflow-y-auto no-scrollbar">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-white/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Vectorflow</h1>
            <p className="text-xs font-medium text-white/50">High-Performance Engine</p>
          </div>
        </div>

        <div className="mb-10 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white/60">
              <Database size={16} />
              <span>Live Stats</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">{totalLoaded}</span>
              <span className="mb-1 text-sm text-white/50">loaded</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Cursor Pagination Active
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Categories</h2>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex w-full items-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6 lg:p-10">
        <header className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {activeCategory === "All" ? "All Products" : activeCategory}
          </h2>
          <p className="mt-2 text-white/50">
            Infinite scroll powered by deterministic cursor pagination.
          </p>
        </header>

        {status === "pending" ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-white/50" size={32} />
          </div>
        ) : status === "error" ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
            Error fetching products: {(error as Error).message}
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              layout
            >
              <AnimatePresence mode="popLayout">
                {allProducts.map((product, index) => {
                  const isLastElement = index === allProducts.length - 1;
                  return (
                    <div key={product.id} ref={isLastElement ? lastElementRef : null}>
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {isFetchingNextPage && (
              <div className="mt-12 flex justify-center pb-10">
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 shadow-xl backdrop-blur-md">
                  <Loader2 className="animate-spin text-white" size={20} />
                  <span className="text-sm font-medium text-white/80">Loading more...</span>
                </div>
              </div>
            )}

            {!hasNextPage && allProducts.length > 0 && (
              <div className="mt-16 flex flex-col items-center justify-center pb-10 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/30">
                  <ArrowDownToLine size={20} />
                </div>
                <h3 className="text-lg font-medium text-white/80">You've reached the end</h3>
                <p className="mt-1 text-sm text-white/40">All {totalLoaded} products loaded perfectly without duplicates.</p>
              </div>
            )}
            
            {allProducts.length === 0 && (
              <div className="mt-20 flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glass text-white/30">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-medium text-white/90">No products found</h3>
                <p className="mt-2 text-white/50">Try selecting a different category or seeding the database.</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
