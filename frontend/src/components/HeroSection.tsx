"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Terminal, Database, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroSection() {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 100]);
  const yPanels = useTransform(scrollY, [0, 500], [0, -60]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse parallax for floating panels
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-[92vh] flex items-center overflow-hidden pt-20">
      {/* Soft Cinematic Volumetric Gradients */}
      <div className="absolute top-0 left-[-15%] w-[1000px] h-[1000px] bg-cyan-950/8 rounded-full blur-[160px] opacity-30 pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[800px] h-[800px] bg-violet-950/8 rounded-full blur-[140px] opacity-20 pointer-events-none" />
      
      {/* Fog Layer from globals.css */}
      <div className="fog-layer" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Gigantic Asymmetrical Typography */}
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          className="col-span-1 lg:col-span-7 flex flex-col items-start"
        >
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-3 px-3 py-1.5 hard-surface mb-8 border border-white/5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/80 animate-pulse" style={{ animationDuration: "4s" }} />
            <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase">System Active</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[4.5rem] sm:text-[6.5rem] md:text-[8rem] font-bold tracking-[-0.05em] leading-[0.85] text-breath mb-8 -ml-1 text-zinc-200"
          >
            Data <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-600/30">
              Engine.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm md:text-base text-zinc-400 max-w-xl font-light leading-relaxed border-l border-zinc-800 pl-6"
          >
            A high-performance infrastructure visualizing <strong className="font-medium text-zinc-200">200,000 deterministic nodes</strong> with zero duplicates. Built for infinite scale.
          </motion.p>
        </motion.div>

        <motion.div 
          style={{ y: yPanels, perspective: 1200 }}
          className="col-span-1 lg:col-span-5 relative h-[500px] hidden lg:block"
        >
          {/* Panel 1: Live Terminal */}
          <motion.div 
            animate={{ 
              x: mousePos.x * -0.6, 
              y: mousePos.y * -0.6,
              z: 20,
              rotateX: mousePos.y * 0.15,
              rotateY: mousePos.x * -0.15,
            }}
            transition={{ type: "spring", damping: 60, stiffness: 40 }}
            className="absolute top-0 right-0 w-[420px] glass-panel-deep p-6 z-20"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">SYSTEM.LOG</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-850" />
                <div className="w-2 h-2 rounded-full bg-zinc-850" />
                <div className="w-2 h-2 rounded-full bg-zinc-850" />
              </div>
            </div>
            <TerminalStream />
          </motion.div>

          {/* Panel 2: Latency Graph / Metric */}
          <motion.div 
            animate={{ 
              x: mousePos.x * -0.3, 
              y: mousePos.y * -0.3 + 30,
              z: 10,
              rotateX: mousePos.y * 0.1,
              rotateY: mousePos.x * -0.1,
            }}
            transition={{ type: "spring", damping: 70, stiffness: 50 }}
            className="absolute bottom-20 left-[-40px] w-[240px] glass-deep p-5 z-30"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-3.5 h-3.5 text-zinc-550" />
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">Query Latency</span>
            </div>
            <div className="text-2xl font-light tracking-tight text-zinc-300">11.4<span className="text-xs text-zinc-500 ml-1">ms</span></div>
            <div className="w-full h-8 mt-4 flex items-end gap-1 opacity-45">
              {[40, 20, 60, 30, 80, 45, 25, 90, 50, 30].map((h, i) => (
                <motion.div 
                  key={i} 
                  animate={{ height: [`${h}%`, `${h + (Math.random() * 20 - 10)}%`, `${h}%`] }}
                  transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex-1 bg-zinc-650 rounded-t-sm"
                />
              ))}
            </div>
          </motion.div>

          {/* Panel 3: Abstract DB Node */}
          <motion.div 
            animate={{ 
              x: mousePos.x * -0.9, 
              y: mousePos.y * -0.9 + 80,
              z: 5,
              rotateX: mousePos.y * 0.08,
              rotateY: mousePos.x * -0.08,
            }}
            transition={{ type: "spring", damping: 80, stiffness: 45 }}
            className="absolute top-[60%] right-[-20px] w-[200px] glass-deep p-5 z-10 opacity-50"
          >
             <div className="flex items-center gap-3 mb-2">
              <Database className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">Node Sync</span>
            </div>
            <div className="text-xl font-bold tracking-tight text-zinc-300">200,000</div>
            <div className="text-[10px] font-mono text-zinc-600 mt-1">Indexed perfectly.</div>
          </motion.div>

        </motion.div>
      </div>

      {/* Cinematic scroll prompt */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hover:opacity-100 transition-opacity"
      >
        <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-zinc-600">Initialize Feed</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-700/40 to-transparent relative overflow-hidden">
          <motion.div 
            animate={{ top: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute left-0 right-0 h-[50%] bg-gradient-to-b from-transparent via-zinc-400 to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}

function TerminalStream() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    // Initial boot sequence
    const sequence = [
      { text: "Initializing deterministic stream...", delay: 500 },
      { text: "Connected to PostgreSQL Node (us-east-1).", delay: 1500 },
      { text: "Stream active. Awaiting user interrupts.", delay: 2500 },
    ];

    const timeouts = sequence.map((item) =>
      setTimeout(() => {
        setLines((prev) => [...prev, item.text]);
      }, item.delay)
    );

    // Listen for actual system events dispatched from the rest of the app
    const handleSystemLog = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setLines((prev) => [...prev, customEvent.detail]);
    };

    window.addEventListener("system-log", handleSystemLog);

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener("system-log", handleSystemLog);
    };
  }, []);

  return (
    <div 
      className="font-mono text-xs leading-relaxed space-y-2 h-[200px] flex flex-col justify-end overflow-hidden relative"
      style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)' }}
    >
      <AnimatePresence>
        {lines.slice(-6).map((line, i) => (
          <motion.div 
            key={`${i}-${line}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
            className={`flex items-start gap-3 ${i === lines.slice(-6).length - 1 ? "text-zinc-300" : "text-zinc-600"}`}
          >
            <span className="text-zinc-700 shrink-0">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
            <span>{line}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex items-center gap-2 text-zinc-500 mt-2">
        <span className="text-zinc-700">~</span>
        <span className="w-1.5 h-3 bg-zinc-600 animate-pulse" style={{ animationDuration: "2s" }} />
      </div>
    </div>
  );
}
