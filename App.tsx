import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { QuickCategories } from './components/QuickCategories';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingState, SearchResult } from './types';
import { searchDeals } from './services/geminiService';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (query: string) => {
    setLoadingState(LoadingState.LOADING);
    setResult(null);

    try {
      const data = await searchDeals(query);
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-12">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 pt-8">
        <div className="flex flex-col items-center justify-center mb-8 text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
                Economize nas suas ferramentas
            </h2>
            <p className="text-slate-400 max-w-lg">
                Utilizamos a base de dados do Google para encontrar lojas confiáveis, descontos e cupons ativos para serralheiros.
            </p>
        </div>

        <div className="mb-10">
          <SearchBar onSearch={handleSearch} isLoading={loadingState === LoadingState.LOADING} />
          
          <QuickCategories 
            onSelect={handleSearch} 
            disabled={loadingState === LoadingState.LOADING} 
          />
        </div>

        {loadingState === LoadingState.LOADING && (
          <div className="flex flex-col items-center justify-center py-12 animate-pulse">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium">Buscando Ofertas no Google...</p>
            <p className="text-slate-500 text-sm mt-2">Verificando cupons e lojas confiáveis</p>
          </div>
        )}

        {loadingState === LoadingState.ERROR && (
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
             <p className="text-slate-300">Não foi possível completar a busca. Tente novamente.</p>
             <button 
                onClick={() => setLoadingState(LoadingState.IDLE)}
                className="mt-4 text-sm text-amber-500 hover:text-amber-400"
             >
                Voltar
             </button>
           </div>
        )}

        {loadingState === LoadingState.SUCCESS && result && (
          <ResultDisplay result={result} />
        )}
      </main>

      <footer className="text-center py-6 text-slate-500 text-sm border-t border-slate-800 mt-auto">
        <p>© {new Date().getFullYear()} SerralheiroOfertas. Buscas realizadas via Google Search.</p>
      </footer>
    </div>
  );
};

export default App;