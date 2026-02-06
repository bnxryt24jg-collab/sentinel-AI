import React, { useState, useRef, useEffect } from 'react';
import { AppState, Language } from '../types';
import { translations } from '../i18n';

interface ScannerDashboardProps {
  onScan: (text: string, files: File[]) => void;
  appState: AppState;
  lang: Language;
  inputText: string;
  onInputChange: (text: string) => void;
}

export const ScannerDashboard: React.FC<ScannerDashboardProps> = ({ 
  onScan, 
  appState, 
  lang,
  inputText,
  onInputChange
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[lang].scanner;
  const tCommon = translations[lang].common;

  const isMaskedExample = inputText.includes('[NAME_REDACTED]') || inputText.includes('[EMAIL_REDACTED]');

  // Cleanup preview URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setValidationError(null);
    const newFiles: File[] = [];
    const newUrls: string[] = [];
    let hasLargeFile = false;
    
    // Check total files limit (Max 4)
    if (files.length + selectedFiles.length > 4) {
        setValidationError(lang === 'zh' ? "最多支持 4 张图片。" : "Maximum 4 images allowed.");
        return;
    }

    Array.from(selectedFiles).forEach(file => {
      // Allow up to 5MB because we compress on the client side now
      if (file.size > 5 * 1024 * 1024) {
        hasLargeFile = true;
        return;
      }
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        newUrls.push(URL.createObjectURL(file));
      }
    });

    if (hasLargeFile) {
      setValidationError(lang === 'zh' ? "部分图片过大 (>5MB) 已被跳过。" : "Some images were too large (>5MB) and skipped.");
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeFile = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    
    // Revoke the specific URL being removed
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFileSelection(e.target.files);
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    if (e.target.value.trim()) {
        setValidationError(null);
    }
  };

  const triggerScan = () => {
    if (!inputText.trim() && files.length === 0) {
        setValidationError(t.validation_error);
        return;
    }
    setValidationError(null);
    onScan(inputText, files);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900/50 border border-slate-700 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in" id="scanner-dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-cyan-400">❖</span> {t.title}
        </h2>
        <p className="text-slate-400 text-sm">
          {t.subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {isMaskedExample && (
            <div className="flex items-center gap-2 text-xs bg-indigo-900/30 text-indigo-300 px-3 py-2 rounded-lg border border-indigo-500/30 animate-fade-in">
                 <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                 </svg>
                 {t.masked_notice}
            </div>
        )}
        
        <textarea
          className={`w-full h-40 bg-slate-800 border rounded-lg p-4 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-sm resize-none ${validationError && !inputText && files.length === 0 ? 'border-red-500/50' : 'border-slate-700'}`}
          placeholder={t.placeholder}
          value={inputText}
          onChange={handleTextChange}
          disabled={appState === 'SCANNING'}
        />

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all min-h-[160px] ${
            validationError && !inputText && files.length === 0 ? 'border-red-500/50 bg-red-900/10' :
            dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/50'
          } ${appState === 'SCANNING' ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleChange}
          />
          
          {files.length > 0 ? (
            <div className="w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full animate-fade-in">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-600 group shadow-lg">
                            <img src={previewUrls[index]} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                                <span className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate max-w-full">{file.name}</span>
                                <span className="text-[10px] text-cyan-300">{(file.size / 1024).toFixed(0)} KB</span>
                            </div>
                            <button 
                                onClick={(e) => removeFile(e, index)}
                                className="absolute top-1 right-1 p-1 bg-slate-900/80 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800 border border-transparent hover:border-red-500/30 transition-all"
                                title="Remove image"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    
                    {/* Add Button Tile - Only show if less than 4 files */}
                    {files.length < 4 && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square bg-slate-800/30 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors group"
                        >
                             <svg className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                             </svg>
                             <span className="text-xs text-slate-500 group-hover:text-cyan-400 mt-2 font-medium">Add Image</span>
                        </div>
                    )}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-slate-500 text-xs">{t.drag_drop}</p>
                </div>
            </div>
          ) : (
            <div 
                className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-8"
                onClick={() => fileInputRef.current?.click()}
            >
              <svg className={`w-10 h-10 mb-3 transition-colors ${validationError ? 'text-red-400' : 'text-slate-500 hover:text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className={`text-sm font-medium ${validationError ? 'text-red-400' : 'text-slate-300'}`}>{t.drag_drop}</p>
              <p className="text-slate-500 text-xs mt-1">{t.drag_drop_sub}</p>
            </div>
          )}
        </div>

        {validationError && (
             <div className="text-red-400 text-sm flex items-center gap-2 bg-red-900/20 p-3 rounded-lg border border-red-500/20 animate-fade-in">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {validationError}
             </div>
        )}

        <button
          onClick={triggerScan}
          disabled={appState === 'SCANNING'}
          className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all ${
            appState === 'SCANNING'
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/50'
          }`}
        >
          {appState === 'SCANNING' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.button_loading}
            </span>
          ) : (
            t.button_init
          )}
        </button>
      </div>
    </div>
  );
};