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
      <section className="py-14 sm:py-20 bg-[#f5f5f3] dark:bg-[#0f0f0e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#C3110F] text-[10px] font-bold uppercase tracking-[0.18em] mb-2">How It Works</p>
            <h2 className="text-[#242420] dark:text-white font-bold text-2xl sm:text-3xl tracking-tight">
              Get your estimate in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+2.25rem)] right-[-50%] h-px bg-gradient-to-r from-black/[0.1] dark:from-white/[0.1] to-transparent" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-full border border-[#C3110F]/40 bg-[#C3110F]/[0.08] flex items-center justify-center mb-5 shadow-sm shadow-[#C3110F]/10">
                    <span className="text-[#C3110F] font-bold text-sm tabular-nums">{step.n}</span>
                  </div>
                  <h3 className="text-[#242420] dark:text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-[#242420]/55 dark:text-white/55 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-[#C3110F] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#a80e0d] active:scale-[0.98] transition-all shadow-md shadow-[#C3110F]/20 hover:shadow-lg hover:shadow-[#C3110F]/30 group"
            >
              Get Started — Free
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#eaeae8] dark:bg-[#080807] border-t border-black/[0.06] dark:border-white/[0.06] text-[#242420]/55 dark:text-white/55 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-[#242420] dark:text-white font-bold text-lg mb-3">
                <span className="inline-flex w-7 h-7 rounded-lg bg-[#C3110F] items-center justify-center">
                  <MapPin size={14} className="text-white" />
                </span>
                Val<span className="text-[#C3110F]">You</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Philippines real estate market intelligence — free, transparent, and data-driven.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Explore Map", "How It Works", "Market Trends"] },
              { heading: "Company", links: ["About ValYou", "Blog", "Contact Us", "Privacy Policy"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-[#242420]/70 dark:text-white/70 text-[10px] font-bold uppercase tracking-[0.18em] mb-4">{col.heading}</p>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="hover:text-[#242420] dark:hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <p>© 2026 ValYou Philippines. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy", "Terms", "Sitemap"].map((l) => (
                <a key={l} href="#" className="hover:text-[#242420] dark:hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
