import React, { useRef, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentAvatar: string | null;
  currentName: string;
  currentSaveHistory: boolean;
  onSave: (name: string, lang: Language, avatar: string | null, saveHistory: boolean) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  lang, 
  currentAvatar, 
  currentName,
  currentSaveHistory,
  onSave 
}) => {
  const t = translations[lang].profile;
  const tCommon = translations[lang].common;
  
  const [name, setName] = useState(currentName);
  const [selectedLang, setSelectedLang] = useState<Language>(lang);
  const [tempAvatar, setTempAvatar] = useState<string | null>(currentAvatar);
  const [saveHistory, setSaveHistory] = useState(currentSaveHistory);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setSelectedLang(lang);
      setTempAvatar(currentAvatar);
      setSaveHistory(currentSaveHistory);
    }
  }, [isOpen, currentName, lang, currentAvatar, currentSaveHistory]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(tCommon.image_too_large);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(name, selectedLang, tempAvatar, saveHistory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          {t.title}
        </h2>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-600 bg-slate-800 shadow-lg">
              {tempAvatar ? (
                <img src={tempAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-md border border-slate-700 transition-colors"
            >
              {t.upload_btn}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.display_name}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.placeholder_name}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.language}</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSelectedLang('en')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedLang === 'en' 
                    ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' 
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                English
              </button>
              <button 
                onClick={() => setSelectedLang('zh')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedLang === 'zh' 
                    ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' 
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                中文 (Chinese)
              </button>
            </div>
          </div>

          {/* Privacy / History Toggle */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.save_history}</label>
                <button 
                    onClick={() => setSaveHistory(!saveHistory)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${saveHistory ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${saveHistory ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>
             <p className="text-[10px] text-slate-500 leading-tight">
                 {t.save_history_desc}
             </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 transition-all"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};