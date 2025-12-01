import { GoogleGenAI } from "@google/genai";
import { SearchResult, Source } from "../types";

// Função de fallback para garantir que o app funcione mesmo sem API Key configurada (Modo Gratuito/Demo)
const getFallbackDeals = (query: string): SearchResult => {
  const q = query.toLowerCase();
  let text = `### Resultados Encontrados (Modo Offline)\n\nNão foi possível conectar à IA no momento, mas encontramos estas referências de mercado para **"${query}"**:\n\n`;
  
  const sources: Source[] = [
      { title: "Mercado Livre - Serralheria", uri: "https://www.mercadolivre.com.br/ferramentas-construcao/" },
      { title: "Loja do Mecânico", uri: "https://www.lojadomecanico.com.br/" },
      { title: "Palácio das Ferramentas", uri: "https://www.palaciodasferramentas.com.br/" }
  ];

  if (q.includes('solda') || q.includes('inversora')) {
    text += "*   **Inversora de Solda 160A Digital**\n    *   Preço Médio: R$ 450,00 - R$ 600,00\n    *   Lojas recomendadas: Loja do Mecânico, Mercado Livre\n    *   *Cupom sugerido: Tente 'FERRAMENTA10' em lojas parceiras.*\n\n";
    text += "*   **Máscara de Solda Automática**\n    *   Ofertas a partir de R$ 120,00\n    *   Disponibilidade: Alta\n";
  } else if (q.includes('disco') || q.includes('corte') || q.includes('lixa')) {
    text += "*   **Kit 10 Discos de Corte Inox 4.1/2\"**\n    *   Faixa de preço: R$ 35,00 - R$ 50,00 (Atacado)\n    *   Dica: Compre caixas fechadas para maior economia.\n\n";
    text += "*   **Disco Flap (Grão 40/80)**\n    *   Unidade: R$ 8,00 - R$ 12,00\n";
  } else if (q.includes('furadeira') || q.includes('parafusadeira')) {
    text += "*   **Parafusadeira/Furadeira de Impacto**\n    *   Marcas Custo-Benefício: Vonder, Philco (R$ 180,00 - R$ 250,00)\n    *   Marcas Profissionais: Makita, DeWalt (A partir de R$ 600,00)\n\n";
  } else {
    text += "*   **Busca Geral de Ferramentas**\n    *   Recomendamos navegar nas seções de 'Ofertas do Dia' dos sites listados abaixo.\n    *   Muitas lojas oferecem 5% a 10% de desconto no pagamento via PIX.\n";
  }
  
  text += "\n\n> *Nota: Configure uma chave de API válida para obter preços em tempo real.*";

  return {
    text,
    sources
  };
};

export const searchDeals = async (query: string): Promise<SearchResult> => {
  try {
    // Tenta obter a chave. Se não existir (undefined ou vazia), usa o fallback imediatamente.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.warn("API_KEY não encontrada. Usando modo fallback gratuito.");
      return getFallbackDeals(query);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Você é um assistente especializado em compras para serralheiros profissionais.
      O usuário está procurando: "${query}".
      
      Sua tarefa:
      1. Pesquisar na internet por preços atuais, promoções, cupons de desconto e ofertas para este item.
      2. Priorizar lojas confiáveis no Brasil (ex: Mercado Livre, Amazon, Loja do Mecânico, Leroy Merlin).
      3. Fornecer um resumo das melhores opções encontradas, com preço aproximado se disponível.
      
      Responda em formato de lista (bullets) simples e direta.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    
    if (!text) {
        // Se a IA retornar vazio, usa fallback
        return getFallbackDeals(query);
    }
    
    // Extrai fontes reais se disponíveis
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Oferta Online",
            uri: chunk.web.uri || "#",
          });
        }
      });
    }

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i);

    return {
      text,
      sources: uniqueSources.length > 0 ? uniqueSources : getFallbackDeals(query).sources,
    };

  } catch (error) {
    console.error("Erro na busca (API/Rede). Ativando modo fallback:", error);
    // Em caso de QUALQUER erro (falta de crédito, erro de rede, chave inválida), 
    // retorna o fallback para o usuário não ver tela de erro.
    return getFallbackDeals(query);
  }
};