
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Loader2, ArrowRight, Download, Check, FileText, FileType, File, Zap, Layers } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dictionary } from "@/lib/i18n";
import { downloadMarkdown, downloadPDF, downloadTXT, downloadAllAsZip } from "@/lib/downloadUtils";
import { Logo } from "@/components/logo";

interface LandingHeroProps {
    dict: Dictionary;
}

type TranscriptionResult = {
    url?: string;
    title: string;
    full_text: string;
    paragraphs?: string[];
    success?: boolean;
    error?: string;
};

export function LandingHero({ dict }: LandingHeroProps) {
    const [mode, setMode] = useState<"single" | "batch">("single");
    const [url, setUrl] = useState("");
    const [batchUrls, setBatchUrls] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TranscriptionResult | null>(null);
    const [batchResults, setBatchResults] = useState<TranscriptionResult[]>([]);
    const [error, setError] = useState("");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Confetti / Canvas Ref
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setResult(null);
        setBatchResults([]);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

        if (mode === "single") {
            if (!url.trim()) return;
            setLoading(true);
            try {
                const response = await axios.post(`${apiUrl}/transcribe`, { url });
                setResult(response.data);
                fireConfetti();
            } catch (err) {
                console.error(err);
                setError(dict?.error?.generic || "Ocurrió un error. Verifica la URL e intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        } else {
            const urls = batchUrls.split("\n").map(u => u.trim()).filter(u => u);
            if (urls.length === 0) {
                setError(dict?.error?.no_urls || "Por favor ingresa al menos una URL.");
                return;
            }
            setLoading(true);
            try {
                const response = await axios.post(`${apiUrl}/transcribe/batch`, { urls });
                setBatchResults(response.data.results);
                if (response.data.results.some((r: any) => r.success)) {
                    fireConfetti();
                }
            } catch (err) {
                console.error(err);
                setError(dict?.error?.generic || "Ocurrió un error en el procesamiento por lotes.");
            } finally {
                setLoading(false);
            }
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // --- Confetti Logic (from WaitlistHero) ---
    const fireConfetti = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const particles: any[] = [];
        const colors = ["#0079da", "#10b981", "#fbbf24", "#f472b6", "#fff"];

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const createParticle = () => {
            return {
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 2) * 10,
                life: 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2,
            };
        };

        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }

        const animate = () => {
            if (particles.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5;
                p.life -= 2;

                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life / 100);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                if (p.life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }

            requestAnimationFrame(animate);
        };

        animate();
    };

    // Color tokens
    const colors = {
        textMain: "#ffffff",
        textSecondary: "#94a3b8",
        bluePrimary: "#0079da",
        success: "#10b981",
        inputBg: "#27272a",
        baseBg: "#09090b",
        inputShadow: "rgba(255, 255, 255, 0.1)",
    };

    return (
        <div className="w-full h-auto bg-black flex flex-col items-center justify-center relative overflow-hidden py-24">
            {/* Animation Styles */}
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 60s linear infinite;
                }
                @keyframes spin-slow-reverse {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .animate-spin-slow-reverse {
                    animation: spin-slow-reverse 60s linear infinite;
                }
            `}</style>

            {/* Background Decorative Layer */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none sticky top-0"
                style={{
                    perspective: "1200px",
                    transform: "perspective(1200px) rotateX(15deg)",
                    transformOrigin: "center bottom",
                    opacity: 1,
                    zIndex: 0
                }}
            >
                {/* Image 3 (Back) */}
                <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-1/2 left-1/2" style={{ width: "2000px", height: "2000px", transform: "translate(-50%, -50%) rotate(279.05deg)", zIndex: 0 }}>
                        <img src="https://framerusercontent.com/images/oqZEqzDEgSLygmUDuZAYNh2XQ9U.png?scale-down-to=2048" alt="" className="w-full h-full object-cover opacity-30" />
                    </div>
                </div>
                {/* Image 2 (Middle) */}
                <div className="absolute inset-0 animate-spin-slow-reverse">
                    <div className="absolute top-1/2 left-1/2" style={{ width: "1000px", height: "1000px", transform: "translate(-50%, -50%) rotate(304.42deg)", zIndex: 1 }}>
                        <img src="https://framerusercontent.com/images/UbucGYsHDAUHfaGZNjwyCzViw8.png?scale-down-to=1024" alt="" className="w-full h-full object-cover opacity-40" />
                    </div>
                </div>
                {/* Image 1 (Front) */}
                <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-1/2 left-1/2" style={{ width: "800px", height: "800px", transform: "translate(-50%, -50%) rotate(48.33deg)", zIndex: 2 }}>
                        <img src="https://framerusercontent.com/images/Ans5PAxtJfg3CwxlrPMSshx2Pqc.png" alt="" className="w-full h-full object-cover opacity-50" />
                    </div>
                </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: `linear-gradient(to top, ${colors.baseBg} 5%, rgba(9, 9, 11, 0.8) 40%, transparent 100%)` }} />

            {/* Main Content */}
            <div className="relative z-20 w-full flex flex-col items-center px-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center space-y-3 max-w-4xl"
                >
                    <div className="mb-6">
                        <Logo size={80} className="shadow-2xl shadow-blue-500/30" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
                        {dict?.hero?.title || "Transcribir Video a Texto"}
                    </h1>

                    <p className="text-base md:text-lg font-medium text-neutral-400 max-w-2xl leading-relaxed">
                        {dict?.hero?.subtitle || "Convierte tus videos de YouTube, TikTok o Instagram en texto perfectamente formateado en segundos."}
                    </p>
                </motion.div>

                {/* Mode Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex p-1 bg-neutral-900/80 backdrop-blur-md rounded-xl border border-white/10"
                >
                    <button
                        onClick={() => setMode("single")}
                        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 z-10 ${mode === "single" ? "text-black" : "text-neutral-400 hover:text-white"}`}
                    >
                        {mode === "single" && (
                            <motion.div
                                layoutId="mode-highlight"
                                className="absolute inset-0 bg-white shadow-lg rounded-lg -z-10"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <Zap className="w-4 h-4" />
                        {dict?.hero?.mode_single || "Individual"}
                    </button>
                    <button
                        onClick={() => setMode("batch")}
                        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 z-10 ${mode === "batch" ? "text-black" : "text-neutral-400 hover:text-white"}`}
                    >
                        {mode === "batch" && (
                            <motion.div
                                layoutId="mode-highlight"
                                className="absolute inset-0 bg-white shadow-lg rounded-lg -z-10"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <Layers className="w-4 h-4" />
                        {dict?.hero?.mode_batch || "Lote (Batch)"}
                    </button>
                </motion.div>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full max-w-2xl relative perspective-1000"
                >
                    <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-50" />

                    <form onSubmit={handleSubmit} className="relative w-full group">
                        <div className="relative overflow-hidden rounded-[2rem] bg-neutral-900/50 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300 focus-within:ring-white/30 focus-within:bg-neutral-900/80">
                            <AnimatePresence mode="wait">
                                {mode === "single" ? (
                                    <motion.div
                                        key="single-input"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <input
                                            type="text"
                                            placeholder={dict?.hero?.placeholder || "Pega el enlace del video aquí..."}
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full h-[72px] pl-8 pr-[160px] bg-transparent text-lg text-white placeholder-neutral-500 outline-none"
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="batch-input"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <textarea
                                            placeholder={dict?.hero?.batch_placeholder || "Pega múltiples enlaces aquí (uno por línea)..."}
                                            value={batchUrls}
                                            onChange={(e) => setBatchUrls(e.target.value)}
                                            className="w-full min-h-[160px] p-8 pr-[160px] bg-transparent text-lg text-white placeholder-neutral-500 outline-none resize-y"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={`absolute ${mode === 'single' ? 'top-3 right-3 bottom-3' : 'bottom-4 right-4'}`}>
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="h-full px-8 rounded-full font-semibold text-white transition-all shadow-lg hover:brightness-110 disabled:hover:brightness-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                                    style={{ backgroundColor: colors.bluePrimary }}
                                >
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                            >
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="cta"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center"
                                            >
                                                {dict?.hero?.cta || "Transcribir"}
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        </div>
                    </form>
                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mt-4 text-center bg-red-500/10 py-2 px-4 rounded-full border border-red-500/20">
                            {error}
                        </motion.p>
                    )}
                </motion.div>

                {/* Results Section */}
                <div className="w-full max-w-4xl mt-8 space-y-6 z-30">
                    {/* Download All for Batch */}
                    {batchResults.some(r => r.success) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                            <Button
                                onClick={() => downloadAllAsZip(batchResults.filter(r => r.success && r.title && r.full_text) as any)}
                                variant="outline"
                                className="border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800 hover:text-white backdrop-blur-sm"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {dict?.result?.download_all || "Descargar Todo ZIP"}
                            </Button>
                        </motion.div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {(mode === "single" && result ? [result] : batchResults).map((item, idx) => (
                            <motion.div
                                key={`${item.url}-${idx}`}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    delay: idx * 0.1
                                }}
                            >
                                <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-xl text-neutral-100 overflow-hidden shadow-2xl ring-1 ring-white/5">
                                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 bg-white/5">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                {item.success === false ? (
                                                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20 uppercase tracking-wider">
                                                        Error
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-wider">
                                                        <Check className="w-3 h-3" /> Éxito
                                                    </span>
                                                )}
                                                <CardTitle className="text-lg font-semibold leading-tight text-white/90">
                                                    {item.title || "Sin Título"}
                                                </CardTitle>
                                            </div>
                                            {item.url && <CardDescription className="text-neutral-500 font-mono text-xs truncate max-w-md">{item.url}</CardDescription>}
                                            {item.error && <p className="text-red-400 text-sm">{item.error}</p>}
                                        </div>

                                        {item.success !== false && (
                                            <div className="flex flex-wrap gap-2">
                                                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors" onClick={() => downloadTXT(item.title, item.full_text)} title="TXT">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" onClick={() => downloadPDF(item.title, item.full_text, item.paragraphs)} title="PDF">
                                                        <FileType className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-md transition-colors" onClick={() => downloadMarkdown(item.title, item.full_text)} title="Markdown">
                                                        <File className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(item.full_text, idx)} className="bg-white/10 hover:bg-white/20 text-white border-0">
                                                    {copiedIndex === idx ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                                    {copiedIndex === idx ? (dict?.result?.copied || "Copiado") : (dict?.result?.copy || "Copiar")}
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>

                                    {item.success !== false && (
                                        <CardContent className="pt-6">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                                className="p-6 rounded-xl bg-black/40 border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar font-serif leading-8 text-neutral-300 selection:bg-blue-500/30 selection:text-blue-200"
                                            >
                                                {item.paragraphs && item.paragraphs.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {item.paragraphs.map((para, i) => (
                                                            <motion.p
                                                                key={i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.1 * i }}
                                                                className="text-[1.05rem]"
                                                            >
                                                                {para}
                                                            </motion.p>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap text-[1.05rem]">{item.full_text}</p>
                                                )}
                                            </motion.div>
                                        </CardContent>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
