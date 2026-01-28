import { GoogleGenerativeAI } from "@google/generative-ai";
import { OnboardingData } from "../types";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("Gemini API Key is missing. Affirmations will not be generated.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface Affirmation {
    id: string;
    text: string;
    category?: string;
}

/**
 * Generates a batch of affirmations to optimize API usage and prevent rate limits.
 */
export const generateAffirmationsBatch = async (userData: OnboardingData, count: number = 5): Promise<Affirmation[]> => {
    try {
        if (!API_KEY) {
            throw new Error("API Key missing");
        }

        const themes = [
            "gratitud", "fuerza interior", "esperanza", "calma", "éxito",
            "amor propio", "confianza", "presente", "superación", "paz mental",
            "propósito", "valentía", "claridad", "autocuidado", "resiliencia",
            "creatividad", "equilibrio", "libertad", "sabiduría", "autenticidad"
        ];
        // Shuffle themes
        const shuffledThemes = themes.sort(() => 0.5 - Math.random()).slice(0, count);

        // STRATEGY: PLAIN TEXT + SEPARATORS (NO JSON)
        // High-End Copywriting persona for premium feel.
        const prompt = `
      Eres un experto redactor de contenido "premium" para una app de bienestar y mindfulness de alto nivel.
      Tu objetivo es generar afirmaciones que vendan, que impacten y que se sientan profundas y elegantes.
      
      Usuario: ${userData.name}, Edad: ${userData.ageRange}.
      Temas sugeridos: ${shuffledThemes.join(", ")}.

      ESTILO "PREMIUM" (OBLIGATORIO):
      - Frases CORTAS y PODEROSAS (Máximo 10 palabras).
      - Tono: Seguro, calmado, elegante y directo al corazón.
      - Gramática PERFECTA.
      - EVITA lo cursi, lo genérico o lo infantil.
      - EVITA "Intro" o "Relleno". Solo la frase.

      REGLAS DE VARIEDAD (CRÍTICO):
      - NUNCA repitas las mismas palabras clave entre afirmaciones
      - PROHIBIDO usar palabras cliché como: "abundancia", "irradia", "fluye", "energía positiva", "universo"
      - Usa vocabulario DIVERSO, natural y específico
      - Cada frase debe tener estructura sintáctica DIFERENTE
      - NO cambies solo 1-2 palabras de la misma frase base
      - Piensa en afirmaciones completamente ÚNICAS en contenido y forma

      EJEMPLOS DE ESTILO (Nota la VARIEDAD de estructura):
      - "Mi trabajo es una fuente de satisfacción y orgullo."
      - "Soy fuerte y resiliente en tiempos dificiles."
      - "Soy merecedor de relaciones que me nutren."
      - "Siempre estaré orgulloso de todo lo que he logrado."
      - "Está bien tener miedo."
      - "Mis problemas están llegando a su fin."
      - "La ansiedad no controla mis acciones."
      - "Acepto conscientemente todo lo que es bueno."

      INSTRUCCIONES TÉCNICAS:
      1. Genera ${count} afirmaciones distintas.
      2. Separa cada frase EXACTAMENTE con "|||".
      3. NO uses comillas, ni números, ni guiones al inicio.
      4. NUNCA rompas la línea en mitad de la frase.
      
      Salida esperada:
      Frase 1...|||Frase 2...|||Frase 3...
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // 1. Split by separator
        let rawAffirmations = text.split("|||");

        // Fallback: if separator failed, try splitting by newlines
        if (rawAffirmations.length <= 1 && text.includes("\n")) {
            rawAffirmations = text.split("\n");
        }

        const cleanAffirmations = rawAffirmations
            .map(t => {
                // A. Aggressive cleanup of wrapper characters AND leading punctuation
                // Remove internal newlines to prevent weird breaking
                let cleaned = t.replace(/[\n\r]+/g, ' ').trim();

                // Remove leading quotes, dashes, numbers, COMMAS, dots
                cleaned = cleaned.replace(/^["'\-\d\.,\s]+/, '');

                // Remove trailing quotes
                cleaned = cleaned.replace(/["']+$/, '');

                // B. Remove internal quotes weirdness
                cleaned = cleaned.replace(/["'«»“”]/g, '');

                // C. THE KILLER FIX: Check for trailing garbage
                const words = cleaned.split(/\s+/);
                if (words.length > 1) {
                    const lastWord = words[words.length - 1];
                    // Regex: single letter, case insensitive. 
                    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(lastWord)) {
                        words.pop();
                        cleaned = words.join(" ");
                    }
                }

                return cleaned.trim();
            })
            .filter(t => t.length > 10) // Filter out too short garbage
            .map(t => {
                // D. Ensure valid punctuation
                if (!/[.!?,]$/.test(t)) {
                    return t + ".";
                }
                return t;
            });

        // Ensure we strictly respect the requested count if we got more
        const finalAffirmations = cleanAffirmations.slice(0, count);

        if (finalAffirmations.length === 0) throw new Error("No valid affirmations parsing result");

        return finalAffirmations.map(t => ({
            id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
            text: t,
            category: "Personalizado"
        }));

    } catch (error) {
        console.warn("Error generating batch (Strict Mode), using local fallback:", error);

        const fallbacks = [
            "Soy capaz de superar cualquier desafío.",
            "Merezco todo lo bueno.",
            "Mi paz interior es prioridad.",
            "Cada día es una nueva oportunidad.",
            "Confío en mi intuición.",
            "Soy suficiente tal y como soy.",
            "Atraigo energía positiva.",
            "Me perdono y avanzo.",
            "Acepto mis emociones.",
            "Crezco con cada paso."
        ];

        const shuffled = fallbacks.sort(() => 0.5 - Math.random()).slice(0, Math.min(count, fallbacks.length));

        return shuffled.map(t => ({
            id: Date.now().toString() + "-fallback-" + Math.random().toString(36).substr(2, 9),
            text: t,
            category: "Fallback"
        }));
    }
};

/**
 * Legacy single generation - now uses the batch function under the hood.
 */
export const generateAffirmation = async (userData: OnboardingData, context?: string): Promise<Affirmation> => {
    const batch = await generateAffirmationsBatch(userData, 1);
    return batch[0];
};
