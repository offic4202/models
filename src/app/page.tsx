"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Model {
  id: number;
  stageName: string;
  bio: string;
  avatar: string;
  category: string;
  location: string;
}

const defaultModels = [
  { id: 1, stageName: "Amara", category: "Fashion", location: "Lagos, Nigeria", bio: "International fashion model with runway experience", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop" },
  { id: 2, stageName: "Zuri", category: "Commercial", location: "Nairobi, Kenya", bio: "Award-winning commercial model", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop" },
  { id: 3, stageName: "Chiamaka", category: "Runway", location: "Accra, Ghana", bio: "Elite runway model for top brands", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop" },
  { id: 4, stageName: "Ayodele", category: "Print", location: "Johannesburg, SA", bio: "Print and editorial specialist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop" },
  { id: 5, stageName: "Nia", category: "Fashion", location: "Lagos, Nigeria", bio: "Rising fashion icon", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop" },
  { id: 6, stageName: "Adaeze", category: "Commercial", location: "Abuja, Nigeria", bio: "Brand ambassador & commercial star", avatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop" },
  { id: 7, stageName: "Kemi", category: "Runway", location: "Dakar, Senegal", bio: "International runway model", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" },
  { id: 8, stageName: "Imani", category: "Print", location: "Nairobi, Kenya", bio: "Editorial & print model", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop" },
];

export default function Home() {
  const [models, setModels] = useState<Model[]>(defaultModels);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  async function fetchModels() {
    try {
      const res = await fetch("/api/models");
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setModels(data.models.map((m: any) => ({
            ...m,
            avatar: m.avatar || defaultModels[(m.id - 1) % defaultModels.length].avatar,
            category: m.category || defaultModels[(m.id - 1) % defaultModels.length].category,
            location: m.location || defaultModels[(m.id - 1) % defaultModels.length].location,
          })));
        }
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white tracking-wider">
                STREAMRAY
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link href="#models" className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-widest">
                Models
              </Link>
              <Link href="/privacy" className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-widest">
                Privacy
              </Link>
              <Link href="/login" className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-widest">
                Login
              </Link>
              <Link href="/register" className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors">
                Register
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1920&h=1080&fit=crop"
            alt="African Models"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4">
          <h2 className="text-white text-sm uppercase tracking-[0.3em] mb-4">
            Premier African Talent
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mb-6">
            MODELS
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Representing Africa&apos;s finest modeling talent in fashion, commercial, and entertainment industries worldwide.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="#models"
              className="inline-block bg-white text-black px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              View Roster
            </Link>
            <Link
              href="/register"
              className="inline-block border border-white text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              Join Us
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Models Grid Section */}
      <section id="models" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-white text-sm uppercase tracking-[0.3em] mb-4">
              Our Talent
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white tracking-wider">
              MODEL ROSTER
            </h3>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Discover Africa&apos;s most promising modeling talent
            </p>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-zinc-900 animate-pulse rounded-lg" />
              ))
            ) : (
              models.map((model) => (
                <Link
                  key={model.id}
                  href={`/model/${model.id}`}
                  className="group relative aspect-[2/3] overflow-hidden bg-zinc-900 cursor-pointer"
                >
                  {/* Model Image */}
                  <Image
                    src={model.avatar || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop"}
                    alt={model.stageName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Model Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                      {model.category}
                    </p>
                    <h4 className="text-white text-2xl font-bold tracking-wide">
                      {model.stageName}
                    </h4>
                    {model.location && (
                      <p className="text-white/60 text-sm mt-1">{model.location}</p>
                    )}
                    {model.bio && (
                      <p className="text-white/70 text-xs mt-2 line-clamp-2">{model.bio}</p>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white text-black px-6 py-2 text-sm uppercase tracking-widest">
                      View Profile
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="border border-white text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-white text-sm uppercase tracking-[0.3em] mb-4">Why Join</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Why Choose StreamRay</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h4 className="text-xl font-bold text-white mb-2">African Focus</h4>
              <p className="text-gray-400">We specialize in promoting African talent to the world</p>
            </div>
            <div className="bg-black p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-bold text-white mb-2">Earn Revenue</h4>
              <p className="text-gray-400">Keep more of what you earn with our fair split</p>
            </div>
            <div className="bg-black p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-xl font-bold text-white mb-2">Privacy First</h4>
              <p className="text-gray-400">Your content is secure and under your control</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-white/70 mb-8">Join Africa&apos;s fastest-growing modeling platform</p>
          <Link
            href="/register"
            className="inline-block bg-white text-black px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">200+</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">Models</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">15+</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">African Nations</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">500+</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">Campaigns</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">98%</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wider mb-4">
                STREAMRAY
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Africa&apos;s premier modeling agency representing exceptional talent for fashion, commercial, and entertainment projects worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-sm uppercase tracking-widest mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#models" className="text-white/60 hover:text-white transition-colors text-sm">
                    Models
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-white/60 hover:text-white transition-colors text-sm">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-white/60 hover:text-white transition-colors text-sm">
                    Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white text-sm uppercase tracking-widest mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Lagos, Nigeria</li>
                <li>info@streamray.com</li>
                <li>+234 800 STREAMRAY</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} StreamRay Models. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-white/40 hover:text-white transition-colors text-xs">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
