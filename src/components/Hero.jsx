import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  Zap,
  Brain,
  Share2,
  Shield,
  FileText,
  Layout,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function Hero() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none z-10"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000 mix-blend-screen" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 hover:bg-white/10 transition-colors cursor-default">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">AI-Powered Mind Mapping</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
            Transform Chaos into <br />
            <span className="text-blue-400">Crystal Clear Clarity</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
            Upload any document and watch as our advanced AI instantly constructs beautiful, interactive mind maps. Understand complex topics in seconds, not hours.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {isSignedIn ? (
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                onClick={() => navigate("/dashboard")}
              >
                Launch Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base bg-white text-black hover:bg-gray-100 rounded-full shadow-lg shadow-white/10 transition-all hover:scale-105"
                >
                  Get Started Free
                </Button>
              </SignInButton>
            )}

          </motion.div>
        </motion.div>

        {/* Visual Demo Placeholder - Modern Animated Version */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto mt-20 mb-32"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10 group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
            <div className="aspect-video bg-[#0a0a0a]/50 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">

              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

              {/* Central Animation Container */}
              <div className="relative w-full h-full flex items-center justify-center">

                {/* Connecting Lines SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {[...Array(6)].map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    return (
                      <motion.line
                        key={i}
                        x1="50%" y1="50%"
                        x2={`${50 + Math.cos(angle) * 20}%`}
                        y2={`${50 + Math.sin(angle) * 35}%`}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
                      />
                    );
                  })}
                </svg>

                {/* Central Node */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-20 w-24 h-24 bg-[#0a0a0a] border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)]"
                >
                  <FileText className="w-10 h-10 text-blue-400" />
                  {/* Scanning Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent"
                    animate={{ top: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>

                {/* Orbiting Nodes */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const x = Math.cos(angle) * 180;
                  const y = Math.sin(angle) * 120;

                  return (
                    <motion.div
                      key={i}
                      className="absolute z-10"
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: x,
                        y: y,
                        opacity: 1,
                        scale: 1
                      }}
                      transition={{
                        delay: 1 + i * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md group-hover:border-white/20 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${['bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400', 'bg-pink-400'][i]} shadow-[0_0_10px_currentColor]`} />
                      </div>
                    </motion.div>
                  );
                })}

              </div>

              {/* Browser Header */}
              <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center px-6 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-500 font-mono flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  intellimap.ai/demo
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Features Grid - Bento Style */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to visualize ideas</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Powerful features designed to transform your document workflow into a visual experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Feature */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-2 rounded-3xl p-8 bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/30 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Instant Visualization</h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  Transform complex PDF, Word, or PowerPoint documents into clear, structured mind maps in seconds. Our AI understands context and hierarchy.
                </p>
              </div>
            </motion.div>

            {/* Small Feature 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl p-8 bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Summaries</h3>
              <p className="text-gray-400">Get concise, AI-generated summaries alongside your visual maps.</p>
            </motion.div>

            {/* Small Feature 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl p-8 bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group hover:border-green-500/50 hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Share2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Easy Export</h3>
              <p className="text-gray-400">Download your mind maps as high-quality images for presentations.</p>
            </motion.div>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mt-32">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">From File to Insight in 3 Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            {[
              { icon: FileText, title: "Upload", desc: "Drag & drop your PDF, DOCX, or PPTX file." },
              { icon: Brain, title: "Analyze", desc: "AI extracts key concepts and relationships." },
              { icon: CheckCircle, title: "Explore", desc: "Interact with your new mind map instantly." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative flex flex-col items-center text-center z-10"
              >
                <div className="w-24 h-24 rounded-full bg-[#0a0a0a] border-4 border-blue-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)] group hover:border-blue-500/50 transition-colors duration-300">
                  <step.icon className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 relative rounded-3xl overflow-hidden bg-blue-600 text-center px-6 py-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400 rounded-full blur-[100px] opacity-50" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400 rounded-full blur-[100px] opacity-50" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to map your mind?</h2>
            <p className="text-blue-100 text-lg mb-10">Join thousands of students, researchers, and professionals who are saving hours every week.</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isSignedIn ? (
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100 rounded-full font-bold shadow-xl hover:scale-105 transition"
                  >
                    Get Started for Free
                  </Button>
                </SignInButton>
              )}
            </div>
            <p className="mt-6 text-sm text-blue-200">No credit card required • Free tier available</p>
          </div>
        </div>

      </div>
    </div>
  );
}
