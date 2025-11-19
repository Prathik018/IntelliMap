import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import FileUploader from "@/components/FileUploader";
import MindmapTree from "@/components/MindMap";
import { processFile } from "../services/api";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, FileText } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [mindmapData, setMindmapData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNodeSummary, setSelectedNodeSummary] = useState(null);
  const mindmapRef = useRef(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isSignedIn, isLoaded, navigate]);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSelectedNodeSummary(null); // Reset summary on new process
    try {
      const result = await processFile(file);
      setSummary(result.summary);
      setMindmapData(result.mindmap);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSelectedNodeSummary(null); // Reset summary on refresh
    try {
      const result = await processFile(file);
      setSummary(result.summary);
      setMindmapData(result.mindmap);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const node = document.getElementById("mindmap-container");
    if (!node) return;

    try {
      const dataUrl = await htmlToImage.toPng(node, { backgroundColor: '#0a0a0a' });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "mindmap.png";
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to download mindmap");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section */}
        <div className="text-center space-y-4">
          <p className="text-gray-400 max-w-2xl mx-auto mt-10">
            Upload your documents to generate AI-powered mind maps and summaries.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Upload & Recent */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                New Project
              </h2>
              <FileUploader
                onFileSelect={setFile}
                selectedFile={file}
                isProcessing={isProcessing}
                onProcess={handleProcess}
              />
            </section>

          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 space-y-8">
            {mindmapData ? (
              <div className="space-y-8">
                {/* Mind Map Viewer */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-1 overflow-hidden backdrop-blur-sm relative group">
                  <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" onClick={handleRefresh} className="bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md">
                      <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                    <Button size="sm" onClick={handleDownload} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                      <Download className="w-4 h-4 mr-2" /> Export PNG
                    </Button>
                  </div>
                  <div id="mindmap-container" className="bg-[#0a0a0a] rounded-[20px]">
                    <MindmapTree
                      data={mindmapData}
                      onNodeClick={(summary) => setSelectedNodeSummary(summary)}
                    />
                  </div>
                </section>

                {/* Section Summary Card */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm min-h-[200px]">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {selectedNodeSummary ? "Section Summary" : "Select a Node"}
                  </h2>
                  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                    {selectedNodeSummary ? (
                      <p>{selectedNodeSummary}</p>
                    ) : (
                      <p className="text-gray-500 italic">
                        Click on any node in the mind map to view its detailed summary here.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No content generated yet</h3>
                <p className="text-gray-500 max-w-sm">
                  Upload a document on the left to see your mind map and summary appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
