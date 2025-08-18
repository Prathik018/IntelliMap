import { useState, useRef } from "react";
import { processFile } from "../services/api";
import MindmapTree from "./MindmapTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as htmlToImage from "html-to-image";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [mindmap, setMindmap] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mindmapRef = useRef(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const processAndSetMindmap = async () => {
    if (!file) return;
    return await processFile(file);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setIsGenerating(true);
    try {
      const result = await processAndSetMindmap();
      setMindmap(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = async () => {
    if (!mindmap || !file) return;
    setIsRefreshing(true);
    try {
      const result = await processAndSetMindmap();
      setMindmap(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async () => {
    if (!mindmapRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(mindmapRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "mindmap.png";
      link.click();
    } catch (err) {
      alert("Failed to download mindmap");
    }
  };

  return (
    <Card className="p-4 sm:p-6 md:p-8 max-w-full sm:max-w-2xl md:max-w-4xl mx-auto">
      <CardContent className="flex flex-col gap-4">
        <input type="file" onChange={handleFileChange} className="w-full" />

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Generate button */}
          <Button
            onClick={handleUpload}
            disabled={isGenerating || !file}
            className="flex-1"
          >
            {isGenerating ? "Processing..." : "Generate Mindmap"}
          </Button>

          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || !mindmap}
            variant="secondary"
            className="flex-1 bg-black text-white hover:bg-black/80"
          >
            {isRefreshing ? "Refreshing..." : "Refresh Mindmap"}
          </Button>
        </div>

        {mindmap && (
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Summary</h2>
              <p className="text-sm sm:text-base text-justify hyphens-auto">{mindmap.summary}</p>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Download button */}
                <Button size="sm" onClick={handleDownload}>
                  💾 Download Mindmap
                </Button>
              </div>

              <div
                className="overflow-x-auto border border-white/20 rounded-xl p-2 bg-white/10 backdrop-blur-md"
                ref={mindmapRef} // attach ref for download
              >
                <MindmapTree data={mindmap.mindmap} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
