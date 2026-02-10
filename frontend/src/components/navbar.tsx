
"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dictionary, Language } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";

interface NavbarProps {
    lang: Language;
    dict: Dictionary;
    onToggleLang: () => void;
}

export function Navbar({ lang, dict, onToggleLang }: NavbarProps) {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md"
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Logo size={32} />
                    <span className="font-bold text-lg tracking-tight text-white">{dict.nav.brand}</span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleLang}
                    className="text-muted-foreground hover:text-white"
                >
                    <Globe className="mr-2 h-4 w-4" />
                    {lang === "en" ? "ES" : "EN"}
                </Button>
            </div>
        </motion.nav>
    );
}
