import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppState, ScanResult, HardenedResult, AttackSimulation, Language, HistoryItem, User } from './types';
import { scanContent, remediatePrompt, verifyDefense } from './services/geminiService';
import { authService } from './services/authService';
import { ScannerDashboard } from './components/ScannerDashboard';
import { RiskReport } from './components/RiskReport';
import { RemediationSuite } from './components/RemediationSuite';
import { AvatarUpload } from './components/AvatarUpload';
import { ProfileModal } from './components/ProfileModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { RiskExampleGallery } from './components/RiskExampleGallery';
import { LoginScreen } from './components/LoginScreen';
import { translations } from './i18n';

// Helper to resize and compress images before sending to API
const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 1024; // Limit max dimension to 1024px

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality to reduce payload size
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App Logic State
  const [appState, setAppState] = useState<AppState>('IDLE');
  
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [remediationResult, setRemediationResult] = useState<HardenedResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<AttackSimulation | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Stored inputs
  const [promptInput, setPromptInput] = useState<string>('');
  const [rawImages, setRawImages] = useState<{ mimeType: string, data: string }[]>([]);

  // UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Check for existing session on mount
    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
        const userHistory = authService.getUserHistory(user.id);
        setHistory(userHistory);
    }
  }, []);

  const t = translations[currentUser?.lang || 'en'];

  // Handle Login
  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      const userHistory = authService.getUserHistory(user.id);
      setHistory(userHistory);
  };

  const handleLogout = () => {
      authService.logout();
      setCurrentUser(null);
      // Reset all state
      reset();
      setHistory([]);
  };

  const handleSaveProfile = (newName: string, newLang: Language, newAvatar: string | null, newSaveHistory: boolean) => {
    if (!currentUser) return;
    try {
        const updated = authService.updateProfile(currentUser.id, {
            displayName: newName,
            lang: newLang,
            avatar: newAvatar,
            saveHistory: newSaveHistory
        });
        setCurrentUser(updated);
        // If history was turned off, we don't necessarily delete existing history,
        // but new items won't be saved.
    } catch (e) {
      console.error("Failed to save profile", e);
      alert(t.common.storage_full);
    }
  };

  const handleClearHistory = () => {
    if (!currentUser) return;
    setHistory([]);
    authService.clearUserHistory(currentUser.id);
  };

  const handleDeleteHistoryItem = (itemId: string) => {
      if (!currentUser) return;
      const updated = authService.deleteHistoryItem(currentUser.id, itemId);
      setHistory(updated);
      
      // If current view is the deleted item, reset
      if (currentHistoryId === itemId) {
          reset();
      }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setPromptInput(item.rawText || ""); // Handle empty raw text for privacy items
    setScanResult(item.scanResult);
    setRemediationResult(item.remediationResult || null);
    setCurrentHistoryId(item.id);
    setVerificationResult(null); // Reset verification when loading history

    if (item.remediationResult) {
        setAppState('REMEDIATED');
    } else {
        setAppState('REPORT');
    }
  };

  const toggleLanguage = () => {
    if (!currentUser) return;
    const newLang = currentUser.lang === 'en' ? 'zh' : 'en';
    const updated = authService.updateProfile(currentUser.id, { lang: newLang });
    setCurrentUser(updated);
  };

  const handleScan = async (text: string, files: File[]) => {
    if (!currentUser) return;

    setAppState('SCANNING');
    setPromptInput(text);
    setCurrentHistoryId(null); // Reset current ID as this is a new scan
    
    const processedImages: { mimeType: string, data: string }[] = [];

    if (files && files.length > 0) {
        for (const file of files) {
             try {
                const base64Data = await resizeAndCompressImage(file);
                processedImages.push({ mimeType: 'image/jpeg', data: base64Data });
             } catch (e) {
                 console.error("Error processing file", file.name, e);
             }
        }
    }
    setRawImages(processedImages);

    try {
      const result = await scanContent(text, processedImages, currentUser.lang);
      setScanResult(result);
      
      // History Logic: Only save if user enabled it.
      if (currentUser.saveHistory) {
          const newId = Date.now().toString();
          const newItem: HistoryItem = {
              id: newId,
              timestamp: Date.now(),
              // Privacy Compliance: Never store raw text or images in the history object
              // structured results are in 'result' which is ScanResult
              rawText: "", 
              riskLevel: result.risk_level,
              scanResult: result
          };
          
          const updatedHistory = [newItem, ...history];
          setHistory(updatedHistory);
          authService.saveUserHistory(currentUser.id, updatedHistory);
          setCurrentHistoryId(newId);
      }

      setAppState('REPORT');
    } catch (error) {
      console.error(error);
      setAppState('IDLE');
      alert(t.common.scan_failed);
    }
  };

  const handleExampleSelect = (prompt: string) => {
      setPromptInput(prompt);
      
      const scannerElement = document.getElementById('scanner-dashboard');
      if (scannerElement) {
          scannerElement.scrollIntoView({ behavior: 'smooth' });
      }

      setTimeout(() => {
          handleScan(prompt, []);
      }, 300);
  };

  const handleRemediate = async () => {
    if (!scanResult || !promptInput || !currentUser) return;
    setAppState('REMEDIATING');
    
    try {
      const result = await remediatePrompt(promptInput, scanResult, currentUser.lang);
      setRemediationResult(result);
      
      // Update history if it exists (i.e., user has history enabled and this item is tracked)
      if (currentHistoryId && currentUser.saveHistory) {
          const updatedHistory = history.map(item => {
              if (item.id === currentHistoryId) {
                  return { ...item, remediationResult: result };
              }
              return item;
          });
          setHistory(updatedHistory);
          authService.saveUserHistory(currentUser.id, updatedHistory);
      }

      setAppState('REMEDIATED');
    } catch (error: any) {
      console.error(error);
      setAppState('REPORT');
      alert(error.message || t.common.scan_failed);
    }
  };

  const triggerVerify = async () => {
    if (!remediationResult) return;
    setIsVerifying(true);
    try {
        const result = await verifyDefense(remediationResult.hardenedPrompt);
        setVerificationResult(result);
    } catch (e) {
        console.error(e);
    }
    setIsVerifying(false);
  };

  const reset = () => {
    setAppState('IDLE');
    setScanResult(null);
    setRemediationResult(null);
    setVerificationResult(null);
    setPromptInput('');
    setRawImages([]);
    setCurrentHistoryId(null);
  };

  // --- Render Logic ---

  if (!currentUser) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Sentinel<span className="text-cyan-400">AI</span></span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
                
                {/* Language Switcher */}
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-cyan-500/50 text-xs font-mono transition-all group"
                    title={currentUser.lang === 'en' ? 'Switch to Chinese' : 'Switch to English'}
                >
                    <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="group-hover:text-white">{currentUser.lang === 'en' ? '中文' : 'EN'}</span>
                </button>
                
                {/* History Trigger - Only visible if saving history is enabled */}
                {currentUser.saveHistory && (
                    <span 
                        onClick={() => setIsHistoryOpen(true)}
                        className="hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-1 ml-2 animate-fade-in"
                    >
                        {t.nav.history}
                        {history.length > 0 && <span className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-300">{history.length}</span>}
                    </span>
                )}

                <div className="w-px h-5 bg-slate-800 my-auto"></div>
                
                {/* Greeting */}
                <span className="text-xs font-semibold text-slate-300 hidden lg:inline">
                   {t.common.hello}, {currentUser.displayName}
                </span>

                {/* Avatar / Profile Trigger */}
                <AvatarUpload 
                  avatar={currentUser.avatar} 
                  onClick={() => setIsProfileOpen(true)} 
                />

                {/* Logout */}
                <button 
                    onClick={handleLogout}
                    className="ml-2 text-slate-500 hover:text-red-400 transition-colors"
                    title={t.auth.logout}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
             </div>
          </div>
        </div>
      </nav>

      <main className="p-6 md:p-12">
        {/* State Management Views */}
        {appState === 'IDLE' && (
           <div className="animate-fade-in">
             <div className="text-center mb-12">
               <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                 {t.hero.title_start} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t.hero.title_highlight}</span>
               </h1>
               <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                 {t.hero.subtitle}
               </p>
             </div>
             
             {/* Risk Example Gallery */}
             <RiskExampleGallery onSelect={handleExampleSelect} lang={currentUser.lang} />

             <ScannerDashboard 
               onScan={handleScan} 
               appState={appState} 
               lang={currentUser.lang} 
               inputText={promptInput}
               onInputChange={setPromptInput}
             />
           </div>
        )}

        {appState === 'SCANNING' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <ScannerDashboard 
                onScan={() => {}} 
                appState={appState} 
                lang={currentUser.lang} 
                inputText={promptInput}
                onInputChange={() => {}} // Disable changes during scan
             />
          </div>
        )}

        {(appState === 'REPORT' || appState === 'REMEDIATING') && scanResult && (
           <RiskReport 
              result={scanResult} 
              onRemediate={handleRemediate} 
              isRemediating={appState === 'REMEDIATING'}
              lang={currentUser.lang}
           />
        )}

        {appState === 'REMEDIATED' && remediationResult && (
            <RemediationSuite 
              remediation={remediationResult} 
              onVerify={triggerVerify}
              verificationResult={verificationResult}
              isVerifying={isVerifying}
              lang={currentUser.lang}
              onReset={reset}
            />
        )}
      </main>

      {/* Drawers & Modals */}
      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        lang={currentUser.lang}
        currentAvatar={currentUser.avatar}
        currentName={currentUser.displayName}
        currentSaveHistory={currentUser.saveHistory}
        onSave={handleSaveProfile}
      />
      
      <HistoryDrawer 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
        lang={currentUser.lang}
      />
    </div>
  );
};
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);