import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";
import MindMap from "@/components/MindMap";
import SummaryView from "@/components/SummaryView";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [mindmapData, setMindmapData] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isSignedIn, isLoaded, navigate]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <section className="w-full flex justify-center items-start min-h-screen px-4 sm:px-6 lg:px-8 mt-32 mb-12">
      <div className="w-full max-w-5xl space-y-12 rounded-2xl backdrop-blur-2xl border border-white/10 bg-white/10 text-white p-6 sm:p-8 md:p-12">
        
        {/* Page Header */}
        <h2 className="text-3xl sm:text-4xl font-semibold text-center">
          Upload Your File Here
        </h2>

        {/* File Uploader */}
        <FileUploader
          setSummary={setSummary}
          setMindmapData={setMindmapData}
        />

        {/* Summary View */}
        {summary && (
          <div className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mt-24">
            <SummaryView summary={summary} />
          </div>
        )}

        {/* Mind Map */}
        {mindmapData && (
          <div className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mt-24 overflow-x-auto">
            <MindMap data={mindmapData} />
          </div>
        )}
      </div>
    </section>
  );
}
