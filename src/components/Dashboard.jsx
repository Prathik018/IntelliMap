import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  ArrowLeft,
  Bookmark,
  Check,
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import {
  getHistory,
  saveMapToHistory,
  deleteMapFromHistory,
} from '../lib/storage';

function MappingWorkspace({
  file,
  mindmapData,
  onNodeClick,
  handleDownload,
  handleRegenerate,
  handleSave,
  handleBack,
  isProcessing,
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() => !isSmallScreen);
  const [isSaved, setIsSaved] = useState(false);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleScreenChange = (event) => {
      setIsSmallScreen(event.matches);
    };

    setIsSmallScreen(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleScreenChange);
    } else {
      mediaQuery.addListener(handleScreenChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleScreenChange);
      } else {
        mediaQuery.removeListener(handleScreenChange);
      }
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(!isSmallScreen);
  }, [mindmapData, isSmallScreen]);

  const handleLocalNodeClick = (node) => {
    setSelectedNode(node);
    if (isSmallScreen) {
      setSidebarOpen(true);
    }
    if (onNodeClick) onNodeClick(node);
  };

  const onSaveClick = async () => {
    const success = await handleSave();
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <motion.div
      key="viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <div className="h-16 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-xl hover:bg-gray-100 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-gray-100" />
          <div className="flex flex-col min-w-0">
            <h2 className="font-bold text-sm text-gray-900 truncate pr-2">
              {file?.name || 'Untitled Document'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Regenerate Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (file instanceof File) {
                handleRegenerate(file);
              } else {
                handleRegenerate(null);
              }
            }}
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
            onClick={onSaveClick}
            disabled={isSaved}
            className={`rounded-lg h-9 md:h-10 px-2 md:px-4 text-[10px] md:text-xs font-bold transition-all duration-300 ${
              isSaved
                ? 'bg-green-50 border-green-200 text-green-600'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {isSaved ? (
              <Check className="w-3.5 h-3.5 md:mr-2" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 md:mr-2" />
            )}
            <span className="hidden sm:inline">
              {isSaved ? 'Saved to Library' : 'Save Map'}
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
  const [summaryData, setSummaryData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
    if (isLoaded && isSignedIn && user?.id) {
      setHistory(getHistory(user.id));
    }
  }, [isSignedIn, isLoaded, navigate, user?.id]);

  const handleProcess = async (selectedFile, options = {}) => {
    if (!selectedFile) {
      setMindmapData(null);
      setSummaryData(null);
      setShowUploader(true);
      return;
    }
    setIsProcessing(true);
    setFile(selectedFile);
    try {
      const result = await processFile(selectedFile, options);
      setMindmapData(result.mindmap);
      setSummaryData(result.summary);
      setShowUploader(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = async (selectedFile) => {
    if (!selectedFile) return;
    await handleProcess(selectedFile, { forceRefresh: true });
  };

  const handleSave = async () => {
    if (user?.id && mindmapData && file) {
      const isAlreadyInHistory = history.some(
        (item) =>
          item.fileName === file.name &&
          JSON.stringify(item.mindmap) === JSON.stringify(mindmapData)
      );

      if (isAlreadyInHistory) {
        return true; // Already saved
      }

      const newEntry = saveMapToHistory(user.id, {
        fileName: file.name,
        mindmap: mindmapData,
        summary: summaryData,
      });
      setHistory((prev) => [newEntry, ...prev]);
      return true;
    }
    return false;
  };

  const handleViewHistoryItem = (item) => {
    setFile({ name: item.fileName });
    setMindmapData(item.mindmap);
    setSummaryData(item.summary);
    setShowUploader(false);
  };

  const handleDeleteHistoryItem = (id) => {
    if (user?.id && confirm('Are you sure you want to delete this map?')) {
      const updated = deleteMapFromHistory(user.id, id);
      setHistory(updated);
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

  const handleDownloadHistoryItem = async (e, item) => {
    e.stopPropagation();
    handleViewHistoryItem(item);
    setTimeout(async () => {
      await handleDownload();
    }, 800);
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
          {!mindmapData && !showUploader ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col p-8 md:p-16 max-w-7xl mx-auto w-full overflow-y-auto"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0 mb-8 sm:mb-16 px-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                    Welcome back, {user?.firstName}
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Your generated mind maps and visualizations.
                  </p>
                </div>
                <Button
                  onClick={() => setShowUploader(true)}
                  className="rounded-full bg-black text-white px-8 h-12 hover:bg-gray-800 transition-all font-medium whitespace-nowrap"
                >
                  <Plus className="w-5 h-5 mr-2" /> New Mapping
                </Button>
              </div>

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[40px] p-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No maps found</h3>
                  <p className="text-gray-400 mb-8 max-w-sm">
                    Generate your first mind map by clicking the button above to
                    upload a document.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-12 pl-0 sm:pl-12 px-4 sm:px-0">
                  {history.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleViewHistoryItem(item)}
                      className="cursor-pointer bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative group hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold truncate pr-16 block">
                          {item.fileName}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex h-5 items-center justify-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                            Summary
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistoryItem(item.id);
                            }}
                            className="h-6 w-6 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-2">
                        {item.summary ||
                          'This document has been mapped successfully. Click to explore the hierarchical node structure and detailed contextual insights.'}
                      </p>

                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-9 rounded-full bg-black text-white text-[10px] font-bold hover:bg-gray-800 transition-all shadow-sm"
                        >
                          View Mind map
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDownloadHistoryItem(e, item)}
                          className="h-9 px-3 rounded-full border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : showUploader ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col items-center justify-start mt-2 md:mt-0 md:justify-center p-6"
            >
              <div className="max-w-4xl w-full text-center relative">
                <div className="flex justify-start mb-6 sm:mb-0 sm:absolute sm:-top-20 sm:-left-20">
                  <Button
                    variant="ghost"
                    onClick={() => setShowUploader(false)}
                    className="-ml-4 sm:ml-0 rounded-xl hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                  </Button>
                </div>
                <motion.h1
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 tracking-tight"
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
                handleRegenerate={handleRegenerate}
                handleSave={handleSave}
                handleBack={() => {
                  setMindmapData(null);
                  setSummaryData(null);
                }}
                isProcessing={isProcessing}
              />
            </ReactFlowProvider>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
