import { motion } from "framer-motion";
import { Brain, Layers, Rocket, Shield, Terminal, Workflow } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Context-Aware AI",
    description: "Understands your entire codebase, not just the current file. Generates code that fits perfectly.",
  },
  {
    icon: Terminal,
    title: "Natural Language → Code",
    description: "Describe what you want in plain English. Get production-ready TypeScript instantly.",
  },
  {
    icon: Workflow,
    title: "Multi-File Editing",
    description: "Refactor across your entire project. Components, styles, tests — all updated simultaneously.",
  },
  {
    icon: Rocket,
    title: "Instant Deploy",
    description: "Ship to production with one click. Preview, test, and deploy without leaving your editor.",
  },
  {
    icon: Shield,
    title: "Type-Safe by Default",
    description: "Every generated line is fully typed. No more any. No more runtime surprises.",
  },
  {
    icon: Layers,
    title: "Built-in Backend",
    description: "Database, auth, and APIs included. Build full-stack apps without juggling services.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-gradient-primary">vibe</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A complete AI development environment designed for speed, quality, and flow state.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/20 hover:bg-card transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
