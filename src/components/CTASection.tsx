import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Ready to <span className="text-gradient-primary">vibe</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
            Join thousands of developers shipping faster with AI. Free to start, no credit card required.
          </p>
          <a
            href="#"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold text-lg glow-primary hover:opacity-90 transition-all"
          >
            Start Building
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
