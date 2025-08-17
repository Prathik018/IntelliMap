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

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in"); // Clerk sign-in page
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Wait until user info is loaded
  if (!isLoaded || !isSignedIn) return null; // or a loading spinner

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-6">Dashboard</h2>
      <FileUploader setSummary={setSummary} setMindmapData={setMindmapData} />
      {summary && <SummaryView summary={summary} />}
      {mindmapData && <MindMap data={mindmapData} />}
    </section>
  );
}
