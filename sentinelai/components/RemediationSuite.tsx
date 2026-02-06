import React, { useState, useEffect } from 'react';
import { HardenedResult, AttackSimulation, Language, FixCategory } from '../types';
import { translations } from '../i18n';

interface RemediationSuiteProps {
  remediation: HardenedResult;
  onVerify: () => void;
  verificationResult: AttackSimulation | null;
  isVerifying: boolean;
  lang: Language;
  onReset: () => void;
}

export const RemediationSuite: React.FC<RemediationSuiteProps> = ({ remediation, onVerify, verificationResult, isVerifying, lang, onReset }) => {
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'swift'>('python');
  
  // Local state to handle client-side token rotation without re-fetching
  const [currentHardenedPrompt, setCurrentHardenedPrompt] = useState(remediation.hardenedPrompt);
  const [currentIntegrationCode, setCurrentIntegrationCode] = useState(remediation.integrationCode);
  const [copied, setCopied] = useState(false);

  const t = translations[lang].remediate;

  useEffect(() => {
    setCurrentHardenedPrompt(remediation.hardenedPrompt);
    setCurrentIntegrationCode(remediation.integrationCode);
  }, [remediation]);

  const rotateSecurityToken = () => {
    // Generate a new random token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    const randomValues = new Uint32Array(32);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < 32; i++) {
        randomPart += chars.charAt(randomValues[i] % chars.length);
    }
    const newSeparator = `___SENTINEL_HASH_${randomPart}___`;

    // Regex to find existing separator: ___SENTINEL_HASH_...___
    const separatorRegex = /___SENTINEL_HASH_[a-zA-Z0-9]+___/g;

    setCurrentHardenedPrompt(prev => prev.replace(separatorRegex, newSeparator));
    
    setCurrentIntegrationCode(prev => ({
        python: prev.python.replace(separatorRegex, newSeparator),
        node: prev.node.replace(separatorRegex, newSeparator),
        swift: prev.swift.replace(separatorRegex, newSeparator)
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentHardenedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFixIcon = (category: FixCategory) => {
    switch(category) {
      case 'Prompt Constraint': return '📐';
      case 'Skill Restriction': return '🚫';
      case 'Human Confirmation': return '👤';
      case 'Refusal Condition': return '🛑';
      default: return '🛡';
    }
  };

  const getFixColor = (category: FixCategory) => {
    switch(category) {
      case 'Prompt Constraint': return 'bg-blue-900/30 border-blue-500/30 text-blue-300';
      case 'Skill Restriction': return 'bg-orange-900/30 border-orange-500/30 text-orange-300';
      case 'Human Confirmation': return 'bg-purple-900/30 border-purple-500/30 text-purple-300';
      case 'Refusal Condition': return 'bg-red-900/30 border-red-500/30 text-red-300';
      default: return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-green-400">✓</span> {t.header_title}
        </h2>
        
        <div className="flex items-center gap-3">
            {verificationResult ? (
               <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${verificationResult.success ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                 {verificationResult.success ? (
                   <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t.shield_active}
                   </>
                 ) : (
                    <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {t.breach_detected}
                   </>
                 )}
               </div>
            ) : (
              <button 
                onClick={onVerify}
                disabled={isVerifying}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isVerifying ? t.sim_loading : t.sim_button}
              </button>
            )}

            <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>

            <button 
                onClick={onReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                title={t.new_scan}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden md:inline">{t.new_scan}</span>
            </button>
        </div>
      </div>

      {/* Verification Log */}
      {verificationResult && (
        <div className="w-full bg-black/40 border border-slate-700 rounded-lg p-4 font-mono text-xs">
           <p className="text-slate-400 mb-1">$ {t.sim_log_start} --target=new_prompt</p>
           <p className="text-red-400 mb-1">{`> ${t.log_input}: "${verificationResult.attackPrompt}"`}</p>
           <p className="text-green-400 mb-1">{`> ${t.log_output}: "${verificationResult.defenseResponse.substring(0, 100)}..."`}</p>
           <p className={`mt-2 ${verificationResult.success ? 'text-green-500' : 'text-red-500'}`}>
             {t.log_result}: {verificationResult.success ? t.sim_log_result_success : t.sim_log_result_fail}
           </p>
        </div>
      )}

      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vulnerable */}
        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 font-bold text-sm tracking-wider">{t.vuln_source}</span>
          </div>
          <div className="flex-1 bg-black/50 rounded-lg p-4 overflow-y-auto border border-red-500/20">
            <pre className="whitespace-pre-wrap text-slate-300 font-mono text-sm">{remediation.originalPrompt}</pre>
          </div>
        </div>

        {/* Hardened */}
        <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-4 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 font-bold text-sm tracking-wider">{t.hardened_source}</span>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleCopy}
                    className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                        copied 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Copied!
                        </>
                    ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          {t.copy}
                        </>
                    )}
                </button>
                <button 
                    onClick={rotateSecurityToken}
                    className="text-[10px] bg-cyan-900 hover:bg-cyan-800 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/50 flex items-center gap-1 transition-colors"
                    title="Generate new high-entropy separator"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    {t.rotate_key}
                </button>
                <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded border border-green-500/50">{t.xml_tag}</span>
            </div>
          </div>
          <div className="flex-1 bg-black/50 rounded-lg p-4 overflow-y-auto border border-green-500/20 relative group">
            <pre className="whitespace-pre-wrap text-green-100 font-mono text-sm">{currentHardenedPrompt}</pre>
          </div>
        </div>
      </div>

      {/* Security Architecture Fixes (Structured) */}
      <div className="space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          {t.arch_changes}
        </h3>
        
        {remediation.fix_details && remediation.fix_details.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {remediation.fix_details.map((fix, idx) => (
              <div key={idx} className={`p-4 rounded-lg border flex flex-col gap-2 ${getFixColor(fix.category)} transition-all hover:scale-[1.01]`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getFixIcon(fix.category)}</span>
                  <span className="font-bold text-sm uppercase tracking-wide">
                    {t.fix_categories[fix.category] || fix.category}
                  </span>
                </div>
                <p className="text-sm opacity-90 leading-relaxed pl-8">
                  {fix.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-300 text-sm leading-relaxed">{remediation.explanation}</p>
          </div>
        )}
      </div>

      {/* Code Integration */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-700">
          {(['python', 'node', 'swift'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setActiveTab(l)}
              className={`px-6 py-3 text-sm font-mono uppercase transition-colors ${
                activeTab === l 
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {t.code_tabs[l]}
            </button>
          ))}
        </div>
        <div className="p-0 bg-slate-950">
          <pre className="p-6 overflow-x-auto text-sm font-mono text-blue-300">
            {currentIntegrationCode[activeTab]}
          </pre>
        </div>
      </div>

    </div>
  );
};