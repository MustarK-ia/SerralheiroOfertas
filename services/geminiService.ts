import { GoogleGenAI } from "@google/genai";
import { SearchResult, Source } from "../types";

export const searchDeals = async (query: string): Promise<SearchResult> => {
  try {
    // Initialize the client inside the function to avoid initialization errors 
    // if process.env is not fully ready at module load time.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API_KEY is missing. Please check your Vercel Environment Variables.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey || '' });

    const prompt = `
      Você é um assistente especializado em compras para serralheiros profissionais.
      O usuário está procurando: "${query}".
      
      Sua tarefa:
      1. Pesquisar na internet por preços atuais, promoções, cupons de desconto e ofertas para este item ou categoria.
      2. Priorizar lojas confiáveis e conhecidas no mercado brasileiro (ex: Mercado Livre, Amazon, Loja do Mecânico, Leroy Merlin, sites de ferramentas especializados).
      3. Fornecer um resumo das melhores opções encontradas, incluindo preço (se disponível) e nome da loja.
      4. Mencionar qualquer código de cupom que encontrar.
      
      Formate a resposta de forma clara e direta, usando marcadores (bullets) para listar as ofertas.
      Mantenha um tom profissional e útil.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType cannot be JSON when using googleSearch
      },
    });

    const text = response.text || "Não foi possível encontrar informações no momento.";
    
    // Extract sources from grounding chunks
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Fonte Web",
            uri: chunk.web.uri || "#",
          });
        }
      });
    }

    // Remove duplicate sources based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i);

    return {
      text,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
};