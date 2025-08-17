import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser, SignInButton } from "@clerk/clerk-react";

export default function Hero() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  return (
    <section className="flex flex-col items-center justify-center text-center min-h-screen py-16 px-4 sm:py-20 sm:px-6">
      {/* Content */}
      <div
        className="flex flex-col items-center text-center mt-10"
        data-aos="fade-right"
        data-aos-duration="2000"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white max-w-3xl">
          Transform Your Documents into Mind Maps
        </h1>

        <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl">
          Upload PDF, Word, or PowerPoint files to instantly receive
          AI-generated visual mind maps or concise summaries, streamlining
          document review and comprehension.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {isSignedIn ? (
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
              onClick={() => navigate("/dashboard")}
            >
              Get Started
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
              >
                Get Started
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
      <br />




      {/* Why Use IntelliMap Section */}
      <div
        className="relative z-10 mt-24 w-full max-w-6xl px-6 py-12 rounded-2xl backdrop-blur-lg bg-white/10 text-white"
        data-aos="fade-up"
        data-aos-duration="2500"

      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">
          Why Use IntelliMap Mapping Tool
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-white/10 backdrop-blur- border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Quick Visualization</h3>
            <p>
              Convert complex documents into clear, structured mind maps in
              seconds, saving time and effort.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/10 backdrop-blur- border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Better Comprehension</h3>
            <p>
              Understand relationships between ideas at a glance, making it
              easier to grasp key points and concepts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/10 backdrop-blur- border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Concise Summaries</h3>
            <p>
              Get AI-generated summaries alongside visual maps to review large
              documents efficiently.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/10 backdrop-blur- border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Intuitive Interface</h3>
            <p>
              Easily navigate, explore, and interact with your mind maps with an
              interface designed for clarity.
            </p>
          </div>
        </div>
      </div>

      <br />





      {/* How It Works Section */}
      <div
        className="relative z-10 mt-24 w-full max-w-6xl px-6 py-12 rounded-2xl backdrop-blur-2xl border border-white/10 bg-white/10 text-white text-justify"
        data-aos="fade-up"
        data-aos-duration="2500"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
          How It Works
        </h2>
        <p className="mb-4">
          Simply upload your documentbe it a PDF, Word file, or PowerPoint
          presentation. Our AI analyzes the content, extracts key ideas, and
          generates a clear, structured visual mind map. This allows you to
          quickly understand the main points, see relationships between
          concepts, and review complex information efficiently.
        </p>
        <p className="mb-4">
          In addition to the mind map, the tool can provide a concise summary of
          your document, highlighting the most important details and insights.
          Whether you're studying, preparing for meetings, or reviewing lengthy
          reports, everything you need is summarized and visualized in one
          easy-to-use interface. No manual effort required just upload, let the AI do the work, and
          explore your content in a more intuitive way.
        </p>
        
      </div>

      <br />
      {/* Call-to-Action Section */}
      <div
        className="relative z-10 mt-24 w-full max-w-6xl px-6 py-16 rounded-2xl backdrop-blur-lg bg-white/10 text-white text-center flex flex-col items-center "
        data-aos="fade-up"
        data-aos-duration="2500"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Transform Your Documents?
        </h2>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl">
          Upload your PDFs, Word files, or PowerPoint presentations and get
          AI-generated mind maps and concise summaries instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {isSignedIn ? (
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
              onClick={() => navigate("/dashboard")}
            >
              Get Started
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 animate-bounce"
              >
                Get Started
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </section>
  );
}
