"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, Search, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="bg-background text-gray-900">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl font-bold  mb-4"
        >
          Stop Writing. Start Selling.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto"
        >
          Generate High-Converting, RERA-Compliant Listings in Seconds.
          <br />
          PropWriter.AI uses specialized local AI to craft perfect, localized
          copy (Title, SEO, Social, Hinglish/Marathi) for the Indian market.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <Link
            href="/login"
            className="bg-[#0A0A0A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0A0A0A]/90 transition"
          >
            Generate Your First Listing Free (5 Credits)
          </Link>
          <button className="border-2 border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 rounded-lg font-semibold hover:bg-[#0A0A0A] hover:text-white transition">
            See Demo
          </button>
        </motion.div>

        {/* Placeholder for product demo video */}
        <div className="mt-12 max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-primary/50">
            <div className="aspect-video">
                <video 
                    src="/demo.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover rounded-lg"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-[#0A0A0A]">
            Your Listings Should Work as Hard as You Do.
          </h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-3">
              <Zap className="text-accent w-6 h-6 mt-1" />
              <div>
                <strong>Problem:</strong> Generic copy gets ignored.
                <br />
                <span className="text-gray-700">
                  AI injects local keywords & narrative, boosting engagement.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Search className="text-accent w-6 h-6 mt-1" />
              <div>
                <strong>Problem:</strong> Manual formatting wastes time.
                <br />
                <span className="text-gray-700">
                  Get the complete package — Title, Description, SEO, Social —
                  in one .txt file.
                </span>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-card rounded-lg p-8 flex flex-col justify-center">
          <p className="text-lg text-gray-800">
            🏡 Fast. Localized. Compliant. Start generating listings in seconds.
          </p>
        </div>
      </section>

      {/* Core Differentiators */}
      <section className="bg-card py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10 text-[#0A0A0A]">
            Features Built for the Indian Agent
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Localized Voice",
                text: "Hinglish, Marathi, Professional tone that resonates.",
              },
              {
                title: "Compliance First",
                text: "RERA Number & Possession Date for instant trust.",
              },
              {
                title: "Frictionless Workflow",
                text: "One text box. All outputs auto-generated.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow border-black">
                <CheckCircle className="mx-auto text-accent w-10 h-10 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-8 text-[#0A0A0A]">
          Built by PropTech Experts, Trusted by Agents.
        </h2>
        <blockquote className="italic text-lg max-w-2xl mx-auto text-gray-800">
          “I cut my listing time by 70%. The Hinglish option is perfect for the
          Mumbai market.”
        </blockquote>
        <p className="mt-4 font-semibold text-gray-600">
          — Agent Name, Navi Mumbai
        </p>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0A0A0A] text-white text-center py-20">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Save Time and Close Deals Faster?
        </h2>
        <p className="text-lg mb-8">
          Free forever plan includes 5 generations daily. Upgrade to Pro for
          unlimited usage and agency features.
        </p>
        <Link
          href="/pricing"
          className="bg-accent text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
        >
          Unlock Unlimited Generations
        </Link>
      </section>
    </main>
  );
}
