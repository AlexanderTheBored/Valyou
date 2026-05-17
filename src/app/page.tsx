import Link from "next/link";
import NavbarDark from "@/components/NavbarDark";
import HeroMapClient from "@/components/HeroMapClient";
import { MapPin, ArrowRight } from "lucide-react";

const steps = [
  { n: "01", title: "Drop a Pin", desc: "Click any street, barangay, or neighborhood on the interactive Philippines map." },
  { n: "02", title: "Enter Details", desc: "Provide lot area, floor area, and number of bedrooms." },
  { n: "03", title: "Get Your Estimate", desc: "See the market value and every real listing used to calculate it." },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f3] dark:bg-[#0f0f0e]">
      <NavbarDark />
      <HeroMapClient />

      {/* How it works */}
      <section className="py-16 bg-[#f5f5f3] dark:bg-[#0f0f0e]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#C3110F] text-[10px] font-bold uppercase tracking-widest mb-1.5">How It Works</p>
            <h2 className="text-[#242420] dark:text-white font-bold text-2xl">Get your estimate in 3 steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+2rem)] right-[-50%] h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-full border border-[#C3110F]/40 bg-[#C3110F]/10 flex items-center justify-center mb-5">
                    <span className="text-[#C3110F] font-bold text-sm">{step.n}</span>
                  </div>
                  <h3 className="text-[#242420] dark:text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-[#242420]/40 dark:text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-[#C3110F] text-white text-sm font-semibold px-6 py-3 rounded hover:bg-red-700 transition-colors"
            >
              Get Started — Free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#eaeae8] dark:bg-[#080807] border-t border-black/[0.06] dark:border-white/[0.06] text-[#242420]/30 dark:text-white/30 mt-auto">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 text-[#242420] dark:text-white font-bold text-lg mb-3">
                <MapPin size={16} className="text-[#C3110F]" />
                Val<span className="text-[#C3110F]">You</span>
              </div>
              <p className="text-sm leading-relaxed">
                Philippines real estate market intelligence — free, transparent, and data-driven.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Explore Map", "How It Works", "Market Trends"] },
              { heading: "Company", links: ["About ValYou", "Blog", "Contact Us", "Privacy Policy"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-[#242420]/60 dark:text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">{col.heading}</p>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="hover:text-[#242420]/80 dark:hover:text-white/80 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 ValYou Philippines. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy", "Terms", "Sitemap"].map((l) => (
                <a key={l} href="#" className="hover:text-[#242420]/60 dark:hover:text-white/60 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
