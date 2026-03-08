import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 text-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-mono mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Development Studio
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          Code at the
          <br />
          <span className="text-gradient-primary glow-text">speed of thought</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The AI studio that understands your codebase, writes production-ready code, 
          and ships features in minutes — not hours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-base glow-primary hover:opacity-90 transition-all"
          >
            Start Building Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 border border-border hover:border-primary/30 px-8 py-3.5 rounded-xl font-medium text-base text-muted-foreground hover:text-foreground transition-all"
          >
            Watch Demo
          </a>
        </motion.div>

        {/* Code preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-primary/30" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">app.tsx</span>
            </div>
            <div className="p-6 font-mono text-sm text-left leading-relaxed">
              <div className="text-muted-foreground">
                <span className="text-accent">// ✨ vibecode just wrote this</span>
              </div>
              <div className="mt-2">
                <span className="text-primary">export</span>{" "}
                <span className="text-accent">const</span>{" "}
                <span className="text-foreground">Dashboard</span>{" "}
                <span className="text-muted-foreground">= () =&gt; {"{"}</span>
              </div>
              <div className="ml-4 text-muted-foreground">
                <span className="text-primary">const</span>{" "}
                <span className="text-foreground">data</span>{" "}
                <span className="text-muted-foreground">= </span>
                <span className="text-primary">useQuery</span>
                <span className="text-muted-foreground">(</span>
                <span className="text-accent">'analytics'</span>
                <span className="text-muted-foreground">);</span>
              </div>
              <div className="ml-4 text-muted-foreground">
                <span className="text-primary">return</span>{" "}
                <span className="text-muted-foreground">&lt;</span>
                <span className="text-foreground">Chart</span>{" "}
                <span className="text-primary">data</span>
                <span className="text-muted-foreground">={"{"}</span>
                <span className="text-foreground">data</span>
                <span className="text-muted-foreground">{"}"} /&gt;;</span>
              </div>
              <div className="text-muted-foreground">{"};"}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
