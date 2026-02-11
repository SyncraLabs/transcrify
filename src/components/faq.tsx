
"use client";

import { useState } from "react";
import { Dictionary } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQProps {
    dict: Dictionary;
}

export function FAQ({ dict }: FAQProps) {
    const faqs = dict.faq.items;

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-black relative">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {dict.faq.title}
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="border border-white/10 rounded-xl bg-neutral-900/30 overflow-hidden transition-colors hover:border-white/20"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-medium text-lg text-white">{faq.q}</span>
                                {activeIndex === idx ? (
                                    <Minus className="w-5 h-5 text-neutral-400" />
                                ) : (
                                    <Plus className="w-5 h-5 text-neutral-400" />
                                )}
                            </button>

                            <AnimatePresence>
                                {activeIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 text-neutral-400 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
