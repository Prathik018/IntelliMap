import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-gray-900 max-w-3xl"
      >
        Transform Your Documents into{" "}
        <span className="text-blue-600">Mind Maps</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-lg text-gray-600 max-w-xl"
      >
        Upload PDFs, Word Docs, or PPTs and instantly generate visual mind maps
        or summaries powered by AI.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex gap-4"
      >
        <Button size="lg" onClick={() => navigate("/dashboard")}>
          Get Started
        </Button>
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </motion.div>
    </section>
  );
}
