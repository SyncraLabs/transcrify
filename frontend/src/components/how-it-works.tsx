
"use client";

import { Dictionary } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Link, Sparkles, Download } from "lucide-react";

interface HowItWorksProps {
    dict: Dictionary;
}

export function HowItWorks({ dict }: HowItWorksProps) {
    const steps = [
        {
            icon: <Link className="w-8 h-8 text-blue-400" />,
            title: dict.howItWorks.step1_title,
            desc: dict.howItWorks.step1_desc,
        },
        {
            icon: <Sparkles className="w-8 h-8 text-purple-400" />,
            title: dict.howItWorks.step2_title,
            desc: dict.howItWorks.step2_desc,
        },
        {
            icon: <Download className="w-8 h-8 text-indigo-400" />,
            title: dict.howItWorks.step3_title,
            desc: dict.howItWorks.step3_desc,
        },
    ];

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                        {dict.howItWorks.title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="flex flex-col items-center text-center p-8 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-white/20 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        </section>
    );
}
