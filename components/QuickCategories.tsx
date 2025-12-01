import React from 'react';
import { QuickCategory } from '../types';

interface QuickCategoriesProps {
  onSelect: (query: string) => void;
  disabled: boolean;
}

const CATEGORIES: QuickCategory[] = [
  { id: '1', label: 'Máquinas de Solda', query: 'Melhores preços máquina de solda inversora serralheria', icon: '⚡' },
  { id: '2', label: 'Discos de Corte', query: 'Promoção disco de corte inox 4.1/2 atacado', icon: '💿' },
  { id: '3', label: 'Furadeiras', query: 'Ofertas furadeira impacto profissional', icon: '🛠️' },
  { id: '4', label: 'Fechaduras', query: 'Preço fechadura elétrica portão serralheria', icon: '🔒' },
];

export const QuickCategories: React.FC<QuickCategoriesProps> = ({ onSelect, disabled }) => {
  return (
    <div className="mt-6">
      <p className="text-sm text-slate-400 mb-3 font-medium">Buscas Rápidas</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.query)}
            disabled={disabled}
            className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-all text-sm text-slate-300 hover:text-white text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};