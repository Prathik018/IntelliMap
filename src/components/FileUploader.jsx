import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FileUploader({ onFileSelect, isProcessing }) {
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

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-[32px] md:rounded-[40px] border-gray-300 p-10 md:p-20 text-center transition-all duration-300 cursor-pointer group
          ${
            isDragging
              ? 'border-blue-200 bg-blue-50/50'
              : 'bg-white hover:border-gray-300 hover:bg-gray-50/10'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          accept=".pdf,.docx,.pptx"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
            <p className="font-bold text-gray-900">Processing document...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-105 transition-transform duration-300 shadow-sm">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Drop your file here
            </h3>
            <p className="text-sm text-gray-400 mb-10">
              or{' '}
              <span className="underline cursor-pointer hover:text-gray-600 transition-colors">
                browse files
              </span>
            </p>

            <div className="flex justify-center gap-3">
              {['PDF', 'DOCX', 'PPTX'].map((ext) => (
                <div
                  key={ext}
                  className="px-5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-400"
                >
                  {ext}
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
