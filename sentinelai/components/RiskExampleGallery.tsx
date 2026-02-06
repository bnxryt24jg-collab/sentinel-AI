import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface RiskExampleGalleryProps {
  onSelect: (prompt: string) => void;
  lang: Language;
}

export const RiskExampleGallery: React.FC<RiskExampleGalleryProps> = ({ onSelect, lang }) => {
  const t = translations[lang].gallery;

  const cards = [
    {
      id: 1,
      ...t.card1,
      color: "border-orange-500/30 hover:border-orange-500/60 bg-orange-900/5 hover:bg-orange-900/10",
      badgeColor: "bg-orange-900/40 text-orange-200 border-orange-700/50",
    },
    {
      id: 2,
      ...t.card2,
      color: "border-red-500/30 hover:border-red-500/60 bg-red-900/5 hover:bg-red-900/10",
      badgeColor: "bg-red-900/40 text-red-200 border-red-700/50",
    },
    {
      id: 3,
      ...t.card3,
      color: "border-purple-500/30 hover:border-purple-500/60 bg-purple-900/5 hover:bg-purple-900/10",
      badgeColor: "bg-purple-900/40 text-purple-200 border-purple-700/50",
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-16 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-lg md:text-xl font-bold text-yellow-500 mb-2 flex items-center justify-center gap-2">
           {t.title}
        </h2>
        <p className="text-slate-400 text-sm">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div 
            key={card.id}
            onClick={() => onSelect(card.prompt)}
            className={`cursor-pointer rounded-xl border p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group ${card.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                 <h3 className="font-bold text-slate-200 text-sm">{card.title}</h3>
              </div>
              
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 mb-4 whitespace-pre-line leading-relaxed group-hover:border-slate-700 transition-colors">
                 "{card.prompt}"
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {card.tags.map((tag, idx) => (
                  <span key={idx} className={`text-[10px] px-2 py-0.5 rounded border ${card.badgeColor}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center text-cyan-400 text-xs font-bold group-hover:text-cyan-300 transition-colors">
              {t.cta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};