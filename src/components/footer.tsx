
"use client";

import { Dictionary } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { Github, Twitter, Linkedin } from "lucide-react";

interface FooterProps {
    dict: Dictionary;
}

export function Footer({ dict }: FooterProps) {
    return (
        <footer className="bg-neutral-950 border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <Logo size={32} />
                            <span className="font-bold text-xl text-white">{dict.footer.brand}</span>
                        </div>
                        <p className="text-neutral-400 max-w-sm mb-6">
                            {dict.footer.desc}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-neutral-400">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-neutral-400">
                            <li><a href="#" className="hover:text-white transition-colors">{dict.footer.links.terms}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{dict.footer.links.privacy}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{dict.footer.links.contact}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 text-center text-neutral-500 text-sm">
                    {dict.footer.copyright}
                </div>
            </div>
        </footer>
    );
}
