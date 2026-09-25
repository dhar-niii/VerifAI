import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import {
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  Compass,
  ArrowRight,
  Star,
  Users,
  CheckCircle,
  Mountain,
  Palmtree,
  Ship,
} from "lucide-react";

const features = [
  { icon: MapPin, title: "Multi-City Planning", desc: "Create detailed itineraries across multiple destinations with ease." },
  { icon: Calendar, title: "Timeline View", desc: "See your trip unfold day by day with our visual calendar." },
  { icon: DollarSign, title: "Budget Tracking", desc: "Track expenses by category and stay within your budget." },
  { icon: Compass, title: "Activity Discovery", desc: "Find and add curated activities for every destination." },
  { icon: Globe, title: "Share Itineraries", desc: "Share your trip plans publicly or keep them private." },
  { icon: Users, title: "Travel Community", desc: "Explore popular destinations loved by travelers worldwide." },
];

const destinations = [
  { name: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600", rating: 4.9 },
  { name: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600", rating: 4.8 },
  { name: "New York", country: "USA", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600", rating: 4.7 },
  { name: "Barcelona", country: "Spain", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600", rating: 4.8 },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent/60 blur-3xl" />
        </div>
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">GlobeTrotter</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/25"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-28 lg:pt-24 lg:pb-40">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
                <Star className="h-4 w-4 text-accent" fill="currentColor" />
                <span className="text-white/90 text-sm font-medium">Built for travel enthusiasts</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Plan Your Perfect{" "}
                <span className="text-accent">Adventure</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-white/70 max-w-xl leading-relaxed">
                Create, organize, and visualize multi-city travel itineraries.
                Budget smarter, explore more, and share your journeys with the world.
              </p>
            </motion.div>
            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-base shadow-xl shadow-accent/30"
                onClick={() => navigate("/auth")}
              >
                Start Planning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
                onClick={() => {
                  const el = document.getElementById("features");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See Features
              </Button>
            </motion.div>
            <motion.div
              className="mt-12 flex items-center gap-8 text-white/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Multi-city itineraries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Budget tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Share trips</span>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="oklch(0.985 0.002 260)" />
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Everything You Need to <span className="text-accent">Explore</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              From planning to sharing, GlobeTrotter gives you all the tools to create unforgettable trips.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <f.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Popular <span className="text-accent">Destinations</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Explore cities loved by travelers around the globe.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer h-72"
                onClick={() => navigate("/auth")}
              >
                <img
                  src={d.img}
                  alt={d.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-3.5 w-3.5 text-accent" fill="currentColor" />
                    <span className="text-white text-xs font-medium">{d.rating}</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">{d.name}</h3>
                  <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {d.country}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="p-10 lg:p-16 rounded-3xl bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent blur-3xl" />
            </div>
            <div className="relative z-10">
              <Globe className="h-12 w-12 text-accent mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                Join GlobeTrotter and turn your travel dreams into planned itineraries.
              </p>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-semibold px-10 py-6 text-base shadow-xl shadow-accent/30"
                onClick={() => navigate("/auth")}
              >
                Start Planning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-accent" />
            <span className="font-semibold text-sm">GlobeTrotter</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Built for Hackathon 2025. Travel planning made simple.
          </p>
        </div>
      </footer>
    </div>
  );
}
