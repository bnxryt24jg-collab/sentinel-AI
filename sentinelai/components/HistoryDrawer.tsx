import React from 'react';
import { HistoryItem, Language, RiskLevel } from '../types';
import { translations } from '../i18n';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onDeleteItem: (id: string) => void;
  lang: Language;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onSelect, onClear, onDeleteItem, lang }) => {
  const t = translations[lang].history;
  const tLevels = translations[lang].risk_levels;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        {/* Drawer */}
        <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col animate-fade-in-right">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.title}
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {history.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm py-10 flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {t.empty}
                    </div>
                ) : (
                    history.map(item => (
                        <div 
                            key={item.id} 
                            className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 group relative hover:bg-slate-800 hover:border-cyan-500/50 transition-all"
                        >
                            <div className="cursor-pointer" onClick={() => { onSelect(item); onClose(); }}>
                                <div className="flex justify-between items-start mb-2 pr-6">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                        item.riskLevel === RiskLevel.SAFE ? 'bg-green-900/30 text-green-400 border border-green-700/50' :
                                        item.riskLevel === RiskLevel.WARNING ? 'bg-orange-900/30 text-orange-400 border border-orange-700/50' :
                                        'bg-red-900/30 text-red-400 border border-red-700/50'
                                    }`}>
                                        {tLevels[item.riskLevel] || item.riskLevel}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-sm line-clamp-2 mb-2 font-mono text-xs opacity-80 group-hover:opacity-100 transition-opacity ${!item.rawText ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                                    {item.rawText ? item.rawText.substring(0, 80) : t.privacy_placeholder}
                                </p>
                                {item.remediationResult && (
                                    <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-900/10 inline-block px-1.5 py-0.5 rounded border border-green-900/30">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {t.remediated}
                                    </div>
                                )}
                            </div>

                            {/* Delete Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm(t.delete_item_confirm)) {
                                        onDeleteItem(item.id);
                                    }
                                }}
                                className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900/50 hover:bg-slate-900 rounded opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-900/50"
                                title="Delete Log"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {history.length > 0 && (
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <button 
                        onClick={() => {
                            if (window.confirm(t.delete_confirm)) {
                                onClear();
                            }
                        }}
                        className="w-full py-2 text-xs font-bold text-red-400 hover:bg-red-900/20 rounded border border-transparent hover:border-red-900/30 transition-all"
                    >
                        {t.clear}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};