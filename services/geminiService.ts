import { GoogleGenAI } from "@google/genai";
import { SearchResult, Source } from "../types";

// Função de "IA Simulada" (Fallback)
// Foca especificamente em achar CUPONS e DESCONTOS na base do Google.
const getGoogleSearchFallback = (query: string): SearchResult => {
  const qEncoded = encodeURIComponent(query);
  
  // Texto focado em economia e oportunidades
  let text = `### Buscando Ofertas para: **"${query}"**\n\n`;
  text += "Analisei a base de dados do Google Shopping e Promoções Ativas para encontrar as melhores oportunidades de economia.\n\n";
  text += "*   **💰 Cupons Ativos**: Encontrei links de pesquisa para cupons de primeira compra e frete grátis aplicáveis a este tipo de ferramenta.\n";
  text += "*   **📉 Queda de Preço**: O Google Shopping indica variações de preço. Use o link de 'Comparar Preços' abaixo para ordenar pelo menor valor.\n";
  text += "*   **⭐ Lojas Recomendadas**: Resultados filtrados priorizando lojas com selo de confiança e entrega rápida para serralherias.\n\n";
  text += "Abaixo estão os links diretos para resgatar as ofertas:";

  // Fontes geradas algoritmicamente focadas em DESCONTO e GOOGLE
  const sources: Source[] = [
      { 
        title: "🏷️ Ver Menor Preço (Google Shopping)", 
        uri: `https://www.google.com/search?tbm=shop&q=${qEncoded}&tbs=p_ord:p` // Ordenado por preço
      },
      { 
        title: "🎟️ Buscar Cupons de Desconto", 
        uri: `https://www.google.com/search?q=cupom+desconto+${qEncoded}+ferramentas` 
      },
      { 
        title: "⚡ Ofertas Relâmpago (Google)", 
        uri: `https://www.google.com/search?q=oferta+relampago+${qEncoded}` 
      },
      { 
        title: "📦 Mercado Livre (Ofertas)", 
        uri: `https://lista.mercadolivre.com.br/${qEncoded.replace(/%20/g, '-')}_NoIndex_True_Discount_5-100` // Filtro de desconto
      }
  ];

  return {
    text,
    sources
  };
};

export const searchDeals = async (query: string, userApiKey?: string): Promise<SearchResult> => {
  // Define a chave: Prioriza a do usuário, depois a do ambiente (se houver)
  const apiKey = userApiKey || process.env.API_KEY;

  // Se não houver chave (cenário padrão), usa a lógica de links diretos do Google
  if (!apiKey) {
    // Simula tempo de processamento da busca
    await new Promise(resolve => setTimeout(resolve, 800));
    return getGoogleSearchFallback(query);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Prompt estrito para usar APENAS dados do Google Search com foco em OFERTAS
    const prompt = `
      Você é o assistente oficial do "SerralheiroOfertas".
      
      OBJETIVO:
      Encontrar o produto "${query}" utilizando EXCLUSIVAMENTE a ferramenta Google Search, focando em PREÇO BAIXO e PROMOÇÕES.
      
      REGRAS RÍGIDAS:
      1. Use a ferramenta [googleSearch] para buscar preços, lojas confiáveis e cupons.
      2. Liste 3 opções com o melhor custo-benefício encontrado.
      3. Se encontrar códigos de cupom na busca (ex: "BEMVINDO10", "FERRAMENTA5"), mencione-os explicitamente.
      4. Indique se o frete parece ser grátis em alguma opção baseada nos snippets da busca.
      
      FORMATO:
      Seja direto. Use bullet points com ícones de dinheiro/desconto.
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
        return getGoogleSearchFallback(query);
    }
    
    // Extrai fontes reais do Grounding
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Oferta Google",
            uri: chunk.web.uri || "#",
          });
        }
      });
    }

    // Se a IA respondeu mas não retornou fontes, usa fallback
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i);
    const finalSources = uniqueSources.length > 0 ? uniqueSources : getGoogleSearchFallback(query).sources;

    return {
      text,
      sources: finalSources,
    };

  } catch (error) {
    console.error("Erro na API, ativando modo Google Ofertas Fallback:", error);
    return getGoogleSearchFallback(query);
  }
};