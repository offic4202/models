import Image from "next/image";

export default function Home() {
  const models = [
    { id: 1, name: "Alexandra", category: "Fashion", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop" },
    { id: 2, name: "Victoria", category: "Commercial", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop" },
    { id: 3, name: "Sophia", category: "Runway", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop" },
    { id: 4, name: "Isabella", category: "Print", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop" },
    { id: 5, name: "Emma", category: "Fashion", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop" },
    { id: 6, name: "Olivia", category: "Commercial", image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop" },
    { id: 7, name: "Ava", category: "Runway", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" },
    { id: 8, name: "Mia", category: "Print", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop" },
  ];

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white tracking-wider">
                STREAMRAY
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-widest">
                Models
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-widest">
                About
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-widest">
                Clients
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-widest">
                Contact
              </a>
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
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1920&h=1080&fit=crop"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4">
          <h2 className="text-white text-sm uppercase tracking-[0.3em] mb-4">
            Professional Modeling Agency
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mb-6">
            MODELS
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Representing the world&apos;s most sought-after talent in fashion, commercial, and entertainment industries.
          </p>
          <a
            href="#models"
            className="inline-block bg-white text-black px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            View Roster
          </a>
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
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                className="group relative aspect-[2/3] overflow-hidden bg-zinc-900 cursor-pointer"
              >
                {/* Model Image */}
                <Image
                  src={model.image}
                  alt={model.name}
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
                    {model.name}
                  </h4>
                </div>

                {/* View Profile Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white text-black px-6 py-2 text-sm uppercase tracking-widest">
                    View Profile
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="border border-white text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">500+</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">Models</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">25+</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">1000+</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">Campaigns</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">50+</p>
              <p className="text-white/60 text-sm uppercase tracking-widest">Countries</p>
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
                A premier modeling agency representing exceptional talent for fashion, commercial, and entertainment projects worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-sm uppercase tracking-widest mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                    Models
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                    Clients
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white text-sm uppercase tracking-widest mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>123 Model Street</li>
                <li>New York, NY 10001</li>
                <li className="pt-2">
                  <a href="mailto:info@streamray.com" className="hover:text-white transition-colors">
                    info@streamray.com
                  </a>
                </li>
                <li>
                  <a href="tel:+12125551234" className="hover:text-white transition-colors">
                    +1 (212) 555-1234
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/40 text-xs">
              © 2024 StreamRay Models. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/40 hover:text-white transition-colors text-xs">
                Privacy Policy
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-xs">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
