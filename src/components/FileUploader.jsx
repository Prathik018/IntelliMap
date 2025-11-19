import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X, FileText, FileType } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUploader({ onFileSelect, selectedFile, isProcessing, onProcess }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const clearFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer group
              ${isDragging
                ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt"
            />

            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Upload your document</h3>
            <p className="text-gray-400 mb-6">Drag & drop or click to browse</p>

            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 uppercase tracking-wider">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">PDF</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">DOCX</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">PPTX</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white truncate max-w-[180px] sm:max-w-[250px] md:max-w-[200px]" title={selectedFile.name}>
                    {selectedFile.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={onProcess}
                disabled={isProcessing}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Generate Mind Map"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
