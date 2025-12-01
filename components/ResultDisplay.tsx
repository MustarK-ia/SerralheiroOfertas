import React from 'react';
import { SearchResult } from '../types';

interface ResultDisplayProps {
  result: SearchResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  // Simple function to convert basic markdown-like syntax to JSX
  // This is a lightweight alternative to importing a heavy markdown library
  const renderText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold headings or keys
      if (line.startsWith('**') || line.startsWith('##') || line.trim().endsWith(':')) {
        return <h3 key={index} className="text-amber-400 font-semibold mt-4 mb-2 text-lg">{line.replace(/[#*]/g, '')}</h3>;
      }
      // List items
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
         return (
           <li key={index} className="ml-4 pl-2 border-l-2 border-slate-700 text-slate-300 mb-2 py-1">
             {line.replace(/^[\*\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, (match, p1) => p1)} 
             {/* Note: The simplistic regex above removes bold markers for clean text, a full parser would bold them. */}
           </li>
         );
      }
      // Empty lines
      if (!line.trim()) return <div key={index} className="h-2" />;
      
      // Paragraphs
      return <p key={index} className="text-slate-300 mb-2 leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, (match, p1) => p1)}</p>;
    });
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        
        {/* Header of the Result Card */}
        <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resultados Encontrados
            </h2>
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded">Gemini AI</span>
        </div>

        <div className="p-6">
          {/* Main AI Text Content */}
          <div className="prose prose-invert max-w-none">
            <ul className="list-none p-0 m-0">
                {renderText(result.text)}
            </ul>
          </div>
        </div>

        {/* Sources Section */}
        {result.sources.length > 0 && (
          <div className="bg-slate-900 p-6 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                Fontes Verificadas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/30 transition-all group"
                >
                  <span className="text-sm text-slate-300 truncate font-medium group-hover:text-amber-400 transition-colors">
                    {source.title}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};