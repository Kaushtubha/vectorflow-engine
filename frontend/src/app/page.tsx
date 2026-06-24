"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Search, Loader2, Activity, ArrowRight, Terminal as TerminalIcon, Cpu, Database, Server, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSection } from "@/components/HeroSection";
import { SpotlightCard } from "@/components/SpotlightCard";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
}

interface PageData {
  data: Product[];
  nextCursor: string | null;
}

const fetchProducts = async ({ pageParam }: { pageParam: string | null }): Promise<PageData> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const url = new URL(`${apiUrl}/products`);
  if (pageParam) url.searchParams.set("cursor", pageParam);
  url.searchParams.set("limit", "18");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["products"],
      queryFn: fetchProducts,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null,
    });

  const observerRef = useRef<HTMLDivElement>(null);

  // States for live metrics
  const [cpuLoad, setCpuLoad] = useState(12.4);
  const [latency, setLatency] = useState(11.4);
  const [ingestRate, setIngestRate] = useState(45.2);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Terminal state
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Antigravity Core OS v6.0.2 Ready.",
    "Type /help to list active control commands.",
  ]);

  // Fluctuating telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad((prev) => +(prev + (Math.random() * 1.6 - 0.8)).toFixed(1));
      setLatency((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2));
      setIngestRate((prev) => +(prev + (Math.random() * 2.0 - 1.0)).toFixed(1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Global mousemove tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll boundary observer
  useEffect(() => {
    if (!observerRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "800px" }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Infinite scroll event logger
  useEffect(() => {
    if (isFetchingNextPage) {
      triggerSystemLog("Scroll boundary hit. Requesting storage cursors...");
    }
  }, [isFetchingNextPage]);

  const triggerSystemLog = (log: string) => {
    window.dispatchEvent(new CustomEvent("system-log", { detail: log }));
    setTerminalLogs((prev) => [...prev.slice(-30), `[sys] ${log}`]);
  };

  // Command handler
  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    if (!command) return;

    setTerminalLogs((prev) => [...prev, `antigravity@core:~$ ${terminalInput}`]);
    setTerminalInput("");

    setTimeout(() => {
      if (command === "/help") {
        setTerminalLogs((prev) => [
          ...prev,
          "Available commands:",
          "  /sync      - Synchronize node buffers",
          "  /optimize  - Compact memory partition map",
          "  /diagnose  - Output cluster diagnostics",
          "  /clear     - Flush terminal history buffer",
        ]);
      } else if (command === "/sync") {
        triggerSystemLog("Synchronization sequence manual override initiated.");
        setTerminalLogs((prev) => [
          ...prev,
          "[sync] Accessing PostgreSQL cluster shards...",
          "[sync] Node balance: 200,000 nodes validated.",
          "[sync] Synchronization complete. Index synced.",
        ]);
      } else if (command === "/optimize") {
        triggerSystemLog("Memory compaction sweep executed.");
        setTerminalLogs((prev) => [
          ...prev,
          "[opt] Deallocating partition fragments...",
          "[opt] Compaction ratio achieved: 1.48x.",
          "[opt] GC cycle completed successfully.",
        ]);
      } else if (command === "/diagnose") {
        setTerminalLogs((prev) => [
          ...prev,
          `[diag] System Temp: 41°C`,
          `[diag] Threadpool: 12 active workers`,
          `[diag] Latency state: ${latency}ms`,
          `[diag] Ingestion: ${ingestRate} MB/s`,
        ]);
      } else if (command === "/clear") {
        setTerminalLogs([]);
      } else {
        setTerminalLogs((prev) => [...prev, `Unknown operator token: ${command}`]);
      }
    }, 100);
  };

  // Flatten products for index-based rendering
  const products = data?.pages.flatMap((page) => page.data) || [];

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#090e1c] flex flex-col items-center justify-center font-mono text-[10px] text-slate-500 gap-4">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
        <span className="tracking-[0.25em] uppercase">Initializing Core Monitor...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen selection:bg-cyan-500/20 selection:text-cyan-200 bg-background flex flex-col lg:flex-row">
      {/* Interactive Volumetric Light Pools (Cursor Tracking) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-80 transition-opacity duration-750"
        style={{
          background: `
            radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.045) 0%, transparent 70%),
            radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.025) 0%, transparent 80%)
          `,
        }}
      />

      {/* Camera & Scanline Overlays */}
      <div className="camera-vignette" />
      <div className="scanline-overlay" />
      <div className="noise-overlay" />

      {/* ========================================================
         LEFT SIDEBAR PANEL: CONTROL MATRIX
         ======================================================== */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800/40 bg-[#090e1c]/90 backdrop-blur-md p-6 flex flex-col justify-between shrink-0 z-40 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 no-scrollbar overflow-y-auto">
        <div className="flex flex-col gap-8">
          {/* Logo & Operational Status */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500 animate-pulse" />
              <span className="font-mono text-sm tracking-[0.25em] text-zinc-100 uppercase font-semibold">
                Vectorflow
              </span>
            </div>
            <span className="text-[9px] font-mono bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 px-2 py-0.5 rounded-sm uppercase tracking-wider">
              Core OS
            </span>
          </div>

          {/* Navigation Matrix */}
          <div className="flex flex-col gap-2">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">
              System Modules
            </div>
            <button className="flex items-center justify-between px-3 py-2 rounded-sm bg-slate-900/40 border border-slate-800/60 text-xs font-mono text-slate-200 text-left">
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Stream Indexer
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>
            <button className="flex items-center justify-between px-3 py-2 rounded-sm border border-transparent text-xs font-mono text-slate-450 hover:text-slate-250 text-left transition-colors">
              <span className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-slate-550" />
                Compute Core
              </span>
              <span className="text-[9px]">v6.0</span>
            </button>
            <button className="flex items-center justify-between px-3 py-2 rounded-sm border border-transparent text-xs font-mono text-slate-450 hover:text-slate-250 text-left transition-colors">
              <span className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-slate-550" />
                Node Registry
              </span>
              <span className="text-[9px] text-slate-500">200k</span>
            </button>
          </div>

          {/* Active Partition State */}
          <div className="flex flex-col gap-3">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              Partition Map Allocation
            </div>
            <div className="hard-surface p-4 flex flex-col gap-3 border border-slate-850">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">PARTITION_POOL</span>
                <span className="text-cyan-400 font-semibold">94.1% alloc</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: "94.1%" }} />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                <span>0x000000</span>
                <span>0xFFFFFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Interactive Terminal CLI */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-850 pt-6">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase">
              CLI Controller
            </span>
          </div>
          <div className="h-40 bg-[#060a14] border border-slate-850 p-3 font-mono text-[9px] leading-relaxed text-slate-450 overflow-y-auto no-scrollbar flex flex-col gap-1">
            {terminalLogs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap break-all">
                {log}
              </div>
            ))}
          </div>
          <form onSubmit={handleCommand} className="flex gap-2">
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Type /help or commands..."
              className="bg-[#060a14] border border-slate-850 px-3 py-2 flex-1 outline-none text-[9px] font-mono text-slate-300 placeholder:text-slate-600 focus:border-slate-800"
            />
          </form>
        </div>
      </aside>

      {/* ========================================================
         RIGHT WORKSPACE: TELEMETRY & CLUSTER DATA VIEW
         ======================================================== */}
      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen relative z-10">
        <HeroSection />

        <section className="max-w-[1800px] px-4 md:px-8 pb-32 flex flex-col gap-12">
          {/* ========================================================
             TELEMETRY STATS BANNER ROW (Enhanced visual details)
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="soft-glass p-5 flex flex-col justify-between min-h-[110px] border border-slate-800/40">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>INGESTION_FLOW</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-3xl font-light text-slate-200 mt-2 font-mono">
                {ingestRate.toFixed(1)}
                <span className="text-xs text-slate-550 ml-1">MB/S</span>
              </div>
              <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase">
                Continuous IO pipeline
              </div>
            </div>

            <div className="soft-glass p-5 flex flex-col justify-between min-h-[110px] border border-slate-800/40">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>COMPUTE_LOAD</span>
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-3xl font-light text-slate-200 mt-2 font-mono">
                {cpuLoad.toFixed(1)}
                <span className="text-xs text-slate-550 ml-1">%</span>
              </div>
              <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase">
                12 THREAD CORES ACTIVE
              </div>
            </div>

            <div className="soft-glass p-5 flex flex-col justify-between min-h-[110px] border border-slate-800/40">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>STREAM_LATENCY</span>
                <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" style={{ animationDuration: "6s" }} />
              </div>
              <div className="text-3xl font-light text-slate-200 mt-2 font-mono">
                {latency.toFixed(2)}
                <span className="text-xs text-slate-550 ml-1">ms</span>
              </div>
              <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase">
                O(1) index latency
              </div>
            </div>

            <div className="soft-glass p-5 flex flex-col justify-between min-h-[110px] border border-slate-800/40">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>INDEXED_NODES</span>
                <Database className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-3xl font-light text-slate-200 mt-2 font-mono">
                {(200000).toLocaleString()}
                <span className="text-xs text-slate-550 ml-1">SYNC</span>
              </div>
              <div className="text-[8px] font-mono text-slate-550 mt-1 uppercase">
                Zero duplication buffer
              </div>
            </div>
          </div>

          {/* Editorial Feed Header */}
          <div className="flex flex-col md:flex-row items-end justify-between border-b border-slate-850 pb-6 mt-4">
            <div>
              <h2 className="text-[2.25rem] font-bold tracking-[-0.04em] leading-none text-slate-250 mb-3">
                Cluster Index Feed.
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                <span>ACTIVE MEMORY SHARDS</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span>PARTITIONS: 64</span>
              </div>
            </div>
            <div className="text-right mt-6 md:mt-0 font-mono">
              <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-1">
                Ingested Node Count
              </div>
              <div className="text-lg text-slate-400">
                {products.length}
                <span className="text-slate-650 ml-1 text-sm">active</span>
              </div>
            </div>
          </div>

          {/* Standard Grid / Dynamic Asymmetrical Feed */}
          {status === "pending" ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
            </div>
          ) : status === "error" ? (
            <div className="text-center text-red-400/80 py-20 hard-surface font-mono text-xs">
              FAILED TO CONNECT TO DETERMINISTIC CORE
            </div>
          ) : (
            <div className="relative" style={{ perspective: 2000 }}>
              <div
                className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-4 lg:gap-6 auto-rows-[minmax(120px,auto)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {products.map((product, index) => {
                  const isHeroNode = index % 11 === 0;
                  const isSliver = index % 5 === 0 && !isHeroNode;
                  const isQuietZone = index % 7 === 3 && !isHeroNode && !isSliver;

                  if (isHeroNode) {
                    return <HeroDataNode key={product.id} product={product} />;
                  }
                  if (isSliver) {
                    return <SliverDataNode key={product.id} product={product} />;
                  }

                  return (
                    <StandardDataNode
                      key={product.id}
                      product={product}
                      isQuiet={isQuietZone}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div ref={observerRef} className="h-40 flex items-center justify-center">
            {isFetchingNextPage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-5 py-3 hard-surface border border-slate-800/40"
              >
                <div className="w-1 h-1 bg-slate-500 animate-ping" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Resolving cursor...
                </span>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ========================================================
   VARIANT 1: THE HERO NODE (Oversized, Hardware Panel)
   ======================================================== */
function HeroDataNode({ product }: { product: Product }) {
  const hashId = `H-NODE:${btoa(String(product.id)).slice(0, 12).toUpperCase()}`;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      className="col-span-1 md:col-span-6 xl:col-span-12 min-h-[380px] mb-6 mt-8 relative group cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      animate={{
        rotateX: mousePos.y * -2.5,
        rotateY: mousePos.x * 2.5,
        translateZ: 20,
      }}
      transition={{ type: "spring", stiffness: 50, damping: 45 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Heavy physical vertical bar, no neon glow */}
      <div
        className="absolute -left-2 top-0 bottom-0 w-[2px] bg-slate-650/80"
        style={{ transform: "translateZ(5px)" }}
      />
      <SpotlightCard className="h-full w-full hard-surface p-8 lg:p-14 flex flex-col justify-between overflow-hidden holographic-sweep border border-slate-800/40">
        {/* Giant architectural background typography */}
        <div className="absolute right-[2%] top-[-5%] text-[7rem] lg:text-[12rem] font-bold text-white/[0.02] whitespace-nowrap pointer-events-none select-none tracking-tighter">
          {product.category.toUpperCase()}
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-emerald-500/80 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono tracking-widest text-slate-450">
                SHARD NODE ACTIVE
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-slate-900/30 px-2 py-0.5 w-fit border border-slate-800/40">
              {hashId}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">
              Ingest Rate
            </div>
            <div className="text-3xl font-light text-slate-350">
              {product.price.toFixed(2)}
              <span className="text-xs text-slate-500 ml-1">kg/s</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-16 max-w-4xl">
          <h3 className="text-3xl lg:text-5xl font-bold tracking-[-0.04em] text-slate-200 leading-[0.95] group-hover:translate-x-2 transition-transform duration-700 ease-[0.22,1,0.36,1]">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-center gap-6 mt-10 pt-6 border-t border-slate-850">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono mb-1">
                TIMESTAMP
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {product.createdAt}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono mb-1">
                CACHE_SLOTS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {product.stock} SLOTS
              </span>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-slate-400 text-[10px] font-mono">
              INSPECT SHARD <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* ========================================================
   VARIANT 2: THE SLIVER (Terminal-like Memory Slot)
   ======================================================== */
function SliverDataNode({ product }: { product: Product }) {
  return (
    <div
      className="col-span-1 md:col-span-6 xl:col-span-8 min-h-[80px] group cursor-crosshair"
      style={{ transform: "translateZ(-10px)" }}
    >
      <div className="h-full w-full hard-surface flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 border-l-[3px] border-l-slate-600 hover:bg-white/[0.015] transition-all duration-700 ease-[0.22,1,0.36,1] relative overflow-hidden holographic-sweep border-y border-r border-slate-800/40">
        <div className="flex items-center gap-4 relative z-10">
          <Activity className="w-3.5 h-3.5 text-slate-500" />
          <h3 className="text-xs font-mono text-slate-350 truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </h3>
        </div>
        <div className="flex items-center gap-6 mt-4 sm:mt-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-mono text-slate-500">
            {product.category.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {product.price.toFixed(2)} kg/s
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 group-hover:bg-cyan-500" />
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   VARIANT 3: STANDARD (Memory Sector Plate)
   ======================================================== */
function StandardDataNode({
  product,
  isQuiet,
}: {
  product: Product;
  isQuiet?: boolean;
}) {
  const hashId = btoa(String(product.id)).slice(0, 6).toUpperCase();

  const handleHover = () => {
    if (!isQuiet) {
      window.dispatchEvent(
        new CustomEvent("system-log", {
          detail: `Buffer slot inspected: [${hashId}]`,
        })
      );
    }
  };

  // Diagnostic isolated block
  if (isQuiet) {
    return (
      <div className="col-span-1 md:col-span-3 xl:col-span-4 min-h-[250px] group relative flex flex-col justify-between p-6 hard-surface border border-slate-800/40 opacity-35 hover:opacity-75 transition-opacity duration-700 ease-[0.22,1,0.36,1]">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-mono text-slate-500 tracking-[0.2em]">
            COORD // 0x{hashId}
          </span>
          <span className="text-[9px] font-mono text-slate-650">SYS_PAUSE_08</span>
        </div>

        <div className="my-auto font-mono text-[9px] text-slate-450/80 space-y-1 leading-relaxed">
          <div>{"// STATIC DIAGNOSTIC FIELD"}</div>
          <div>STREAM_ALLOC: 4.82 GB/S</div>
          <div>Z_INDEX_PERSPECTIVE: ACTIVE</div>
          <div>STATE_INTEGRITY: NOMINAL</div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
          <span className="text-[9px] font-mono text-slate-500">
            ISOLATED MODULE
          </span>
          <div className="w-1 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="col-span-1 md:col-span-3 xl:col-span-4 min-h-[220px] group cursor-crosshair relative"
      onMouseEnter={handleHover}
    >
      <SpotlightCard className="h-full flex flex-col p-6 soft-glass border border-slate-800/40">
        <div className="flex justify-between items-start mb-auto">
          <div className="flex items-center gap-2">
            {/* Health status light */}
            <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 50 ? "bg-emerald-500/80" : "bg-amber-500/80 animate-pulse"}`} />
            <span className="text-[9px] font-mono text-slate-500 tracking-widest">
              0x{hashId}
            </span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 bg-slate-900/30 px-2 py-0.5 border border-slate-800/40">
            {product.category.toUpperCase()}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-mono text-xs text-slate-350 leading-snug mb-4 group-hover:text-slate-200 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
            <span className="text-xs font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
              {product.price.toFixed(2)} kg/s
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-slate-750 rounded-full" />
              <div className="w-1 h-1 bg-slate-750 rounded-full" />
              <div className="w-1 h-1 bg-slate-750 rounded-full group-hover:bg-slate-500" />
            </div>
          </div>
        </div>

        {/* Hover raw data reveal - Luxury slate-navy, smooth overlay */}
        <div className="absolute inset-0 bg-[#0f172a] p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[0.22,1,0.36,1] flex flex-col justify-center border border-slate-800 z-50 pointer-events-none group-hover:pointer-events-auto">
          <span className="text-[9px] text-cyan-500 font-mono tracking-widest uppercase mb-2">
            Node Payload //
          </span>
          <pre className="text-[9px] font-mono text-slate-400 whitespace-pre-wrap break-words leading-relaxed">
            {JSON.stringify(
              {
                uid: String(product.id),
                qty: product.stock,
                epoch: new Date(product.createdAt).getTime(),
              },
              null,
              2
            )}
          </pre>
        </div>
      </SpotlightCard>
    </div>
  );
}
