import React, { useState, useMemo } from 'react';
import { ScanResult, RiskLevel, RiskTagType, Language } from '../types';
import { translations } from '../i18n';

interface RiskReportProps {
  result: ScanResult;
  onRemediate: () => void;
  isRemediating: boolean;
  lang: Language;
}

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.SAFE: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case RiskLevel.WARNING: return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
    case RiskLevel.CRITICAL: return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
    default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
  }
};

const getRiskTagColor = (tag: RiskTagType) => {
  switch (tag) {
    case RiskTagType.BoundaryMissing: return 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50';
    case RiskTagType.ActionAuthorization: return 'bg-red-900/40 text-red-300 border-red-700/50';
    case RiskTagType.DecisionEscalation: return 'bg-purple-900/40 text-purple-300 border-purple-700/50';
    case RiskTagType.InferenceOverreach: return 'bg-blue-900/40 text-blue-300 border-blue-700/50';
    case RiskTagType.CapabilityAmplification: return 'bg-pink-900/40 text-pink-300 border-pink-700/50';
    default: return 'bg-slate-800 text-slate-300';
  }
};

const getScoreFromRisk = (level: RiskLevel) => {
  if (level === RiskLevel.SAFE) return 95;
  if (level === RiskLevel.WARNING) return 55;
  return 15;
};

// Helper to get color class based on numeric score
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]';
  if (score >= 50) return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]';
  return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]';
};

const SEVERITY_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };

export const RiskReport: React.FC<RiskReportProps> = ({ result, onRemediate, isRemediating, lang }) => {
  const score = getScoreFromRisk(result.risk_level);
  const t = translations[lang].report;
  const tTags = translations[lang].risk_tags;
  const tSeverities = translations[lang].severities;
  const tLevels = translations[lang].risk_levels;
  
  // Filter States
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [filterImpact, setFilterImpact] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Privacy View State
  const [showRedacted, setShowRedacted] = useState(true);

  // Computed Options with Counts
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    result.risk_tags.forEach(t => {
      counts[t.severity] = (counts[t.severity] || 0) + 1;
    });
    return counts;
  }, [result]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    result.risk_tags.forEach(t => {
      counts[t.tag] = (counts[t.tag] || 0) + 1;
    });
    return counts;
  }, [result]);

  const impactCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    result.potential_impacts.forEach(i => {
        counts[i.impact_type] = (counts[i.impact_type] || 0) + 1;
    });
    return counts;
  }, [result]);

  const uniqueSeverities = useMemo(() => {
    return Object.keys(severityCounts).sort((a, b) => (SEVERITY_ORDER[b] || 0) - (SEVERITY_ORDER[a] || 0));
  }, [severityCounts]);

  const uniqueTags = useMemo(() => Object.keys(tagCounts).sort(), [tagCounts]);
  const uniqueImpacts = useMemo(() => Object.keys(impactCounts).sort(), [impactCounts]);

  // Filter Logic
  const filteredRiskTags = result.risk_tags.filter(tag => {
    const matchSeverity = filterSeverity === 'ALL' || tag.severity === filterSeverity;
    const matchTag = filterTag === 'ALL' || tag.tag === filterTag;
    const matchSearch = searchTerm === '' || 
                        tag.explanation.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        tag.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (tTags[tag.tag] || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSeverity && matchTag && matchSearch;
  });

  const filteredImpacts = result.potential_impacts.filter(impact => {
    const matchImpact = filterImpact === 'ALL' || impact.impact_type === filterImpact;
    const matchSearch = searchTerm === '' || 
                        impact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        impact.impact_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchImpact && matchSearch;
  });

  const resetFilters = () => {
    setFilterSeverity('ALL');
    setFilterTag('ALL');
    setFilterImpact('ALL');
    setSearchTerm('');
  };

  const hasActiveFilters = filterSeverity !== 'ALL' || filterTag !== 'ALL' || filterImpact !== 'ALL' || searchTerm !== '';

  // Gauge calculations
  const radius = 58; // Slightly larger
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColorClass = getScoreColor(score);

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up">
      
      {/* 1. Score & High Level Summary (Left Column) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Score Gauge */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm shadow-xl">
          <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-6 font-bold">{t.score_title}</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Gauge */}
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Track */}
                <circle 
                    cx="50%" cy="50%" r={radius} 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    fill="transparent" 
                    className="text-slate-800" 
                />
                {/* Active Ring */}
                <circle 
                    cx="50%" cy="50%" r={radius} 
                    stroke="currentColor" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeLinecap="round"
                    className={`${scoreColorClass} transition-all duration-1000 ease-out`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${scoreColorClass.split(' ')[0]}`}>
                    {score}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>

          <div className={`mt-6 px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide flex items-center gap-2 ${getRiskColor(result.risk_level)}`}>
            <span className={`w-2 h-2 rounded-full ${score >= 80 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-rose-500'} animate-pulse`}></span>
            {tLevels[result.risk_level] || result.risk_level}
          </div>
        </div>

        {/* Key Reason */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
           <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">{t.key_driver}</h4>
           <p className="text-white font-medium text-sm border-l-2 border-red-500 pl-3 leading-relaxed">
             {result.explanation_summary.key_reason}
           </p>
        </div>

        {/* Capabilities */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
           <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">{t.capabilities}</h4>
           <div className="flex flex-wrap gap-2">
             {result.granted_capabilities.map((cap, idx) => (
               <div key={idx} className="text-xs bg-slate-800 text-cyan-200 px-2 py-1 rounded border border-slate-700 hover:border-cyan-500/30 transition-colors">
                 {cap.type}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* 2. Detailed Risk Analysis (Center/Right) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        
        {/* Header Summary */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm shadow-lg">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-cyan-400">❖</span> {t.summary_title}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {result.explanation_summary.human_readable}
          </p>
        </div>

        {/* PRIVACY REDACTION LAYER (Conditional Feature) */}
        {result.pii_analysis?.has_pii && (
            <div className="bg-slate-900/40 border border-indigo-500/30 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="p-4 border-b border-slate-700/50 bg-indigo-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                    <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        {t.privacy.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        {t.privacy.dlp_note}
                    </p>
                    </div>
                    
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button 
                            onClick={() => setShowRedacted(false)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-all ${!showRedacted ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {t.privacy.original_view}
                        </button>
                        <button 
                            onClick={() => setShowRedacted(true)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-1 ${showRedacted ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            {t.privacy.redacted_view}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Text View */}
                    <div className="md:col-span-2 p-4 bg-slate-900/50 min-h-[120px] max-h-[200px] overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap border-r border-slate-700/50">
                        {showRedacted ? (
                            // Redacted View with Highlighting
                            <span>
                                {result.pii_analysis.redacted_text.split(/(\[.*?\])/g).map((part, i) => (
                                    part.startsWith('[') && part.endsWith(']') ? 
                                    <span key={i} className="text-indigo-400 font-bold bg-indigo-900/30 px-1 rounded mx-0.5">{part}</span> : 
                                    part
                                ))}
                            </span>
                        ) : (
                            // Original View
                            <span className="text-slate-400">{result.safe_prompt_rewrite.rewritten_prompt}</span>
                        )}
                    </div>

                    {/* Detected Items List */}
                    <div className="md:col-span-1 p-4 bg-slate-900/30">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t.privacy.detected_label}</h4>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                            {result.pii_analysis.detected_items.map((item, idx) => (
                                <div key={idx} className="flex flex-col bg-slate-800 rounded px-2 py-1.5 border border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-indigo-300 font-bold">{item.redacted_label}</span>
                                        <span className="text-[9px] text-slate-500">{item.type}</span>
                                    </div>
                                    {!showRedacted && (
                                        <div className="text-[10px] text-red-400 font-mono mt-0.5 break-all bg-black/20 px-1 rounded">
                                            {item.original}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Dynamic Rehydration Note */}
                <div className="p-2 bg-indigo-900/5 border-t border-slate-700/50 text-center">
                    <p className="text-[9px] text-indigo-400/70">{t.privacy.rehydrate_note}</p>
                </div>
            </div>
        )}

        {/* Filters Toolbar */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-3 flex flex-col md:flex-row gap-3 items-center text-sm">
            <div className="flex items-center gap-2 w-full md:w-auto">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-slate-400 text-xs uppercase font-bold whitespace-nowrap">{t.filters.label}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto flex-1">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[140px]">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t.filters.search_placeholder}
                        className="w-full bg-slate-950/50 text-slate-200 border border-slate-700 rounded px-3 py-1.5 pl-8 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                    />
                    <svg className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Severity Filter */}
                <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1.5 focus:border-cyan-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                <option value="ALL">{t.filters.severity}: {t.filters.all}</option>
                {uniqueSeverities.map(s => (
                    <option key={s} value={s}>{tSeverities[s] || s} ({severityCounts[s]})</option>
                ))}
                </select>

                {/* Tag Type Filter */}
                <select 
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1.5 focus:border-cyan-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                <option value="ALL">{t.filters.category}: {t.filters.all}</option>
                {uniqueTags.map(tag => (
                    <option key={tag} value={tag}>{tTags[tag] || tag} ({tagCounts[tag]})</option>
                ))}
                </select>

                {/* Impact Filter */}
                <select 
                value={filterImpact}
                onChange={(e) => setFilterImpact(e.target.value)}
                className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1.5 focus:border-cyan-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                <option value="ALL">{t.filters.impact}: {t.filters.all}</option>
                {uniqueImpacts.map(i => (
                    <option key={i} value={i}>{i} ({impactCounts[i]})</option>
                ))}
                </select>
            </div>

            {hasActiveFilters && (
               <button 
                 onClick={resetFilters}
                 className="ml-auto text-cyan-400 hover:text-cyan-300 text-xs font-bold px-2 py-1 rounded hover:bg-cyan-900/30 transition-colors flex items-center gap-1"
               >
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 {t.filters.reset}
               </button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Tags Column */}
          <div className="space-y-4">
             <h4 className="text-slate-400 text-xs uppercase tracking-wider flex items-center gap-2 font-semibold">
               <span>{t.risk_patterns}</span>
               <span className="bg-slate-800 text-slate-400 px-1.5 rounded-full text-[10px]">{filteredRiskTags.length}</span>
             </h4>
             {filteredRiskTags.length > 0 ? (
                filteredRiskTags.map((tag, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border flex flex-col gap-2 ${getRiskTagColor(tag.tag)} animate-fade-in transition-all hover:scale-[1.01]`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">{tTags[tag.tag] || tag.tag}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/30`}>
                       {tSeverities[tag.severity] || tag.severity}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {tag.explanation}
                    </p>
                  </div>
                ))
             ) : (
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-500 text-sm text-center">
                  {t.risk_patterns_none}
                </div>
             )}
          </div>

          {/* Impact & Mitigation Column */}
          <div className="space-y-6">
             {/* Impacts */}
             <div>
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">{t.impact_title}</h4>
                <div className="space-y-2">
                  {filteredImpacts.length > 0 ? (
                    filteredImpacts.map((impact, idx) => (
                      <div key={idx} className="flex gap-3 text-sm p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 animate-fade-in hover:border-red-500/20 transition-colors">
                         <span className="text-red-400 font-bold">⚠</span>
                         <div>
                           <span className="text-slate-200 font-medium block text-xs mb-0.5">{impact.impact_type}</span>
                           <span className="text-slate-400 text-xs">{impact.description}</span>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-500 text-xs text-center">
                      {t.impact_none}
                    </div>
                  )}
                </div>
             </div>

             {/* Mitigation */}
             <div>
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">{t.mitigation_title}</h4>
                <div className="space-y-2">
                  {result.mitigation_suggestions.map((sugg, idx) => (
                    <div key={idx} className="flex gap-3 text-sm p-3 bg-cyan-950/30 rounded-lg border border-cyan-900/50 hover:border-cyan-500/30 transition-colors">
                       <span className="text-cyan-400 font-bold">🛡</span>
                       <div>
                         <span className="text-cyan-200 font-medium block text-xs mb-0.5">{sugg.type}</span>
                         <span className="text-slate-400 text-xs">{sugg.suggestion}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onRemediate}
          disabled={isRemediating}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30"
        >
          {isRemediating ? (
             <>
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             {t.button_loading}
           </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              <span>{t.button_fix}</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};