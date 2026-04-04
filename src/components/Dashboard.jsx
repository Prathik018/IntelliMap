import { useUser, UserButton } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FileUploader from '@/components/FileUploader';
import MindmapTree from '@/components/MindMap';
import { processFile } from '../services/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  ChevronRight,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowProvider, useReactFlow } from 'reactflow';

function MappingWorkspace({
  file,
  mindmapData,
  onNodeClick,
  handleDownload,
  handleRegenerate,
  isProcessing,
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleLocalNodeClick = (node) => {
    setSelectedNode(node);
    if (onNodeClick) onNodeClick(node);
  };

  return (
    <motion.div
      key="viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <div className="h-16 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 shrink-0">
        <div className="flex flex-col min-w-0">
          <h2 className="font-bold text-sm text-gray-900 truncate pr-2">
            {file?.name || 'Untitled Document'}
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium whitespace-nowrap">
            <Clock className="w-3 h-3" /> Mapped just now
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRegenerate(file)}
            disabled={isProcessing}
            className="rounded-lg h-9 md:h-10 px-2 md:px-4 text-[10px] md:text-xs font-bold border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw
              className={`w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-2 ${isProcessing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">
              {isProcessing ? 'Regenerating...' : 'Regenerate'}
            </span>
            <span className="sm:hidden">
              {isProcessing ? 'Wait...' : 'Again'}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="rounded-lg h-9 md:h-10 px-2 md:px-4 text-[10px] md:text-xs font-bold border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 md:mr-2" />{' '}
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        <div className="flex-1 bg-white relative min-h-0">
          <div id="mindmap-container" className="h-full w-full relative">
            <MindmapTree
              data={mindmapData}
              onNodeClick={handleLocalNodeClick}
            />
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col bg-white border border-gray-100/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1 md:p-1.5 gap-1 md:gap-1.5 z-50 backdrop-blur-sm scale-90 md:scale-100">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-all"
                onClick={() => zoomIn()}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Separator className="bg-gray-100/50 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl hover:bg-gray-50 text-[9px] md:text-[10px] font-black tracking-tighter text-gray-400 hover:text-black"
                onClick={() => fitView({ duration: 400, padding: 0.2 })}
              >
                FIT
              </Button>
              <Separator className="bg-gray-100/50 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-all"
                onClick={() => zoomOut()}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`bg-white border-l border-gray-50 flex flex-col transition-all duration-300 absolute md:relative inset-0 md:inset-auto z-[60] md:z-10 ${sidebarOpen ? 'translate-x-0 opacity-100 w-full md:w-[380px]' : 'translate-x-full opacity-0 w-0 pointer-events-none'}`}
        >
          <div className="w-full md:w-[380px] flex flex-col h-full bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
              <span className="text-[11px] font-bold tracking-widest text-gray-400/80 uppercase">
                Information & Insights
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-20">
              <motion.div
                key={selectedNode?.label || 'empty'}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase mb-4 block">
                  ACTIVE NODE
                </span>
                <h3 className="text-3xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                  {selectedNode?.label || 'Select a specific node'}
                </h3>
              </motion.div>

              <div className="space-y-10">
                <motion.div
                  key={`${selectedNode?.label || 'empty'}-summary`}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase mb-4 block">
                    KEY TAKEAWAYS
                  </span>
                  <div className="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100/50 shadow-inner group transition-colors hover:bg-gray-50/80">
                    <p className="text-base text-gray-600 leading-[1.7] font-medium tracking-tight">
                      {selectedNode?.summary ||
                        'Drill down into specific document segments by interacting with the mind map nodes. AI-generated summaries and contextual highlights will appear here.'}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pt-8 border-t border-gray-50"
                >
                  <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase mb-4 block">
                    CONTEXT SOURCE
                  </span>
                  <div className="flex items-center gap-5 p-5 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-[13px] text-gray-900 font-bold truncate">
                        Source Document
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {file?.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {!sidebarOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Button
              className="absolute top-6 right-6 h-12 w-12 rounded-full shadow-xl bg-black text-white hover:bg-gray-900 active:scale-95 transition-all z-50"
              onClick={() => setSidebarOpen(true)}
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { isSignedIn, isLoaded, user } = useUser();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [mindmapData, setMindmapData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isSignedIn, isLoaded, navigate]);

  const handleProcess = async (selectedFile) => {
    setIsProcessing(true);
    setFile(selectedFile);
    try {
      const result = await processFile(selectedFile);
      setMindmapData(result.mindmap);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const node = document.getElementById('mindmap-container');
    if (!node) return;
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${file?.name || 'mindmap'}.png`;
      link.click();
    } catch (err) {
      alert('Failed to download mindmap');
    }
  };

  if (!isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen w-full bg-[#fdfdfd] text-black">
      <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {!mindmapData ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col items-center justify-center p-6"
            >
              <div className="max-w-4xl w-full text-center">
                <motion.h1
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl font-bold mb-3 tracking-tight"
                >
                  New Mapping
                </motion.h1>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 mb-12"
                >
                  Upload your document to generate a structured mind map.
                </motion.p>

                <FileUploader
                  onFileSelect={handleProcess}
                  isProcessing={isProcessing}
                />

                <p className="mt-8 text-xs text-gray-400">
                  Maximum file size 100MB. Your data is processed securely.
                </p>
              </div>
            </motion.div>
          ) : (
            <ReactFlowProvider>
              <MappingWorkspace
                file={file}
                mindmapData={mindmapData}
                handleDownload={handleDownload}
                handleRegenerate={handleProcess}
                isProcessing={isProcessing}
              />
            </ReactFlowProvider>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
