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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setLoadingState(LoadingState.LOADING);
    setResult(null);
    setErrorMsg(null);

    try {
      const data = await searchDeals(query);
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMsg("Ocorreu um erro ao buscar ofertas. Verifique a conexão ou a Chave de API e tente novamente.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-12">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 pt-8">
        <div className="flex flex-col items-center justify-center mb-8 text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
                Encontre o melhor preço
            </h2>
            <p className="text-slate-400 max-w-lg">
                Pesquisamos em centenas de sites confiáveis para achar ferramentas, insumos e ofertas exclusivas para sua serralheria.
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
            <p className="text-slate-400 font-medium">Analisando o mercado...</p>
            <p className="text-slate-500 text-sm mt-2">Buscando descontos e lojas confiáveis</p>
          </div>
        )}

        {loadingState === LoadingState.ERROR && (
           <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
             <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
             </div>
             <p className="text-red-200 font-medium">{errorMsg}</p>
             <button 
                onClick={() => setLoadingState(LoadingState.IDLE)}
                className="mt-4 text-sm text-red-300 hover:text-white underline underline-offset-2"
             >
                Tentar novamente
             </button>
           </div>
        )}

        {loadingState === LoadingState.SUCCESS && result && (
          <ResultDisplay result={result} />
        )}
      </main>

      <footer className="text-center py-6 text-slate-500 text-sm border-t border-slate-800 mt-auto">
        <p>© {new Date().getFullYear()} SerralheiroOfertas AI. Resultados baseados em pesquisa Google.</p>
      </footer>
    </div>
  );
};

export default App;