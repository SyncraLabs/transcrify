
"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { LandingHero } from "@/components/landing-hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { dictionary, Language } from "@/lib/i18n";

export default function Home() {
  const [lang, setLang] = useState<Language>("es"); // Default to Spanish as per user context (syncralabs.es)

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "es" : "en"));
  };

  const dict = dictionary[lang];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar lang={lang} dict={dict} onToggleLang={toggleLang} />
      <LandingHero dict={dict} />
      <Features dict={dict} />
      <HowItWorks dict={dict} />
      <Testimonials dict={dict} />
      <FAQ dict={dict} />
      <Footer dict={dict} />
    </main>
  );
}
