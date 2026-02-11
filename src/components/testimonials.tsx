
"use client";

import { Dictionary } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface TestimonialsProps {
    dict: Dictionary;
}

export function Testimonials({ dict }: TestimonialsProps) {
    const testimonials = [
        {
            name: dict.testimonials.t1_name,
            role: dict.testimonials.t1_role,
            text: dict.testimonials.t1_text,
            avatar: "M",
            color: "bg-blue-500",
        },
        {
            name: dict.testimonials.t2_name,
            role: dict.testimonials.t2_role,
            text: dict.testimonials.t2_text,
            avatar: "C",
            color: "bg-purple-500",
        },
        {
            name: dict.testimonials.t3_name,
            role: dict.testimonials.t3_role,
            text: dict.testimonials.t3_text,
            avatar: "A",
            color: "bg-indigo-500",
        },
    ];

    return (
        <section className="py-24 bg-neutral-950 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {dict.testimonials.title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-neutral-900/40 backdrop-blur-sm p-8 rounded-2xl border border-white/5 relative group hover:bg-neutral-900/60 transition-colors"
                        >
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5 group-hover:text-white/10 transition-colors" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>

                            <p className="text-neutral-300 mb-6 leading-relaxed italic">"{t.text}"</p>

                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-white`}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{t.name}</h4>
                                    <p className="text-sm text-neutral-500">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
