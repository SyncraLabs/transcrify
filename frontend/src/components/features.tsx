"use client";

import { Dictionary } from "@/lib/i18n";
import { Gauge, Languages, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturesProps {
    dict: Dictionary;
}

export function Features({ dict }: FeaturesProps) {
    const features = [
        {
            title: dict.features.f1_title,
            description: dict.features.f1_desc,
            icon: <Gauge className="w-6 h-6 text-blue-500" />,
        },
        {
            title: dict.features.f2_title,
            description: dict.features.f2_desc,
            icon: <Languages className="w-6 h-6 text-purple-500" />,
        },
        {
            title: dict.features.f3_title,
            description: dict.features.f3_desc,
            icon: <Shield className="w-6 h-6 text-green-500" />,
        },
    ];

    return (
        <section className="w-full py-16 bg-black relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
                        {dict.features.title}
                    </h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                        Todo lo que necesitas para convertir tus videos en contenido escrito de alta calidad.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.2)" }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-8 border border-white/10 transition-colors group"
                        >
                            <div className="bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
