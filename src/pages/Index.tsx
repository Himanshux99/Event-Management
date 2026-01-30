import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuBadge } from "@/components/ui/NeuBadge";
import { EventCard } from "@/components/events/EventCard";
import { mockEvents } from "@/data/mockEvents";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Event Creation",
    description: "Create events in minutes with our intuitive form. Set capacity, eligibility rules, and more.",
    color: "bg-primary",
  },
  {
    icon: QrCode,
    title: "QR-Based Entry",
    description: "Secure, unique QR passes for every registration. Fast check-ins with volunteer scanning.",
    color: "bg-secondary",
  },
  {
    icon: Users,
    title: "Smart Waitlist",
    description: "Auto-promote participants when spots open. No manual tracking needed.",
    color: "bg-accent",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Real-time attendance tracking, registration stats, and exportable reports.",
    color: "bg-success",
  },
];

const stats = [
  { value: "500+", label: "Events Hosted" },
  { value: "25K+", label: "Participants" },
  { value: "50+", label: "Colleges" },
  { value: "99%", label: "Check-in Success" },
];

export default function Index() {
  const featuredEvents = mockEvents.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NeuBadge variant="accent" size="lg" className="mb-6">
                <Sparkles className="w-4 h-4 mr-1" />
                Campus Event Platform
              </NeuBadge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Your Campus Events,{" "}
              <span className="text-primary">Simplified.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              From event creation to QR check-ins, manage your entire campus event
              lifecycle in one powerful platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/events">
                <NeuButton variant="primary" size="lg">
                  Explore Events
                  <ArrowRight className="w-5 h-5" />
                </NeuButton>
              </Link>
              <Link to="/register">
                <NeuButton variant="outline" size="lg">
                  Get Started Free
                </NeuButton>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 md:mt-24"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <NeuCard key={index} variant="static" className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </NeuCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <NeuBadge variant="primary" className="mb-4">
              <Zap className="w-4 h-4 mr-1" />
              Features
            </NeuBadge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools for organizers, seamless experience for participants.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <NeuCard className="h-full">
                  <div
                    className={`w-14 h-14 ${feature.color} border-[3px] border-foreground rounded-2xl shadow-neu-sm flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </NeuCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <NeuBadge variant="secondary" className="mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                Featured Events
              </NeuBadge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Upcoming Events
              </h2>
            </div>
            <Link to="/events">
              <NeuButton variant="outline">
                View All Events
                <ArrowRight className="w-4 h-4" />
              </NeuButton>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <NeuCard variant="static" className="bg-primary text-primary-foreground p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Campus Events?
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Join thousands of colleges using CampusHub to streamline their event management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <NeuButton variant="accent" size="lg">
                    Start For Free
                    <ArrowRight className="w-5 h-5" />
                  </NeuButton>
                </Link>
                <Link to="/events">
                  <NeuButton variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    Browse Events
                  </NeuButton>
                </Link>
              </div>
            </div>
          </NeuCard>
        </div>
      </section>
    </Layout>
  );
}
