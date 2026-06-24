"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Languages, FileText, Copy, Check,
  ArrowLeft, Sparkles, Loader2, CheckCircle2, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

const CATEGORIES = [
  { value: 'Electronics',    label: 'Electronics' },
  { value: 'Home & Kitchen', label: 'Home & Kitchen' },
  { value: 'Apparel',        label: 'Apparel' },
  { value: 'Sports',         label: 'Sports' },
  { value: 'Books',          label: 'Books' },
  { value: 'Toys',           label: 'Toys' },
  { value: 'Beauty',         label: 'Beauty' },
  { value: 'Automotive',     label: 'Automotive' },
  { value: 'Health',         label: 'Health' },
  { value: 'Grocery',        label: 'Grocery' }
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1] as const, duration: 0.6 } },
};

function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p initial={{ opacity:0, y:-4, height:0 }} animate={{ opacity:1, y:0, height:'auto' }}
          exit={{ opacity:0, y:-4, height:0 }} transition={{ duration:0.18 }}
          className="text-[11px] font-semibold text-red-500 pl-1 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full shrink-0" />{msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function ApplyLoan() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', category: '', price: '', description: '', imageUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    if (!form.category) e.category = 'Please select a category';

    const amt = parseFloat(form.price);
    if (!form.price) e.price = 'Price is required';
    else if (isNaN(amt) || amt <= 0) e.price = 'Enter a valid price greater than ₹0';

    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 5) e.description = 'Description must be at least 5 characters';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const isValid = {
    name: form.name.trim().length >= 2,
    category: !!form.category,
    price: form.price !== '' && Number(form.price) > 0,
    description: form.description.trim().length >= 5,
  };

  const calculateProgress = () => {
    let filled = 0;
    if (isValid.name) filled++;
    if (isValid.category) filled++;
    if (isValid.price) filled++;
    if (isValid.description) filled++;
    return (filled / 4) * 100;
  };
  const progress = calculateProgress();

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Import canvas-confetti dynamically
      const confetti = (await import('canvas-confetti')).default;

      const res = await fetch(`${getApiBaseUrl()}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: parseFloat(form.price),
          description: form.description,
          imageUrl: form.imageUrl || 'https://picsum.photos/seed/new/400/400'
        })
      });
      
      if (res.ok) {
        const json = await res.json();
        setSuccess(json.data);
        setForm({ name: '', category: '', price: '', description: '', imageUrl: '' });
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e8184a', '#6366f1', '#10b981', '#f59e0b']
        });
      } else {
        const json = await res.json();
        alert(json.error?.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error(err);
      alert('Network connection error');
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    if (!success) return;
    navigator.clipboard.writeText(String(success.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto py-2 z-10 relative">
      <AnimatePresence mode="wait">

        {/* Form */}
        {!success && (
          <motion.div key="form"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-12 }} transition={{ ease: [0.16, 1, 0.3, 1], duration:0.5 }}>

            {/* Page header */}
            <div className="mb-7 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-brand-500 animate-pulse" />
                <span className="text-[11px] font-display font-bold tracking-[0.15em] text-brand-500 uppercase text-glow">
                  Quick Catalog Entry
                </span>
              </div>
              <h2 className="text-gradient-hero font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none">
                Add New Product
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Complete the form below to register a new product to the catalog.
              </p>
            </div>

            {/* Card */}
            <div className="glass-panel rounded-3xl relative overflow-hidden
              border border-white/50 dark:border-white/[0.05] shadow-premium">
              {/* Top accent bar & Progress */}
              <div className="relative h-1 w-full bg-slate-100 dark:bg-slate-900">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                  className="absolute inset-y-0 left-0"
                  style={{ background:'linear-gradient(90deg,#e8184a 0%,#a80933 60%,#6366f1 100%)' }} 
                />
              </div>

              <motion.form variants={stagger} initial="hidden" animate="show"
                onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

                {/* Name */}
                <motion.div variants={rise} className="space-y-1.5 group">
                  <label className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-widest text-slate-500 dark:text-slate-455 group-focus-within:text-brand-500 transition-colors">
                    <span>Product Name</span>
                    {isValid.name && <CheckCircle2 size={13} className="text-emerald-500" />}
                  </label>
                  <div className="relative focus-within:scale-[1.01] transition-transform duration-300">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                    <input name="name" type="text" value={form.name}
                      onChange={handleChange} placeholder="e.g. Ergonomic Desk"
                      className={`input-base pl-10 pr-4 py-3 ${errors.name ? 'error' : ''}`} />
                  </div>
                  <FieldError msg={errors.name} />
                </motion.div>

                {/* Price + Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div variants={rise} className="space-y-1.5 group">
                    <label className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-widest text-slate-500 dark:text-slate-455 group-focus-within:text-brand-500 transition-colors">
                      <span>Price (₹)</span>
                      {isValid.price && <CheckCircle2 size={13} className="text-emerald-500" />}
                    </label>
                    <div className="relative focus-within:scale-[1.01] transition-transform duration-300">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-455 dark:text-slate-550 font-bold text-sm pointer-events-none group-focus-within:text-brand-500 transition-colors">₹</span>
                      <input name="price" type="number" step="0.01" value={form.price}
                        onChange={handleChange} placeholder="500"
                        className={`input-base pl-8 pr-4 py-3 font-semibold ${errors.price ? 'error' : ''}`} />
                    </div>
                    <FieldError msg={errors.price} />
                  </motion.div>

                  <motion.div variants={rise} className="space-y-1.5 group">
                    <label className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-widest text-slate-500 dark:text-slate-455 group-focus-within:text-brand-500 transition-colors">
                      <span>Category</span>
                      {isValid.category && <CheckCircle2 size={13} className="text-emerald-500" />}
                    </label>
                    <div className="relative focus-within:scale-[1.01] transition-transform duration-300">
                      <Languages size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-455 dark:text-slate-550 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                      <select name="category" value={form.category}
                        onChange={handleChange}
                        className={`input-base pl-10 pr-8 py-3 appearance-none cursor-pointer ${errors.category ? 'error' : ''}`}>
                        <option value="" disabled>Select category</option>
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-455">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </div>
                    </div>
                    <FieldError msg={errors.category} />
                  </motion.div>
                </div>

                {/* Purpose / Description */}
                <motion.div variants={rise} className="space-y-1.5 group">
                  <label className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-widest text-slate-500 dark:text-slate-455 group-focus-within:text-brand-500 transition-colors">
                    <span>Product Description</span>
                    {isValid.description && <CheckCircle2 size={13} className="text-emerald-500" />}
                  </label>
                  <div className="relative focus-within:scale-[1.01] transition-transform duration-300">
                    <FileText size={15} className="absolute left-3.5 top-3.5 text-slate-455 dark:text-slate-500 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                    <textarea name="description" rows={4} value={form.description}
                      onChange={handleChange}
                      placeholder="Describe features, key specifications, and utility of this product catalog item…"
                      className={`input-base pl-10 pr-4 py-3 resize-none ${errors.description ? 'error' : ''}`} />
                  </div>
                  <FieldError msg={errors.description} />
                </motion.div>

                {/* Actions */}
                <motion.div variants={rise} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.button type="button" whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => router.push('/')}
                    className="btn-ghost flex-1 py-3 font-display justify-center">
                    Cancel
                  </motion.button>
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 10px 30px -10px rgba(232,24,74,0.5)" }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="btn-primary flex-1 py-3 justify-center gap-2">
                    {loading
                      ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                      : <><Zap size={15} className="fill-white" /> Add Product</>
                    }
                  </motion.button>
                </motion.div>

              </motion.form>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {success && (
          <motion.div key="success"
            initial={{ opacity:0, scale:0.92, y:24 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.92, y:-24 }}
            transition={{ type:'spring', stiffness:280, damping:24 }}
            className="text-center">

            <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden
              border border-white/50 dark:border-white/[0.06] shadow-glass-dark max-w-lg mx-auto">
              {/* Top accent */}
              <div className="h-1.5" style={{ background:'linear-gradient(90deg,#e8184a,#c00f3c)' }} />

              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-brand-500/10 dark:bg-brand-500/15 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/6 blur-3xl rounded-full pointer-events-none" />

              {/* Checkmark */}
              <motion.div
                initial={{ scale:0, rotate:-30 }} animate={{ scale:1, rotate:0 }}
                transition={{ type:'spring', stiffness:280, damping:18, delay:0.1 }}
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-7
                  bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-500/25 dark:to-brand-500/10
                  border-4 border-white dark:border-slate-800 shadow-xl relative z-10">
                <CheckCircle2 size={40} strokeWidth={2} className="text-brand-600 dark:text-brand-400" />
              </motion.div>

              <h2 className="font-display font-extrabold text-3xl tracking-tight mb-2 relative z-10 text-gradient-brand">
                Product Registered!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-sm mx-auto relative z-10">
                Your new catalog item has been successfully stored in the Neon database.
              </p>

              {/* Summary */}
              <div className="rounded-2xl p-5 mb-6 text-left space-y-3 relative z-10
                bg-white/70 dark:bg-slate-900/60
                border border-slate-200/50 dark:border-slate-800/60">
                {[
                  ['Product Name', success.name],
                  ['Price (₹)', `₹${success.price.toLocaleString('en-IN')}`],
                  ['Category', success.category],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-sm border-b border-slate-100/60 dark:border-slate-800/40 last:border-0 pb-2.5 last:pb-0">
                    <span className="text-slate-500 dark:text-slate-450 font-medium">{k}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{v}</span>
                  </div>
                ))}
              </div>

              {/* Reference ID */}
              <div className="mb-8 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-650 mb-2">Product ID</p>
                <div className="flex items-center gap-3 p-3.5 rounded-xl
                  bg-slate-100/60 dark:bg-slate-900/60
                  border border-slate-200/60 dark:border-slate-800/60 group">
                  <code className="flex-1 text-[11px] font-mono font-bold break-all text-left
                    text-slate-750 dark:text-brand-400 group-hover:text-brand-500 transition-colors select-all">
                    {success.id}
                  </code>
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                    onClick={copyId}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800
                      border border-slate-200/60 dark:border-slate-700
                      hover:border-brand-500/50 text-slate-400 hover:text-brand-500 transition-all shadow-sm shrink-0">
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </motion.button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={() => setSuccess(null)}
                  className="btn-ghost flex-1 py-3.5 font-display justify-center">
                  Add Another Product
                </motion.button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={() => router.push('/')}
                  className="btn-primary flex-1 py-3.5 justify-center gap-2">
                  <ArrowLeft size={15} /> Back to Dashboard
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
