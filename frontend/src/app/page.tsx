"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Filter, Download, Clock, Copy, Check,
  Plus, ChevronLeft, ChevronRight, TrendingUp, UserCheck, RefreshCw,
  Sparkles, Layers, Languages,
  BarChart3, Wallet, ArrowUpRight, Inbox, Eye, Edit2, Trash2, X
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Types
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  createdAt: string;
}

interface SummaryData {
  totalApplications: number;
  totalAmount: number;
  approvedAmount: number;
  statusCounts: {
    approved: number;
    pending: number;
    rejected: number;
  };
  languageDistribution: { name: string; value: number }[];
  recentApplications: {
    id: number;
    name: string;
    category: string;
    price: number;
    description?: string;
    imageUrl?: string;
    stock?: number;
    applicant_name?: string;
    mobile_number?: string;
    loan_amount?: number;
    loan_purpose?: string;
    preferred_language?: string;
    status?: string;
    createdAt?: string;
    created_at?: string;
  }[];
}

const PIE_COLORS = ["#e8184a", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#8b5cf6"];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  approved: { bg: "bg-emerald-500/10 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
  rejected: { bg: "bg-rose-500/10 dark:bg-rose-500/15",    text: "text-rose-600 dark:text-rose-400",       border: "border-rose-500/30" },
  pending:  { bg: "bg-amber-500/10 dark:bg-amber-500/15",   text: "text-amber-600 dark:text-amber-400",     border: "border-amber-500/30" },
};

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "https://vectorflow-engine-backend.onrender.com/api";
};

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [time, setTime] = useState<Date | null>(null);

  const [search, setSearch] = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", price: 0, category: "", description: "" });

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebSearch(search);
      setCursors([null]);
      setPageIndex(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setCursors([null]);
    setPageIndex(0);
  };

  const getGreeting = () => {
    if (!time) return "Welcome";
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchSummary = async () => {
    const res = await fetch(`${getApiBaseUrl()}/products/summary`);
    if (!res.ok) throw new Error("Failed to fetch summary");
    const json = await res.json();
    return json.data;
  };

  const fetchProducts = async () => {
    const url = new URL(`${getApiBaseUrl()}/products`);
    url.searchParams.set("limit", "8");
    if (categoryFilter !== "all") url.searchParams.set("category", categoryFilter);
    const currentCursor = cursors[pageIndex];
    if (currentCursor) url.searchParams.set("cursor", currentCursor);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch products");
    const json = await res.json();
    return {
      items: json.data as Product[],
      nextCursor: json.pagination?.nextCursor as string | null,
      hasMore: json.pagination?.hasMore as boolean
    };
  };

  const summaryQuery = useQuery({
    queryKey: ["productSummary"],
    queryFn: fetchSummary,
    refetchInterval: 15000 // Refetch every 15s for live metrics
  });

  const productsQuery = useQuery({
    queryKey: ["products", categoryFilter, pageIndex, cursors[pageIndex]],
    queryFn: fetchProducts
  });

  // Mutate Operations
  const updateProductMutation = useMutation({
    mutationFn: async (updatedData: { id: number; name: string; price: number; category: string; description: string }) => {
      const res = await fetch(`${getApiBaseUrl()}/products/${updatedData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedData.name,
          price: updatedData.price,
          category: updatedData.category,
          description: updatedData.description
        })
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productSummary"] });
      setSelectedProduct(null);
      setIsEditMode(false);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${getApiBaseUrl()}/products/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productSummary"] });
      setSelectedProduct(null);
    }
  });

  const handleRefresh = async () => {
    await Promise.all([
      summaryQuery.refetch(),
      productsQuery.refetch()
    ]);
  };

  const copyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    updateProductMutation.mutate({
      id: selectedProduct.id,
      ...editForm
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleNextPage = () => {
    if (productsQuery.data?.nextCursor) {
      setCursors((prev) => {
        const next = [...prev];
        next[pageIndex + 1] = productsQuery.data.nextCursor;
        return next;
      });
      setPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const openProductModal = (product: Product, edit = false) => {
    setSelectedProduct(product);
    setIsEditMode(edit);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || ""
    });
  };

  const exportCSV = () => {
    const items = productsQuery.data?.items || [];
    if (!items.length) return;
    const headers = ["ID", "Name", "Category", "Price (₹)", "Stock (qty)", "Description", "Created At"];
    const rows = items.map((p) => [
      p.id,
      p.name,
      p.category,
      p.price,
      p.stock,
      `"${p.description?.replace(/"/g, '""') || ""}"`,
      new Date(p.createdAt).toLocaleString()
    ]);
    const blob = new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vectorflow_catalog_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatus = (price: number) => {
    if (price > 500) return "approved";
    if (price > 150) return "pending";
    return "rejected";
  };

  const summary: SummaryData = summaryQuery.data || {
    totalApplications: 0,
    totalAmount: 0,
    approvedAmount: 0,
    statusCounts: { approved: 0, pending: 0, rejected: 0 },
    languageDistribution: [],
    recentApplications: []
  };

  const chartData = (summary.recentApplications || []).slice().reverse().map((a) => ({
    date: new Date(a.createdAt || a.created_at || "").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    amount: a.price || a.loan_amount || 0,
  }));

  const filteredItems = (productsQuery.data?.items || []).filter(item => 
    item.name.toLowerCase().includes(debSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(debSearch.toLowerCase())
  );

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-brand-500 dark:text-brand-400">
              <Sparkles size={13} className="animate-pulse" />
            </span>
            <span className="text-[11px] font-display font-bold tracking-[0.15em] text-brand-500 dark:text-brand-400 uppercase text-glow">
              Operations Center
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-700 mx-1"></span>
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
              {time ? time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Loading..."}
            </span>
          </div>
          <h2 className="text-gradient-hero font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none">
            {getGreeting()}, Team.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-sans max-w-md">
            Monitor incoming catalog submissions, approve requests, and track portfolio health in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative group">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="btn-ghost p-2.5 !px-2.5">
              <RefreshCw size={15} className={summaryQuery.isFetching || productsQuery.isFetching ? "animate-spin" : ""} />
            </motion.button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
              Refresh Data
            </div>
          </div>
          
          <div className="relative group">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={exportCSV}
              className="btn-ghost gap-2">
              <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
            </motion.button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50 sm:hidden">
              Export CSV
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/apply")}
            className="btn-primary flex items-center gap-2">
            <Plus size={15} /> New Product
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Products", icon: Layers,
            value: summary.totalApplications || 0,
            sub: "Active underwriting pipeline",
            accent: "from-brand-500/8 to-transparent",
            iconColor: "text-brand-500 dark:text-brand-400",
            iconBg: "bg-brand-500/10 dark:bg-brand-500/15",
            glow: "hover:shadow-[0_24px_50px_-12px_rgba(232,24,74,0.35)] dark:hover:shadow-[0_24px_50px_-12px_rgba(232,24,74,0.5)] hover:border-brand-500/40 dark:hover:border-brand-500/50",
          },
          {
            label: "Total Value", icon: Wallet,
            value: Math.round(summary.totalAmount || 0), prefix: "₹",
            sub: `Avg ₹${summary.totalApplications > 0 ? Math.round((summary.totalAmount||0)/summary.totalApplications).toLocaleString("en-IN") : 0}`,
            accent: "from-indigo-500/8 to-transparent",
            iconColor: "text-indigo-500",
            iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
            glow: "hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.5)] hover:border-indigo-500/40 dark:hover:border-indigo-500/50",
          },
          {
            label: "Approved Volume", icon: UserCheck,
            value: Math.round(summary.approvedAmount || 0), prefix: "₹",
            sub: `${summary.statusCounts?.approved || 0} items approved`,
            accent: "from-emerald-500/8 to-transparent",
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
            glow: "hover:shadow-[0_24px_50px_-12px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_24px_50px_-12px_rgba(16,185,129,0.5)] hover:border-emerald-500/40 dark:hover:border-emerald-500/50",
          },
          {
            label: "Pending Reviews", icon: Clock,
            value: summary.statusCounts?.pending || 0,
            sub: `${summary.statusCounts?.rejected || 0} rejected`,
            accent: "from-amber-500/8 to-transparent",
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
            glow: "hover:shadow-[0_24px_50px_-12px_rgba(245,158,11,0.35)] dark:hover:shadow-[0_24px_50px_-12px_rgba(245,158,11,0.5)] hover:border-amber-500/40 dark:hover:border-amber-500/50",
          },
        ].map(({ label, icon: Icon, value, prefix="", sub, accent, iconColor, iconBg, glow }) => (
          <motion.div key={label}
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 20 } }}
            className={`glass-panel rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all duration-300 z-10 hover:z-20 ${glow}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500 leading-none">
                  {label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon size={15} className={iconColor} />
                </div>
              </div>
              <div className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-none">
                {prefix}{value.toLocaleString("en-IN")}
              </div>
              <div className="mt-3 text-[11px] font-medium text-slate-400 dark:text-slate-550 flex items-center gap-1">
                <ArrowUpRight size={11} className={iconColor} />
                {sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.3 } }}
          className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/40 dark:border-white/[0.05] h-[300px] flex flex-col group hover:shadow-[0_24px_50px_-12px_rgba(232,24,74,0.15)] dark:hover:shadow-[0_24px_50px_-12px_rgba(232,24,74,0.3)] hover:border-brand-500/30 dark:hover:border-brand-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                <TrendingUp size={15} className="text-brand-500 dark:text-brand-400" /> Capital Demand Curve
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Loan amounts from recent applications</p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-350 dark:text-slate-600 uppercase tracking-wider">Last 10</span>
          </div>
          <div className="flex-1 min-h-0">
            {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e8184a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#e8184a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize:10, fill:'#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:10, fill:'#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="glass-card px-4 py-3 rounded-xl text-xs border border-white/10">
                          <p className="text-slate-450 dark:text-slate-400 mb-1 font-medium">{label}</p>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            ₹{payload[0].value?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      );
                    }}
                    cursor={{ stroke:'rgba(232,24,74,0.2)', strokeWidth:1.5, strokeDasharray:'5 3' }} 
                  />
                  <Area type="monotone" dataKey="amount" stroke="#e8184a" strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    activeDot={{ r:5, fill:'#e8184a', stroke:'#fff', strokeWidth:2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <BarChart3 size={28} className="opacity-40" />
                <p className="text-xs font-medium">Submit applications to generate chart data</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.3 } }}
          className="glass-panel rounded-2xl p-5 border border-white/40 dark:border-white/[0.05] h-[300px] flex flex-col group hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.3)] hover:border-indigo-500/30 dark:hover:border-indigo-500/40 transition-all duration-300">
          <div className="shrink-0 mb-3">
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
              <Languages size={15} className="text-brand-500" /> Category Split
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Category distribution map</p>
          </div>
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
            {summary.languageDistribution?.length > 0 ? (
              <>
                <div className="w-full h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={summary.languageDistribution}
                        cx="50%" cy="50%" innerRadius={44} outerRadius={62}
                        paddingAngle={5} dataKey="value" stroke="none">
                        {summary.languageDistribution.map((item, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="glass-card px-3 py-2 rounded-xl text-xs border border-white/10 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: data.fill }} />
                              <span className="font-semibold text-slate-900 dark:text-white text-[13px]">{data.name}</span>
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-[13px]">({data.value.toLocaleString()})</span>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-full mt-2 no-scrollbar overflow-y-auto max-h-[80px]">
                  {summary.languageDistribution.slice(0, 6).map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-350 truncate">{item.name} ({item.value.toLocaleString()})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Languages size={26} className="opacity-40" />
                <p className="text-xs font-medium">No partitions found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Products Table */}
      <div>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3
          p-3 glass-panel rounded-2xl border border-white/40 dark:border-white/[0.05] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-12px_rgba(255,255,255,0.05)] transition-all duration-300">
          
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products by name..."
              className="input-base py-2 pl-9"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-450 shrink-0">
              <Filter size={13} />
              Filter Category:
            </div>
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="input-base py-2 !w-auto pr-8 cursor-pointer font-medium"
            >
              <option value="all">All Categories</option>
              {summary.languageDistribution?.map(l => (
                <option key={l.name} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Frame */}
        <div className="glass-panel rounded-2xl border border-white/40 dark:border-white/[0.05] overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.65)] transition-all duration-500">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/[0.04] bg-slate-50/30 dark:bg-slate-900/10">
                  <th className="px-6 py-4.5 text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">ID</th>
                  <th className="px-6 py-4.5 text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">Product Name</th>
                  <th className="px-6 py-4.5 text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">Category</th>
                  <th className="px-6 py-4.5 text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">Price (₹)</th>
                  <th className="px-6 py-4.5 text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">Stock (units)</th>
                  <th className="px-6 py-4.5 text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">Status</th>
                  <th className="px-6 py-4.5 text-[10px] font-display font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.03] font-sans">
                {productsQuery.isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-6 px-7 py-5 border-b border-slate-100/50 dark:border-white/[0.03] last:border-0">
                          <div className="skeleton h-3.5 w-16 opacity-80" />
                          <div className="skeleton h-4 w-40 opacity-90 ml-6" />
                          <div className="skeleton h-3.5 w-24 opacity-80 ml-6" />
                          <div className="skeleton h-4 w-20 opacity-90 ml-auto mr-12" />
                          <div className="skeleton h-6 w-16 rounded-full opacity-80" />
                          <div className="skeleton h-6 w-20 rounded-full ml-auto" />
                        </div>
                      ))}
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-450 dark:text-slate-550 font-medium">
                      <Inbox className="w-9 h-9 mx-auto mb-3 opacity-30 text-brand-500" />
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((product) => {
                    const status = getStatus(product.price);
                    const color = STATUS_COLORS[status] || STATUS_COLORS.pending;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.015] transition-colors group">
                        <td className="px-6 py-4.5">
                          <button
                            onClick={() => copyId(product.id)}
                            className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-450 dark:text-slate-550 hover:text-brand-500 transition-colors"
                          >
                            <span>#{product.id}</span>
                            {copiedId === product.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </button>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {product.name}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="text-xs font-mono font-semibold text-slate-550 dark:text-slate-450">
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color.bg} ${color.text} ${color.border}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openProductModal(product, false)}
                              className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => openProductModal(product, true)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4.5 border-t border-slate-200/50 dark:border-white/[0.04] bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between">
            <span className="text-xs text-slate-450 dark:text-slate-500 font-medium">
              Page Index: <strong className="font-bold text-slate-800 dark:text-slate-350">{pageIndex + 1}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pageIndex === 0}
                onClick={handlePrevPage}
                className="btn-ghost py-1.5 px-3 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={13} /> Prev Page
              </button>
              <button
                disabled={!productsQuery.data?.hasMore}
                onClick={handleNextPage}
                className="btn-ghost py-1.5 px-3 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Page <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail / Edit Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-slate-950 z-50 pointer-events-auto"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 glass-card rounded-2xl border border-white/10 z-50 max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/50 dark:border-white/[0.05]">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {isEditMode ? "Modify Product Details" : `Product Details (#${selectedProduct.id})`}
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {isEditMode ? (
                <form onSubmit={handleEditSubmit} className="space-y-4 font-sans text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 mb-1.5 uppercase">Product Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 mb-1.5 uppercase">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 mb-1.5 uppercase">Category</label>
                      <input
                        type="text"
                        required
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className="input-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 dark:text-slate-400 mb-1.5 uppercase">Product Description</label>
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="input-base"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateProductMutation.isPending}
                      className="btn-primary"
                    >
                      {updateProductMutation.isPending ? "Applying..." : "Save Product"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 text-sm">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-3.5">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Product Category</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedProduct.category}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Created At</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{new Date(selectedProduct.createdAt).toLocaleString()}</strong>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3.5">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Pricing (₹)</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold text-base">₹{selectedProduct.price.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Stock Allocation</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedProduct.stock} units</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Product Description</span>
                    <p className="text-slate-550 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/40 dark:border-white/[0.03] leading-relaxed">
                      {selectedProduct.description || "No description specified for this product catalog entry."}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-200/50 dark:border-white/[0.05]">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Edit2 size={13} /> Edit Product
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
