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

        const themes = ["gratitud", "fuerza interior", "esperanza", "calma", "éxito", "amor propio", "abundancia", "merecimiento", "presente", "confianza"];
        // Shuffle themes
        const shuffledThemes = themes.sort(() => 0.5 - Math.random()).slice(0, count);

        // STRATEGY: PLAIN TEXT + SEPARATORS (NO JSON)
        // This avoids syntax errors and "hallucinated" closing characters common in JSON responses.
        const prompt = `
      Eres una IA compasiva y motivadora llamada Lio.
      Genera ${count} afirmaciones para: ${userData.name}, Edad: ${userData.ageRange}.
      Temas: ${shuffledThemes.join(", ")}.

      INSTRUCCIONES ESTRICTAS:
      1. Devuelve las frases en TEXTO PLANO.
      2. Separa cada frase EXACTAMENTE con "|||".
      3. NO numeres las frases (ni 1. ni -).
      4. NADA de comillas, corchetes o JSON.
      5. GRAMÁTICA PERFECTA. 
      6. IMPACTO INMEDIATO: Frases MUY CORTAS (máximo 8 palabras). Directas al corazón.
      7. CUIDADO AL FINAL: Asegúrate de que la frase termine en una palabra completa y un punto. NO pongas letras sueltas.

      Ejemplo de salida correcta:
      Soy fuerte y capaz|||Merezco paz y amor|||Hoy es un gran día
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
                // A. Aggressive cleanup of wrapper characters
                let cleaned = t.trim().replace(/^["'\-\d\.]+|["'\-\d\.]+$/g, '').trim(); // Remove leading/trailing quotes, numbers, dashes

                // B. Remove internal quotes
                cleaned = cleaned.replace(/["'«»“”]/g, '');

                // C. THE KILLER FIX: Check for trailing garbage
                // Split into words
                const words = cleaned.split(/\s+/);

                // If the last word is 1 char long and NOT "a" or "y" (very rare to end in these anyway), KILL IT.
                // Examples: "paso D", "vida s"
                if (words.length > 1) {
                    const lastWord = words[words.length - 1];
                    // Regex: single letter, case insensitive. 
                    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(lastWord)) {
                        // Remove last word
                        words.pop();
                        cleaned = words.join(" ");
                    }
                }

                return cleaned;
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
